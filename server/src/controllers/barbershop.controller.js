const prisma = require('../lib/prisma');
const saasPlans = require('../config/saasPlans');
const { generateUniqueSlug, slugify } = require('../utils/slugGenerator');
const { geocodeAddress } = require('../utils/geocoder');

// Helper: Unified Sorting Logic for Barbershops
function sortBarbershopsByRatingAndAge(barbershops) {
    return barbershops.sort((a, b) => {
        // Priority 1: Has Reviews > No Reviews
        if (a.hasRealReviews && !b.hasRealReviews) return -1;
        if (!a.hasRealReviews && b.hasRealReviews) return 1;

        if (a.hasRealReviews && b.hasRealReviews) {
            // Priority 2: Sort by Avg Rating (DESC)
            if (b.averageRating !== a.averageRating) {
                return b.averageRating - a.averageRating;
            }
            // Tie-breaker: Total Reviews count (DESC)
            return b.totalReviews - a.totalReviews;
        }

        // Priority 3: No reviews - Created Date (ASC - Older first)
        return new Date(a.createdAt) - new Date(b.createdAt);
    });
}

// Helper: Sophisticated Recommendation Scoring (Quality + Trending + Newness)
function calculateRecommendationScore(shop, trendingCount, globalAvgRating) {
    // 1. Bayesian Rating: (v * R + m * C) / (v + m)
    // v = count of reviews, R = shop avg, m = min reviews (5), C = global mean (4.5)
    const v = shop.totalReviews || 0;
    const R = shop.averageRating || 0;
    const m = 5; 
    const C = globalAvgRating || 4.5;
    
    const bayesianRating = (v * R + m * C) / (v + m);
    
    // 2. Trending Score: Recent bookings in last 7 days
    const trendingScore = Math.min(trendingCount * 2, 20); // Cap trending impact to prevent gaming
    
    // 3. Newcomer Bonus: Boost shops created in the last 15 days
    const isNewcomer = (new Date() - new Date(shop.createdAt)) / (1000 * 60 * 60 * 24) <= 15;
    const newcomerBonus = isNewcomer ? 15 : 0;

    // Final Score Calculation
    // Base is BayesianRating (0-50 range after * 10) + Trending (0-20) + Newcomer (0/15)
    return (bayesianRating * 10) + trendingScore + newcomerBonus;
}

