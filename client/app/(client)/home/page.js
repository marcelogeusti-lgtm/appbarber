'use client';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, ChevronLeft, Star, MapPin, Bell, Search as SearchIcon, Heart, History, Calendar, Clock, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/clientApi';
import { safeSetItem } from '../../../lib/storage';
import { useClientAuth } from '../../../contexts/ClientAuthContext';

export default function ClientHome() {
    const { user, loading: authLoading } = useClientAuth();
    const [loadingData, setLoadingData] = useState(true);
    const [barbershops, setBarbershops] = useState([]);
    const [usingFallback, setUsingFallback] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [lastAppointment, setLastAppointment] = useState(null);
    const [lastAccess, setLastAccess] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const carouselRef = useRef(null);
    const router = useRouter();

    const slides = [
        {
            image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
            text: "Agende compromissos rapidamente pelo app, sem filas ou ligações"
        },
        {
            image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop",
            text: "Descubra os melhores profissionais da sua região"
        },
        {
            image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2074&auto=format&fit=crop",
            text: "Corte de cabelo, barba e tratamentos exclusivos"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Load last access from localStorage
        const storedAccess = localStorage.getItem('last_accessed_barbershops');
        if (storedAccess) {
            try {
                setLastAccess(JSON.parse(storedAccess).slice(0, 5));
            } catch (e) {
                console.error("Error parsing last access", e);
            }
        }

        // Initial fetch without location (Immediate)
        fetchData();

        // Then try to get location for specialized results
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("[GEOLOCATION SUCCESS]", position.coords);
                    fetchData(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.warn("[GEOLOCATION ERROR/DENIED]", error.message);
                }
            );
        }
    }, [user]);

    const fetchData = async (lat = null, lng = null) => {
        try {
            // Only show loader if we don't have barbershops yet
            if (barbershops.length === 0) {
                setLoadingData(true);
            }

            // Prepare promises for parallel fetching
            const promises = [];

            // 1. Recommended Barbershops
            let searchUrl = '/barbershops/recommended';
            if (lat && lng) searchUrl += `?lat=${lat}&lng=${lng}`;
            promises.push(api.get(searchUrl));

            // 2. Favorites and Appointments (only if user is logged in)
            if (user) {
                promises.push(api.get('/barbershops/my/favorites'));
                promises.push(api.get('/appointments/me'));
            }

            const results = await Promise.allSettled(promises);

            // Helper to get value from settled promise
            const getValue = (idx) => results[idx]?.status === 'fulfilled' ? results[idx].value.data : null;

            const searchDataRaw = getValue(0) || [];
            const favoritesData = getValue(1) || [];
            const appointmentsData = getValue(2) || [];

            console.log("[HOME DATA DEBUG]", {
                recommendations: searchDataRaw.length,
                favorites: favoritesData.length,
                appointments: appointmentsData.length,
                user: user?.id,
                userId: user?.authUserId || user?.id
            });

            // Process recommendations
            setBarbershops(searchDataRaw);
            // Check if any shop has usingFallback flag
            const hasFallback = searchDataRaw.some(shop => shop.usingFallback);
            setUsingFallback(hasFallback);

            // Process user-specific data
            if (user) {
                setFavorites(favoritesData);
                if (appointmentsData.length > 0) {
                    // Filter to get only future or current appointments for "Last" card
                    const now = new Date();
                    const next = [...appointmentsData]
                        .filter(a => new Date(a.date) >= now || a.status === 'CONFIRMED')
                        .sort((a, b) => new Date(a.date) - new Date(b.date));
                    
                    if (next.length > 0) {
                        setLastAppointment(next[0]);
                    } else {
                        // If no future, show most recent completed/past
                        const last = [...appointmentsData].sort((a, b) => new Date(b.date) - new Date(a.date));
                        setLastAppointment(last[0]);
                    }
                }
            }
        } catch (err) {
            console.error("[FETCH DATA ERROR]", err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleVisitShop = (shop) => {
        // Update last access in localStorage
        const stored = localStorage.getItem('last_accessed_barbershops');
        let current = [];
        try {
            const parsed = stored ? JSON.parse(stored) : [];
            current = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            current = [];
        }

        // Remove if already exists to move to top
        current = current.filter(item => item && (item.id !== (shop.id || shop._id)));

        // Add to top
        current.unshift({
            id: shop.id || shop._id,
            name: shop.name,
            slug: shop.slug,
            logoUrl: shop.logoUrl,
            address: shop.address,
            averageRating: shop.averageRating
        });

        // Keep last 10
        const limited = current.slice(0, 10);
        safeSetItem('last_accessed_barbershops', limited);

        // Navigate
        router.push(`/${shop.slug}`);
    };

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = 320; // Approx card width + gap
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const formatDate = () => {
        return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (authLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-sans">Carregando...</div>;

    const points = user?.points || 0;
    const tier = points >= 5000 ? 'GOLD' : points >= 1000 ? 'SILVER' : 'BRONZE';
    const nextTier = tier === 'BRONZE' ? 'SILVER' : tier === 'SILVER' ? 'GOLD' : 'MAX';
    const pointsToNext = tier === 'BRONZE' ? 1000 : tier === 'SILVER' ? 5000 : 0;
    const progress = pointsToNext > 0 ? Math.min((points / pointsToNext) * 100, 100) : 100;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#050505] to-black text-white px-5 pt-6 pb-24 font-sans no-scrollbar overflow-x-hidden">
            
            {/* 1. HEADER RE-STYLING */}
            <header className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 p-0.5 overflow-hidden shadow-inner">
                        <img 
                            src={user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                            alt="U" 
                            className="w-full h-full object-cover rounded-full" 
                        />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Bem-vindo(a),</p>
                        <h2 className="text-base font-black tracking-tight leading-none uppercase">{user?.name.split(' ')[0] || 'Cliente'}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-xl glass-premium flex items-center justify-center text-slate-400 group active:scale-95 transition-all">
                        <SearchIcon className="w-5 h-5 group-hover:text-primary transition-colors" />
                    </button>
                    <button className="w-10 h-10 rounded-xl glass-premium flex items-center justify-center text-slate-400 group active:scale-95 transition-all relative">
                        <Bell className="w-5 h-5 group-hover:text-primary transition-colors" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    </button>
                </div>
            </header>

            {/* 2. SEARCH BAR (PREMIUM) */}
            <div className="mb-8 px-1">
                <div className="glass-premium rounded-[1.5rem] p-1 flex items-center shadow-lg border-white/5">
                    <div className="flex-1 flex items-center gap-3 px-4 py-3">
                        <SearchIcon className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                        <input 
                            type="text" 
                            placeholder="Buscar barbearias ou serviços..." 
                            className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-slate-600"
                        />
                    </div>
                    <button className="bg-primary text-black p-3 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all">
                        <MapPin className="w-5 h-5" strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* 3. LOYALTY CARD (LUXURY) */}
            <div className="mb-10 px-1">
                <div className="luxury-card rounded-[2.5rem] p-8 shadow-2xl relative group overflow-hidden">
                    {/* Background effects */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="flex justify-between items-start mb-10 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="w-4 h-4 text-primary fill-current" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Status do Membro</span>
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">{tier} MEMBER</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Saldo Atual</p>
                            <p className="text-3xl font-black text-neon-blue tracking-tighter">{points} pts</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-10 relative z-10">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Progresso para nível {nextTier}</span>
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div 
                                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out glow-blue shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                                style={{ width: `${progress}%` }} 
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 relative z-10">
                        <button className="flex-1 glass-premium hover:bg-white/5 border-white/10 rounded-2xl py-4 flex items-center justify-center gap-2 transition-all active:scale-95 group">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-4 h-4 invert opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-200">Apple Wallet</span>
                        </button>
                        <button className="flex-1 glass-premium hover:bg-white/5 border-white/10 rounded-2xl py-4 flex items-center justify-center gap-2 transition-all active:scale-95 group">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Wallet_logo_2022.svg" className="w-4 h-4 group-hover:scale-110 transition-transform" alt="" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-200">Google Pay</span>
                        </button>
                    </div>

                    {/* Member ID watermark */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-end relative z-10 opacity-30">
                        <div>
                            <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-1">MEMBER ID</p>
                            <p className="text-[10px] font-mono tracking-widest text-white">#{user?.id ? user.id.slice(0, 8).toUpperCase() : 'APP-2024'}</p>
                        </div>
                        <img src="/logos/logo_full.png" className="h-4 opacity-50" alt="" />
                    </div>
                </div>
            </div>

            {/* 4. RECOMENDADOS SECTION (PREMIUM CAROUSEL) */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6 px-1">
                    <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Especialmente para você</h2>
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Ver tudo</button>
                </div>

                <div className="flex overflow-x-auto gap-5 no-scrollbar snap-x snap-mandatory -mx-5 px-5">
                    {loadingData ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="min-w-[280px] h-64 glass-premium rounded-[2.5rem] animate-pulse" />
                        ))
                    ) : barbershops.length > 0 ? barbershops.map(shop => (
                        <div 
                            key={shop.id || shop._id}
                            onClick={() => handleVisitShop(shop)}
                            className="min-w-[280px] snap-center glass-premium rounded-[2.5rem] p-5 border-white/5 relative group cursor-pointer active:scale-95 transition-all overflow-hidden"
                        >
                            <div className="relative mb-5">
                                <div className="aspect-square rounded-[2rem] overflow-hidden border border-white/10 group-hover:scale-105 transition-all duration-500 shadow-xl">
                                    {shop.logoUrl ? (
                                        <img src={shop.logoUrl} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-900 flex items-center justify-center font-black text-2xl text-primary">{shop.name[0]}</div>
                                    )}
                                </div>
                                {shop.averageRating && (
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xl border border-white/10 px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg">
                                        <Star className="w-3 h-3 text-primary fill-current" />
                                        <span className="text-[11px] font-black text-white leading-none">{shop.averageRating}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-1 mb-6">
                                <h3 className="font-black text-lg text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">{shop.name}</h3>
                                <div className="flex items-center gap-1 text-slate-500">
                                    <MapPin className="w-3 h-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest truncate">{shop.address || 'Próximo a você'}</span>
                                </div>
                            </div>

                            <button className="w-full py-4 bg-primary text-black rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 group-hover:scale-[1.02] transition-all">
                                Agendar agora
                            </button>
                        </div>
                    )) : (
                        <div className="w-full py-10 glass-premium rounded-[2rem] border-dashed text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">
                            Nenhum resultado próximo
                        </div>
                    )}
                </div>
            </div>

            {/* 5. FAVORITOS / AGENDAMENTO */}
            <div className="grid grid-cols-1 gap-8 mb-8 px-1">
                {user && lastAppointment && (
                    <div className="glass-premium rounded-[2rem] p-6 relative overflow-hidden group border-primary/10">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-black text-white uppercase italic tracking-tight">Próximo Agendamento</h2>
                            <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-widest glow-blue">Confirmado</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                                <img src={lastAppointment.barbershop?.logoUrl || "https://api.dicebear.com/7.x/initials/svg?seed=BC"} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-white uppercase tracking-tight">{lastAppointment.service?.name}</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">{lastAppointment.barbershop?.name}</p>
                            </div>
                            <button onClick={() => router.push('/agendamentos')} className="w-10 h-10 glass-premium rounded-xl flex items-center justify-center text-primary group active:scale-95 transition-all">
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-black text-white uppercase italic tracking-tight">Barbearias Favoritas</h2>
                    <Link href="/favorites" className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Ver favoritos</Link>
                </div>
                
                <div className="space-y-4">
                    {favorites.length > 0 ? favorites.slice(0, 3).map(shop => (
                        <div 
                            key={shop.id || shop._id}
                            onClick={() => handleVisitShop(shop)}
                            className="glass-premium rounded-[2rem] p-4 flex items-center gap-4 border-white/5 group cursor-pointer active:scale-[0.98] transition-all"
                        >
                            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                                <img src={shop.logoUrl || "https://api.dicebear.com/7.x/initials/svg?seed=F"} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">{shop.name}</h4>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate">{shop.address || 'Endereço favorito'}</p>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 glass-premium rounded-xl">
                                <Star className="w-3 h-3 text-primary fill-current" />
                                <span className="text-[10px] font-black text-white">{shop.averageRating || "5.0"}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="py-6 glass-premium rounded-[2rem] border-dashed text-center text-slate-700 text-[10px] font-black uppercase tracking-widest">
                            Nenhum favorito selecionado
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
