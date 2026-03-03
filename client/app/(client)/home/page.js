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

            // Process recommendations
            let searchData = results[0].data || [];
            if (lat && lng) {
                searchData = searchData
                    .filter(shop => shop.distance !== null && shop.distance < 100)
                    .sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating))
                    .slice(0, 3);
            } else {
                searchData = searchData
                    .sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating))
                    .slice(0, 3);
            }
            setBarbershops(searchData);

            // Process user-specific data
            if (user && results.length > 1) {
                setFavorites(results[1].data || []);
                const appointments = results[2].data || [];
                if (appointments.length > 0) {
                    // Get most recent (first in list usually, but sort to be sure)
                    const sorted = [...appointments].sort((a, b) => new Date(b.date) - new Date(a.date));
                    setLastAppointment(sorted[0]);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleVisitShop = (shop) => {
        // Update last access in localStorage
        const stored = localStorage.getItem('last_accessed_barbershops');
        let current = stored ? JSON.parse(stored) : [];

        // Remove if already exists to move to top
        current = current.filter(item => item.id !== shop.id);

        // Add to top
        current.unshift({
            id: shop.id,
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
                <div className="relative mb-12 aspect-[21/9] md:aspect-[3/1] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl group">
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
                <div className="space-y-8 mb-16">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Star className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Recomendados para você</h2>
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Top 3</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loadingData ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-64 w-full bg-[#0A0A0B] animate-pulse rounded-[2.5rem] border border-white/5" />
                            ))
                        ) : barbershops.length > 0 ? barbershops.map(shop => (
                            <div
                                key={shop.id}
                                className="bg-[#0A0A0B] border border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-6 hover:border-primary/30 transition-all group cursor-pointer active:scale-[0.98] shadow-xl"
                                onClick={() => handleVisitShop(shop)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="w-16 h-16 rounded-2xl border border-white/5 flex items-center justify-center relative bg-slate-900 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                                        {shop.logoUrl ? (
                                            <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-black text-xs text-primary bg-primary/5 uppercase">
                                                {shop.name.substring(0, 3)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-white/10">
                                            <Star className="w-3 h-3 text-primary fill-current" />
                                            <span className="text-[10px] font-black text-white">{shop.averageRating || "5.0"}</span>
                                        </div>
                                        {shop.distance && (
                                            <div className="flex items-center gap-1 text-slate-500">
                                                <MapPin className="w-2.5 h-2.5" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{shop.distance} km</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="font-black text-base text-white group-hover:text-primary transition-colors uppercase tracking-tight truncate">{shop.name}</h3>
                                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest truncate">
                                        {shop.address || 'Endereço não informado'}
                                    </p>
                                </div>

                                <button className="w-full py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-black transition-all">
                                    Ver Perfil
                                </button>
                            </div>
                        )) : !loadingData && (
                            <div className="col-span-full py-12 bg-[#0A0A0B] border border-white/5 rounded-[2.5rem] text-center border-dashed">
                                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Nenhuma recomendação no momento</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. ÚLTIMO AGENDAMENTO */}
                {user && lastAppointment && (
                    <div className="mb-16 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                                <Calendar className="w-5 h-5 text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Último Agendamento</h2>
                        </div>

                        <div
                            className="bg-gradient-to-br from-[#111] to-[#0A0A0B] border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-emerald-500/30 transition-all cursor-pointer shadow-2xl relative overflow-hidden group"
                            onClick={() => router.push('/agendamentos')}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full translate-x-12 -translate-y-12" />
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-20 h-20 bg-[#050505] rounded-3xl flex flex-col items-center justify-center border border-white/5 shadow-inner">
                                    <span className="text-3xl font-black text-white">{new Date(lastAppointment.date).getDate()}</span>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500">
                                        {new Date(lastAppointment.date).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-white uppercase tracking-tight">{lastAppointment.service?.name}</h3>
                                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                                        <Clock className="w-3.5 h-3.5" /> {new Date(lastAppointment.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        <span className="text-slate-600">•</span>
                                        <MapPin className="w-3.5 h-3.5" /> {lastAppointment.barbershop?.name}
                                    </p>
                                </div>
                            </div>
                            <button className="px-8 py-4 bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 relative z-10 whitespace-nowrap">
                                Ver Detalhes
                            </button>
                        </div>
                    </div>
                )}

                {/* Search & Filters (Moved below) */}
                <div className="mb-16 space-y-6">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Pesquisar por nome, cidade ou serviço..."
                            onClick={() => router.push('/search')}
                            className="w-full bg-[#0A0A0B] border border-white/5 rounded-3xl py-6 pl-16 pr-6 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary/30 transition-all cursor-pointer shadow-xl"
                            readOnly
                        />
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                        <button className="flex items-center gap-2.5 px-8 py-3.5 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-primary/20">
                            Nome
                        </button>
                        <button className="flex items-center gap-2.5 px-8 py-3.5 bg-[#0A0A0B] border border-white/5 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">
                            Cidade
                        </button>
                        <button className="flex items-center gap-2.5 px-8 py-3.5 bg-[#0A0A0B] border border-white/5 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">
                            Próximas
                        </button>
                    </div>
                </div>

                {/* 3. MEUS FAVORITOS */}
                {user && (
                    <div className="mb-16 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-500/10 rounded-xl">
                                    <Heart className="w-5 h-5 text-pink-500" />
                                </div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Meus Favoritos</h2>
                            </div>
                            <Link href="/favorites" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1.5">
                                Ver todos <ChevronRight className="w-3 h-3 text-primary" />
                            </Link>
                        </div>

                        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
                            {favorites.length > 0 ? favorites.map(shop => (
                                <div
                                    key={shop.id}
                                    className="min-w-[240px] bg-[#0A0A0B] border border-white/5 rounded-[2.5rem] p-5 flex flex-col gap-5 hover:border-pink-500/30 transition-all cursor-pointer group shadow-xl"
                                    onClick={() => handleVisitShop(shop)}
                                >
                                    <div className="w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden relative border border-white/5">
                                        {shop.logoUrl ? (
                                            <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-black text-xl text-primary bg-primary/5">
                                                {shop.name.substring(0, 2)}
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                                            <Heart className="w-3.5 h-3.5 text-pink-500 fill-current" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-sm text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">{shop.name}</h4>
                                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest truncate flex items-center gap-1.5">
                                            <MapPin className="w-2.5 h-2.5" /> {shop.address?.split(',')[0]}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="w-full py-12 bg-[#0A0A0B] border border-white/5 rounded-[2.5rem] text-center border-dashed flex flex-col items-center gap-3">
                                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Sua lista de favoritos está vazia</p>
                                    <Link href="/search" className="text-[10px] text-primary font-black uppercase underline underline-offset-4">Explorar barbearias</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. ÚLTIMO ACESSO */}
                <div className="mb-16 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <History className="w-5 h-5 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Visitados recentemente</h2>
                    </div>

                    <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
                        {lastAccess.length > 0 ? lastAccess.map(shop => (
                            <div
                                key={shop.id}
                                className="min-w-[180px] bg-[#0A0A0B] border border-white/5 rounded-[2rem] p-4 flex items-center gap-4 hover:border-blue-500/30 transition-all cursor-pointer group shadow-xl"
                                onClick={() => router.push(`/${shop.slug}`)}
                            >
                                <div className="w-12 h-12 rounded-xl border border-white/5 flex items-center justify-center bg-slate-900 overflow-hidden shadow-inner shrink-0">
                                    {shop.logoUrl ? (
                                        <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-black text-[10px] text-primary bg-primary/5">
                                            {shop.name.substring(0, 2)}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-black text-xs text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">{shop.name}</h4>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-2 h-2 text-primary fill-current" />
                                        <span className="text-[8px] font-black text-slate-500 mt-0.5">{shop.averageRating || "5.0"}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="w-full py-10 bg-[#0A0A0B] border border-white/5 rounded-[2rem] text-center border-dashed">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic opacity-50">Você ainda não visitou nenhum perfil</p>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