// Public: Search Barbershops
const searchBarbershops = async (req, res) => {
    try {
        const { term, type, city, lat, lng } = req.query; // type: NAME, CITY, NEARBY
        const userLat = lat ? parseFloat(lat) : null;
        const userLng = lng ? parseFloat(lng) : null;

        let where = { subscriptionStatus: { in: ['ACTIVE', 'TRIAL'] } };

        // 1. Types of Search Filters
        if ((type === 'CITY' || city) && (term || city)) {
            const cityTerm = term || city;
            where.OR = [
                { city: { contains: cityTerm, mode: 'insensitive' } },
                { address: { contains: cityTerm, mode: 'insensitive' } }
            ];
        } else if (term) {
            where.OR = [
                { name: { contains: term, mode: 'insensitive' } },
                { commercialName: { contains: term, mode: 'insensitive' } },
                { slug: { contains: term, mode: 'insensitive' } },
                { address: { contains: term, mode: 'insensitive' } }
            ];
        }

        // 2. Fetch all matching candidates (no premature limit to handle geolocation correctly)
        const barbershops = await prisma.barbershop.findMany({
            where,
            select: {
                id: true,
                name: true,
                slug: true,
                address: true,
                logoUrl: true,
                latitude: true,
                longitude: true,
                createdAt: true,
                services: {
                    take: 1,
                    where: { active: true },
                    select: { id: true, name: true, price: true }
                }
            }
        });

        // 3. Fetch aggregated ratings
        const shopIds = barbershops.map(s => s.id);
        const ratingsData = await prisma.review.groupBy({
            by: ['barbershopId'],
            where: { barbershopId: { in: shopIds } },
            _avg: { rating: true },
            _count: { rating: true }
        });

        const ratingsMap = ratingsData.reduce((acc, curr) => {
            acc[curr.barbershopId] = {
                avg: curr._avg.rating || 0,
                count: curr._count.rating || 0
            };
            return acc;
        }, {});

        // 4. Map Distance & Ratings
        let processedShops = barbershops.map(shop => {
            let distance = null;
            if (userLat && userLng && shop.latitude && shop.longitude) {
                distance = calculateDistance(userLat, userLng, shop.latitude, shop.longitude);
            }

            const ratingInfo = ratingsMap[shop.id] || { avg: 0, count: 0 };

            return {
                ...shop,
                distance,
                averageRating: ratingInfo.avg,
                totalReviews: ratingInfo.count,
                hasRealReviews: ratingInfo.count > 0
            };
        });

        // 5. Restrict Distance (Strictly hide only if KNOWN to be > 15km)
        if (type === 'NEARBY' && userLat && userLng) {
            // Keep shops within 15km OR shops with unknown distance (null coords) to unblock discovery
            processedShops = processedShops.filter(shop => shop.distance === null || shop.distance <= 15);
        }

        // 6. Sort unified
        processedShops = sortBarbershopsByRatingAndAge(processedShops);

        // 7. Format string ratings and Limit Data payload
        const results = processedShops.slice(0, 50).map(shop => ({
            ...shop,
            averageRating: shop.hasRealReviews ? shop.averageRating.toFixed(1) : null
        }));

        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Recommended for You logic
const getRecommendedBarbershops = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const userLat = lat ? parseFloat(lat) : null;
        const userLng = lng ? parseFloat(lng) : null;

        // 1. Fetch Basic Active Barbershops
        const barbershops = await prisma.barbershop.findMany({
            where: { subscriptionStatus: { in: ['ACTIVE', 'TRIAL'] } },
            select: {
                id: true,
                name: true,
                slug: true,
                address: true,
                logoUrl: true,
                latitude: true,
                longitude: true,
                createdAt: true,
                services: {
                    take: 1,
                    where: { active: true },
                    select: { id: true, name: true, price: true }
                }
            }
        });

        // 2. Fetch Review Aggregates
        const ratingsData = await prisma.review.groupBy({
            by: ['barbershopId'],
            _avg: { rating: true },
            _count: { rating: true }
        });

        const ratingsMap = ratingsData.reduce((acc, curr) => {
            acc[curr.barbershopId] = {
                avg: curr._avg.rating || 0,
                count: curr._count.rating || 0
            };
            return acc;
        }, {});

        // 3. Trending Calculation: Confirmed/Completed appointments in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trendingData = await prisma.appointment.groupBy({
            by: ['barbershopId'],
            where: {
                createdAt: { gte: sevenDaysAgo },
                status: { in: ['CONFIRMED', 'COMPLETED'] }
            },
            _count: { id: true }
        });

        const trendingMap = trendingData.reduce((acc, curr) => {
            acc[curr.barbershopId] = curr._count.id;
            return acc;
        }, {});

        // 4. Score and Process Candidates
        let recommended = barbershops.map(shop => {
            let distance = null;
            if (userLat && userLng && shop.latitude && shop.longitude) {
                distance = calculateDistance(userLat, userLng, shop.latitude, shop.longitude);
            }

            const ratingInfo = ratingsMap[shop.id] || { avg: 0, count: 0 };
            const trendingCount = trendingMap[shop.id] || 0;

            // Global mean rating (fallback to 4.5 if no ratings exist at all)
            const globalAvg = 4.5; 
            
            let recScore = calculateRecommendationScore(
                { ...shop, averageRating: ratingInfo.avg, totalReviews: ratingInfo.count },
                trendingCount,
                globalAvg
            );

            // Penalty for shops without GPS (so known close ones stay on top)
            if (distance === null) recScore -= 5;

            return {
                ...shop,
                distance,
                averageRating: ratingInfo.avg,
                totalReviews: ratingInfo.count,
                hasRealReviews: ratingInfo.count > 0,
                recommendationScore: recScore
            };
        });

        // 5. Strict Radius filtering (15km)
        if (userLat && userLng) {
            // Unblock discovery: Only remove if we KNOW it is further than 15km
            recommended = recommended.filter(shop => shop.distance === null || shop.distance <= 15);
        }

        // 6. Sophisticated Sorting: Score DESC, then Distance ASC
        recommended.sort((a, b) => {
            if (b.recommendationScore !== a.recommendationScore) {
                return b.recommendationScore - a.recommendationScore;
            }
            // Tie-breaker: Distance
            return (a.distance || 999) - (b.distance || 999);
        });

        const finalResults = recommended.slice(0, 15).map(shop => ({
            ...shop,
            averageRating: shop.hasRealReviews ? shop.averageRating.toFixed(1) : null
        }));

        res.json(finalResults);
    } catch (error) {
        console.error('Recommended Error:', error);
        res.status(500).json({ message: 'Erro ao buscar recomendações.' });
    }
};

