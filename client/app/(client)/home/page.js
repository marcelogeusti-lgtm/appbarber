'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Star, MapPin, Bell, Search as SearchIcon, Heart, History, Calendar, Clock, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/clientApi';
import { useClientAuth } from '../../../contexts/ClientAuthContext';

export default function ClientHome() {
    const { user, loading: authLoading } = useClientAuth();
    const [loadingData, setLoadingData] = useState(true);
    const [barbershops, setBarbershops] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [lastAppointment, setLastAppointment] = useState(null);
    const [lastAccess, setLastAccess] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
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
            image: "https://images.unsplash.com/photo-1621605815841-2cd6066f4e33?q=80&w=2070&auto=format&fit=crop",
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

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchData(position.coords.latitude, position.coords.longitude);
                },
                () => fetchData()
            );
        } else {
            fetchData();
        }
    }, [user]);

    const fetchData = async (lat = null, lng = null) => {
        try {
            setLoadingData(true);

            // Prepare promises for parallel fetching
            const promises = [];

            // 1. Recommended Barbershops
            let searchUrl = '/barbershops/search';
            if (lat && lng) searchUrl += `?lat=${lat}&lng=${lng}&type=NEARBY`;
            promises.push(api.get(searchUrl));

            // 2. Favorites and Appointments (only if user is logged in)
            if (user) {
                promises.push(api.get('/barbershops/my/favorites'));
                promises.push(api.get('/appointments/me'));
            }

            const results = await Promise.all(promises);
            console.log("[HOME DATA DEBUG]", {
                recommendations: results[0]?.data?.length,
                favorites: results[1]?.data?.length,
                appointments: results[2]?.data?.length,
                user: user?.id
            });

            // Process recommendations
            let searchData = results[0].data || [];
            if (lat && lng) {
                searchData = searchData
                    .filter(shop => shop.distance !== null && shop.distance <= 15) // Filter by 15km
                    .sort((a, b) => parseFloat(b.averageRating || 0) - parseFloat(a.averageRating || 0)); // Sort by rating
            } else {
                searchData = searchData
                    .sort((a, b) => parseFloat(b.averageRating || 0) - parseFloat(a.averageRating || 0)); // Sort by rating
            }
            setBarbershops(searchData);

            // Process user-specific data
            if (user && results.length > 1) {
                setFavorites(results[1].data || []);
                const appointments = results[2].data || [];
                if (appointments.length > 0) {
                    console.log("[APPOINTMENTS FOUND]", appointments.length);
                    // Get most recent (future if available, else most recent past)
                    const sorted = [...appointments].sort((a, b) => new Date(b.date) - new Date(a.date));
                    setLastAppointment(sorted[0]);
                } else {
                    console.log("[NO APPOINTMENTS FOUND]");
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
        let current = stored ? JSON.parse(stored) : [];

        // Remove if already exists to move to top
        current = current.filter(item => item.id !== (shop.id || shop._id));

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
        localStorage.setItem('last_accessed_barbershops', JSON.stringify(limited));

        // Navigate
        router.push(`/${shop.slug}`);
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
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Recomendados para você</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loadingData ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-64 w-full bg-[#0A0A0B] animate-pulse rounded-[2.5rem] border border-white/5" />
                            ))
                        ) : barbershops.length > 0 ? barbershops.map(shop => (
                            <div
                                key={shop.id || shop._id}
                                className="bg-[#0A0A0B] border border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-6 hover:border-primary/30 transition-all group cursor-pointer active:scale-[0.98] shadow-xl"
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
                                        <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-white/10">
                                            <Star className="w-3 h-3 text-primary fill-current" />
                                            <span className="text-[10px] font-black text-white">{shop.averageRating || "5.0"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="font-black text-base text-white group-hover:text-primary transition-colors uppercase tracking-tight truncate">{shop.name}</h3>
                                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest truncate">
                                        {shop.address || 'Endereço não informado'}
                                    </p>
                                </div>

                                <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-black transition-all flex items-center justify-center gap-2">
                                    Ver Perfil <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        )) : !loadingData && (
                            <div className="col-span-full py-12 bg-[#0A0A0B] border border-white/5 rounded-[2.5rem] text-center border-dashed">
                                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Nenhuma recomendação no momento</p>
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
                                    <div className="flex items-center gap-5">
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
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
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
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden shrink-0 relative">
                                            <img src={shop.logoUrl || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=100"} alt={shop.name} className="w-full h-full object-cover rounded-full" />
                                            <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10 flex items-center gap-0.5 shadow-lg">
                                                <Star className="w-2 h-2 text-primary fill-current" />
                                                <span className="text-[7px] font-black text-white">5.0</span>
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-lg text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">{shop.name}</h4>
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest truncate italic">
                                                {shop.address || "Endereço indisponível"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
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
                            {lastAccess.length > 0 ? lastAccess.slice(0, 5).map(shop => (
                                <div
                                    key={shop.id || shop._id}
                                    className="bg-[#0A0A0B] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between gap-6 hover:border-primary/30 transition-all cursor-pointer group"
                                    onClick={() => router.push(`/${shop.slug}`)}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden shrink-0 relative">
                                            <img src={shop.logoUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=100"} alt={shop.name} className="w-full h-full object-cover rounded-full" />
                                            <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10 flex items-center gap-0.5 shadow-lg">
                                                <Star className="w-2 h-2 text-primary fill-current" />
                                                <span className="text-[7px] font-black text-white">5.0</span>
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-lg text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">{shop.name}</h4>
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest truncate italic">
                                                {shop.address || "Endereço indisponível"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            )) : (
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
