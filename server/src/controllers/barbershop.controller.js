const prisma = require('../lib/prisma');
const saasPlans = require('../config/saasPlans');
const { generateUniqueSlug, slugify } = require('../utils/slugGenerator');

// Public: Search Barbershops
const searchBarbershops = async (req, res) => {
    try {
        const { term, type, city, lat, lng } = req.query; // type: NAME, CITY, NEARBY

        // Base Query
        let where = {};

        // 1. Text Search (Name or Address)
        if (term) {
            where.OR = [
                { name: { contains: term, mode: 'insensitive' } },
                { address: { contains: term, mode: 'insensitive' } }
            ];
        }

        // 2. City Filter
        // If type is CITY or if explicit city param is provided
        if ((type === 'CITY' && term) || city) {
            // If searching by city logic
            where.address = { contains: term || city, mode: 'insensitive' };
        }

        // 3. Nearby Logic (Simplified for SQLite/Postgres without spatial extension)
        // If we have lat/lng, we fetch candidates and filter/sort in JS, 
        // OR better: if Prisma + Postgres + PostGIS is not available, we can't do ST_Distance easily in standard Prisma.
        // We will fetch limited results and sort in memory if needed, or rely on client sorting.
        // For 'NEARBY' without lat/lng, we can't do much.

        let orderBy = undefined;
        // If simple ordering needed
        // orderBy = { name: 'asc' }; 

        // Only consider active barbershops
        where.subscriptionStatus = 'ACTIVE';

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
                services: {
                    take: 1,
                    where: { active: true },
                    select: { id: true, name: true, price: true }
                }
            },
            take: 24
        });

        // Optimization: Fetch ratings in a separate aggregated query to avoid overhead of many review records
        const shopIds = barbershops.map(s => s.id);
        const ratingsData = await prisma.review.groupBy({
            by: ['barbershopId'],
            where: { barbershopId: { in: shopIds } },
            _avg: { rating: true },
            _count: { rating: true }
        });

        const ratingsMap = ratingsData.reduce((acc, curr) => {
            acc[curr.barbershopId] = {
                avg: curr._avg.rating?.toFixed(1) || "5.0",
                count: curr._count.rating || 0
            };
            return acc;
        }, {});

        // Post-processing for Distance and Reviews
        let results = barbershops.map(shop => {
            let distance = null;
            if (lat && lng && shop.latitude && shop.longitude) {
                distance = calculateDistance(parseFloat(lat), parseFloat(lng), shop.latitude, shop.longitude);
            }

            const ratingInfo = ratingsMap[shop.id] || { avg: "5.0", count: 0 };

            return {
                ...shop,
                distance,
                averageRating: ratingInfo.avg,
                totalReviews: ratingInfo.count
            };
        });

        // 4. Sort by Distance if 'NEARBY'
        if (type === 'NEARBY' && lat && lng) {
            results.sort((a, b) => {
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });
        }

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

        // 1. Fetch all active shops with basic data and creation date
        const barbershops = await prisma.barbershop.findMany({
            where: { subscriptionStatus: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                slug: true,
                address: true,
                logoUrl: true,
                latitude: true,
                longitude: true,
                createdAt: true
            }
        });

        // 2. Fetch ratings stats for sorting
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

        // 3. Filter by distance (15km) and prepare for sorting
        let recommended = barbershops.map(shop => {
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

        // Apply 15km filter if location is available
        let filteredRecommended = [...recommended];
        let usingFallback = false;

        if (userLat && userLng) {
            filteredRecommended = recommended.filter(shop => shop.distance !== null && shop.distance <= 15);

            // Fallback: If strict 15km filtering yields 0 results, show top global recommendations instead of empty list
            if (filteredRecommended.length === 0) {
                filteredRecommended = [...recommended];
                usingFallback = true;
            }
        }

        // 4. Sorting Logic
        filteredRecommended.sort((a, b) => {
            // Priority 1: Real Ratings
            if (a.hasRealReviews && !b.hasRealReviews) return -1;
            if (!a.hasRealReviews && b.hasRealReviews) return 1;

            if (a.hasRealReviews && b.hasRealReviews) {
                // Both have reviews: Sort by Avg Rating (DESC)
                if (b.averageRating !== a.averageRating) {
                    return b.averageRating - a.averageRating;
                }
                // Tie-breaker: Total Reviews count (DESC)
                return b.totalReviews - a.totalReviews;
            }

            // Priority 2: No reviews - Created Date (ASC - Older first)
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        // Limit to 10
        const finalResults = filteredRecommended.slice(0, 10).map(shop => ({
            ...shop,
            averageRating: shop.hasRealReviews ? shop.averageRating.toFixed(1) : null,
            usingFallback // Add flag to let frontend know
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
        if (!barbershopId) {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                include: {
                    ownedBarbershops: true,
                    // If workedBarbershop relation exists, check it too, 
                    // assuming 'workedBarbershop' is the relation name based on 'workedBarbershopId' field
                    workedBarbershop: true
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

        // Resulting list from DB (explicitly configured)
        const acceptedPaymentMethods = barbershop.enabledPaymentMethods || Array.from(methods);
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
        const { id } = req.params; // or derived from user token
        const {
            name, address, phone, slug, webhookUrl, noShowEnabled, noShowPercent, noShowText,
            logoUrl, bannerUrls, whatsappPhone, enabledPaymentMethods,
            whatsappAutoReply, whatsappKeywords, whatsappBusinessHoursOnly, whatsappWelcomeMessage
        } = req.body;

        // Check ownership
        // Ideally use req.user.barbershopId or check ownerId
        const barbershop = await prisma.barbershop.findUnique({ where: { id } });
        if (!barbershop) return res.status(404).json({ message: 'Not found' });

        if (barbershop.ownerId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Protect against overwriting slug with empty string
        const dataToUpdate = {
            name,
            address,
            phone,
            webhookUrl,
            noShowEnabled,
            noShowPercent: noShowPercent ? parseFloat(noShowPercent) : undefined,
            noShowText,
            logoUrl,
            bannerUrls,
            whatsappPhone,
            enabledPaymentMethods,
            whatsappAutoReply,
            whatsappKeywords,
            whatsappBusinessHoursOnly,
            whatsappWelcomeMessage
        };

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
            include: { owner: { select: { name: true, email: true } } }
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
        const client = await prisma.client.findUnique({ where: { authUserId: req.user.id } });
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