exports.searchBarbershops = searchBarbershops;
exports.getRecommendedBarbershops = getRecommendedBarbershops;

// Helper: Haversine Formula for distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(1));
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}


// Private: Get My Barbershop (Logged User)
exports.getMyBarbershop = async (req, res) => {
    try {
        let barbershopId = req.user.barbershopId;

        // Fallback: If token doesn't have ID (old token or login issue), lookup in DB
        // This is critical to prevent "Not Found" errors if the token payload is stale.
        const barbershopSelect = {
            id: true, name: true, slug: true, logoUrl: true, address: true, 
            phone: true, ownerId: true
        };

        if (!barbershopId) {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true, workedBarbershopId: true,
                    ownedBarbershops: { select: barbershopSelect },
                    workedBarbershop: { select: barbershopSelect }
                }
            });

            if (user) {
                // Prioritize ownership, then employment
                barbershopId = user.ownedBarbershops?.[0]?.id || user.workedBarbershopId;
            }
        }

        if (!barbershopId) {
            return res.status(404).json({ message: 'No barbershop associated with this user' });
        }

        const barbershop = await prisma.barbershop.findUnique({
            where: { id: barbershopId },
            include: {
                services: {
                    where: { active: true }
                },
                // Removed subscriptionPlans as it might not be a valid relation
            }
        });

        if (!barbershop) {
            return res.status(404).json({ message: 'Barbershop not found' });
        }

        res.json(barbershop);
    } catch (error) {
        console.error('Get My Barbershop Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Start of public slug

exports.getBarbershopBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        // Always sanitize incoming slug to find match in standardized DB
        const cleanSlug = slugify(slug);

        const barbershop = await prisma.barbershop.findUnique({
            where: { slug: cleanSlug },
            include: {
                services: { where: { active: true } },
                subscriptionPlans: { where: { active: true } },
                gatewayConfigs: { where: { isActive: true } },
                staff: {
                    where: { role: { in: ['BARBER', 'ADMIN', 'SUPER_ADMIN'] }, active: true },
                    select: {
                        id: true, name: true, avatarUrl: true, role: true,
                        professionalProfile: { select: { position: true, bio: true } }
                    }
                }
            }
        });


        if (!barbershop) {
            return res.status(404).json({ message: 'Barbershop not found' });
        }

        // Compute accepted methods based on active gateways
        const maskedConfigs = barbershop.gatewayConfigs?.map(g => {
            const creds = g.credentials || {};
            // Return only public keys
            return {
                gateway: g.gateway,
                isActive: g.isActive,
                publicKey: creds.publicKey || creds.clientId // specific public info
            };
        }) || [];

        const activeGateways = barbershop.gatewayConfigs?.map(g => g.gateway) || [];
        const methods = new Set();

        if (activeGateways.includes('VELFY')) {
            methods.add('PIX');
        }
        if (activeGateways.includes('MERCADOPAGO')) {
            methods.add('PIX');
            methods.add('CREDIT_CARD');
            methods.add('DEBIT_CARD');
            methods.add('BOLETO');
        }
        if (activeGateways.includes('STRIPE')) {
            methods.add('CREDIT_CARD');
            methods.add('DEBIT_CARD');
        }

        // Determine actual available methods based on active gateways
        const allowedMethods = Array.from(methods);
        
        // If shop has specific methods enabled, intersection them with what's actually possible
        // If not specific methods in DB, just use everything the gateway supports
        const acceptedPaymentMethods = (barbershop.enabledPaymentMethods || allowedMethods)
            .filter(m => allowedMethods.includes(m));

        const online_payment_enabled = acceptedPaymentMethods.length > 0;

        // Remove sensitive gatewayConfigs from the original object
        const { gatewayConfigs, ...safeBarbershop } = barbershop;

        res.json({
            ...safeBarbershop,
            gatewayConfigs: maskedConfigs,
            online_payment_enabled,
            acceptedPaymentMethods
        });
    } catch (error) {
        console.error('getBarbershopBySlug Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin: Update Barbershop
exports.updateBarbershop = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch current barbershop state
        const barbershop = await prisma.barbershop.findUnique({ where: { id } });
        if (!barbershop) return res.status(404).json({ message: 'Not found' });

        // 2. Check ownership
        if (barbershop.ownerId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const {
            name, commercialName, legalName, address, phone, slug, description, latitude, longitude,
            webhookUrl, noShowEnabled, noShowPercent, noShowText,
            logoUrl, bannerUrls, whatsappPhone, enabledPaymentMethods,
            whatsappAutoReply, whatsappKeywords, whatsappBusinessHoursOnly,
            whatsappWelcomeMessage,
            street, number, complement, neighborhood, city, state, zipCode, country,
            instagramUrl, facebookUrl, youtubeUrl
        } = req.body;

        // 3. Prepare data subset for update
        const dataToUpdate = {
            name, commercialName, legalName, address, description, phone,
            webhookUrl, noShowEnabled, noShowText, logoUrl, bannerUrls,
            whatsappPhone, enabledPaymentMethods, whatsappAutoReply,
            whatsappKeywords, whatsappBusinessHoursOnly, whatsappWelcomeMessage,
            street, number, complement, neighborhood, city, state, zipCode, country,
            instagramUrl, facebookUrl, youtubeUrl,
            latitude: latitude ? parseFloat(latitude) : undefined,
            longitude: longitude ? parseFloat(longitude) : undefined,
            noShowPercent: noShowPercent ? parseFloat(noShowPercent) : undefined,
        };

        // 4. Geocoding Logic: If address, city or state changes, try to re-geocode
        const hasAddressParts = street || city || state;
        const addressChanged = (street && street !== barbershop.street) ||
            (city && city !== barbershop.city) ||
            (state && state !== barbershop.state) ||
            (address && address !== barbershop.address);

        if (addressChanged || (hasAddressParts && (!barbershop.latitude || !barbershop.longitude))) {
            const fullAddress = `${street || ''} ${number || ''} ${neighborhood || ''} ${city || ''} ${state || ''} ${country || 'Brasil'}`.trim();
            const coords = await geocodeAddress(fullAddress || address);
            if (coords) {
                dataToUpdate.latitude = coords.lat;
                dataToUpdate.longitude = coords.lng;
            }
        }

        if (slug && typeof slug === 'string' && slug.trim().length > 0) {
            // Ensure uniqueness for the new slug, ignoring current ID
            dataToUpdate.slug = await generateUniqueSlug(prisma, slug, id);
        }

        const updated = await prisma.barbershop.update({
            where: { id },
            data: dataToUpdate
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: List Barbershops
exports.listBarbershops = async (req, res) => {
    try {
        const barbershops = await prisma.barbershop.findMany({
            select: {
                id: true,
                slug: true,
                name: true,
                subscriptionStatus: true,
                saasPlan: true,
                nextBillingDate: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.json(barbershops);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Super Admin: Update SaaS Plan & Handle Downgrades
exports.updateSaasPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { plan, status } = req.body; // e.g. plan='BASIC', status='ACTIVE'

        const barbershop = await prisma.barbershop.findUnique({ where: { id } });
        if (!barbershop) return res.status(404).json({ message: 'Barbershop not found' });

        const newPlan = plan || barbershop.saasPlan;
        const newStatus = status || barbershop.subscriptionStatus;

        // Verify Plan Config
        const planConfig = saasPlans[newPlan];
        if (!planConfig) return res.status(400).json({ message: 'Invalid Plan' });

        // Logic for Downgrade: Check Limits
        if (newPlan !== barbershop.saasPlan) {
            // Check Barber Limit
            const maxBarbers = planConfig.maxBarbers;
            const currentBarbers = await prisma.user.findMany({
                where: { workedBarbershopId: id, role: 'BARBER' },
                orderBy: { createdAt: 'desc' } // Newest first
            });

            if (currentBarbers.length > maxBarbers) {
                const excessCount = currentBarbers.length - maxBarbers;
                const barbersToDowngrade = currentBarbers.slice(0, excessCount);

                console.log(`Downgrading ${excessCount} barbers due to plan change (${barbershop.saasPlan} -> ${newPlan})`);

                // Downgrade excess barbers to CLIENT
                await prisma.user.updateMany({
                    where: { id: { in: barbersToDowngrade.map(u => u.id) } },
                    data: { role: 'CLIENT' } // Keep workedBarbershopId for record? Or assume Client implies no work.
                });
            }
        }

        const updated = await prisma.barbershop.update({
            where: { id },
            data: {
                saasPlan: newPlan,
                subscriptionStatus: newStatus
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Update Plan Error:', error);
        res.status(500).json({ message: 'Server error updating plan' });
    }
};
exports.toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params; // Barbershop ID
        const authUserId = req.user.id;

        // Try finding by Client ID (if token is generateClientToken) or authUserId
        const client = await prisma.client.findFirst({
            where: {
                OR: [
                    { id: authUserId },
                    { authUserId: authUserId }
                ]
            }
        });

        if (!client) return res.status(404).json({ message: 'Perfil de cliente não encontrado.' });

        const existing = await prisma.favoriteBarbershop.findUnique({
            where: {
                clientId_barbershopId: {
                    clientId: client.id,
                    barbershopId: id
                }
            }
        });

        if (existing) {
            await prisma.favoriteBarbershop.delete({ where: { id: existing.id } });
            return res.json({ favorited: false, message: 'Removido dos favoritos.' });
        } else {
            await prisma.favoriteBarbershop.create({
                data: {
                    clientId: client.id,
                    barbershopId: id
                }
            });
            return res.json({ favorited: true, message: 'Adicionado aos favoritos!' });
        }
    } catch (error) {
        console.error('Toggle Favorite Error:', error);
        res.status(500).json({ message: 'Erro ao processar favorito.' });
    }
};

exports.checkFavoriteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) return res.json({ favorited: false });

        const client = await prisma.client.findFirst({
            where: {
                OR: [
                    { id: req.user.id },
                    { authUserId: req.user.id }
                ]
            }
        });
        if (!client) return res.json({ favorited: false });

        const favorite = await prisma.favoriteBarbershop.findUnique({
            where: {
                clientId_barbershopId: {
                    clientId: client.id,
                    barbershopId: id
                }
            }
        });

        res.json({ favorited: !!favorite });
    } catch (error) {
        res.json({ favorited: false });
    }
};

exports.getMyFavorites = async (req, res) => {
    try {
        const authUserId = req.user.id;

        // Try finding by Client ID or authUserId for robustness
        const client = await prisma.client.findFirst({
            where: {
                OR: [
                    { id: authUserId },
                    { authUserId: authUserId }
                ]
            }
        });
        if (!client) return res.json([]);

        const favs = await prisma.favoriteBarbershop.findMany({
            where: { clientId: client.id },
            include: {
                barbershop: {
                    include: {
                        reviews: { select: { rating: true } }
                    }
                }
            }
        });

        const results = favs.map(f => {
            const shop = f.barbershop;
            let averageRating = "5.0";
            let totalReviews = 0;

            if (shop.reviews && shop.reviews.length > 0) {
                totalReviews = shop.reviews.length;
                const sum = shop.reviews.reduce((acc, curr) => acc + curr.rating, 0);
                averageRating = (sum / totalReviews).toFixed(1);
            }

            const { reviews, ...safeShop } = shop;
            return { ...safeShop, averageRating, totalReviews };
        });

        res.json(results);
    } catch (error) {
        console.error('Get My Favorites Error:', error);
        res.status(500).json({ message: 'Erro ao buscar favoritos.' });
    }
};
