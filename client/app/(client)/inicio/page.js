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

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-primary/30 pb-24">
            <main className="max-w-xl lg:max-w-6xl mx-auto px-5 pt-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase italic">
                            {user ? <>Olá, <span className="text-primary">{user.name.split(' ')[0]}</span></> : 'Seja bem vindo(a)'}
                        </h1>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1 italic">{formatDate()}</p>
                    </div>
                </div>

                {/* Hero Carousel */}
                <div className="relative mb-16 aspect-[21/9] md:aspect-[3/1] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl group">
                    {slides.map((slide, idx) => (
                        <div
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <img src={slide.image} alt="Carousel" className="w-full h-full object-cover brightness-[0.4]" />
                            <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 pt-20 bg-gradient-to-t from-black/90 to-transparent">
                                <h2 className="text-xl md:text-3xl font-black leading-tight max-w-[80%] drop-shadow-2xl uppercase italic tracking-tight">
                                    {slide.text}
                                </h2>
                            </div>
                        </div>
                    ))}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {slides.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-primary w-8' : 'bg-white/20 w-4'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* 1. SEÇÃO DE RECOMENDADOS (TOPO) */}
                <div className="space-y-8 mb-20">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Recomendados para você</h2>
                            {usingFallback && !loadingData && (
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nenhuma barbearia em 15km. Exibindo principais barbearias da plataforma:</p>
                            )}
                        </div>
                        {barbershops.length > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => scrollCarousel('left')}
                                    className="p-3 bg-[#0A0A0B] border border-white/5 rounded-full hover:border-primary/50 transition-all text-white/50 hover:text-white"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => scrollCarousel('right')}
                                    className="p-3 bg-[#0A0A0B] border border-white/5 rounded-full hover:border-primary/50 transition-all text-white/50 hover:text-white"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div
                        ref={carouselRef}
                        className="flex overflow-x-auto gap-8 pb-8 no-scrollbar snap-x scroll-smooth -mx-5 px-5"
                    >
                        {loadingData ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-64 min-w-[300px] bg-[#0A0A0B] animate-pulse rounded-[2.5rem] border border-white/5" />
                            ))
                        ) : barbershops.length > 0 ? barbershops.map(shop => (
                            <div
                                key={shop.id || shop._id}
                                className="min-w-[300px] md:min-w-[340px] snap-center bg-[#0A0A0B] border border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-6 hover:border-primary/30 transition-all group cursor-pointer active:scale-[0.98] shadow-xl"
                                onClick={() => handleVisitShop(shop)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="w-16 h-16 rounded-full border-2 border-primary/20 p-1 flex items-center justify-center relative bg-slate-900 overflow-hidden shadow-inner group-hover:scale-105 transition-all">
                                        <div className="w-full h-full rounded-full overflow-hidden">
                                            {shop.logoUrl ? (
                                                <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-xs text-primary bg-primary/5 uppercase">
                                                    {shop.name.substring(0, 3)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        {shop.averageRating && (
                                            <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-white/10">
                                                <Star className="w-3 h-3 text-primary fill-current" />
                                                <span className="text-[10px] font-black text-white">{shop.averageRating}</span>
                                            </div>
                                        )}
                                        {shop.distance !== null && (
                                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                <MapPin className="w-3 h-3" />
                                                {shop.distance} km
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="font-black text-base text-white group-hover:text-primary transition-colors uppercase tracking-tight truncate">{shop.name}</h3>
                                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest truncate">
                                        {shop.address || 'Endereço não informado'}
                                    </p>
                                    {shop.totalReviews > 0 && (
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest italic">{shop.totalReviews} avaliações</p>
                                    )}
                                </div>

                                <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-black transition-all flex items-center justify-center gap-2">
                                    Agendar <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        )) : !loadingData && (
                            <div className="w-full py-12 bg-[#0A0A0B] border border-white/5 rounded-[2.5rem] text-center border-dashed">
                                <p className="text-slate-500 text-xs font-black uppercase tracking-widest italic">Nenhuma barbearia encontrada em até 15km.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* 2. ÚLTIMO AGENDAMENTO */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Último agendamento</h2>
                        </div>

                        {user && lastAppointment ? (
                            <div
                                className="p-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[2rem] group"
                                onClick={() => router.push('/agendamentos')}
                            >
                                <div className="bg-[#050505] rounded-[1.95rem] p-6 flex items-center justify-between gap-6 hover:bg-white/5 transition-all cursor-pointer">
                                    <div className="flex flex-1 min-w-0 items-center gap-5">
                                        <div className="w-16 h-16 rounded-full border-2 border-white/10 p-0.5 overflow-hidden shrink-0">
                                            <img
                                                src={lastAppointment.barbershop?.logoUrl || "https://cdn.simpleicons.org/barber/white"}
                                                alt="Logo"
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-black text-lg text-white uppercase tracking-tight truncate">
                                                {lastAppointment.service?.name || "Corte e Conexão..."}
                                            </h3>
                                            <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest truncate">
                                                {lastAppointment.barbershop?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all shrink-0">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#0A0A0B] border border-white/5 rounded-[2rem] p-10 text-center border-dashed">
                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">{loadingData ? "Buscando dados..." : "Nenhum agendamento encontrado"}</p>
                            </div>
                        )}
                    </div>

                    {/* 3. MEUS FAVORITOS */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Favoritos</h2>
                            </div>
                            <button
                                onClick={() => router.push('/favorites')}
                                className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                            >
                                Editar lista
                            </button>
                        </div>

                        <div className="space-y-4">
                            {favorites.length > 0 ? favorites.slice(0, 5).map(shop => (
                                <div
                                    key={shop.id || shop._id}
                                    className="bg-[#0A0A0B] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between gap-6 hover:border-primary/30 transition-all cursor-pointer group"
                                    onClick={() => handleVisitShop(shop)}
                                >
                                    <div className="flex flex-1 min-w-0 items-center gap-5">
                                        <div className="w-16 h-16 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden shrink-0 relative">
                                            <img src={shop.logoUrl || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=100"} alt={shop.name} className="w-full h-full object-cover rounded-full" />
                                            <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10 flex items-center gap-0.5 shadow-lg">
                                                <Star className="w-2 h-2 text-primary fill-current" />
                                                <span className="text-[7px] font-black text-white">{shop.averageRating || "5.0"}</span>
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-lg text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">{shop.name}</h4>
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest truncate italic">
                                                {shop.address || "Endereço indisponível"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all shrink-0">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            )) : (
                                <div className="bg-[#0A0A0B] border border-white/5 rounded-[2rem] p-10 text-center border-dashed">
                                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">Você ainda não favoritou nada</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. ÚLTIMOS ACESSOS */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Últimos acessos</h2>
                            </div>
                            <button className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
                                Editar lista
                            </button>
                        </div>

                        <div className="space-y-4">
                            {lastAccess.length > 0 ? (
                                (() => {
                                    const shop = lastAccess[0];
                                    return (
                                        <div
                                            key={shop.id || shop._id}
                                            className="bg-[#0A0A0B] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between gap-6 hover:border-primary/30 transition-all cursor-pointer group"
                                            onClick={() => router.push(`/${shop.slug}`)}
                                        >
                                            <div className="flex flex-1 min-w-0 items-center gap-5">
                                                <div className="w-16 h-16 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden shrink-0 relative">
                                                    <img src={shop.logoUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=100"} alt={shop.name} className="w-full h-full object-cover rounded-full" />
                                                    <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10 flex items-center gap-0.5 shadow-lg">
                                                        <Star className="w-2 h-2 text-primary fill-current" />
                                                        <span className="text-[7px] font-black text-white">{shop.averageRating || "5.0"}</span>
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black text-lg text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">{shop.name}</h4>
                                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest truncate italic">
                                                        {shop.address || "Endereço indisponível"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all shrink-0">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="bg-[#0A0A0B] border border-white/5 rounded-[2rem] p-10 text-center border-dashed">
                                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">Nenhum histórico recente</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
