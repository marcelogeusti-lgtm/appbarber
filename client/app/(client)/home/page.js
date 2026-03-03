'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Star, MapPin, Bell, Search as SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/clientApi';
import { useClientAuth } from '../../../contexts/ClientAuthContext';

export default function ClientHome() {
    const { user, loading: authLoading } = useClientAuth();
    const [loadingData, setLoadingData] = useState(true);
    const [barbershops, setBarbershops] = useState([]);
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
            let url = '/barbershops/search';
            if (lat && lng) {
                url += `?lat=${lat}&lng=${lng}&type=NEARBY`;
            }

            const res = await api.get(url);
            let data = res.data || [];

            // Regra Obrigatória: Proximidade + Avaliação (Top 3)
            if (lat && lng) {
                // Filtrar por proximidade (raio de 100km como "perto")
                // E ordenar por Rating DESC
                data = data
                    .filter(shop => shop.distance !== null && shop.distance < 100)
                    .sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating))
                    .slice(0, 3);
            } else {
                // Sem localização: apenas ordenar por rating e pegar top 3
                data = data
                    .sort((a, b) => parseFloat(b.averageRating) - parseFloat(a.averageRating))
                    .slice(0, 3);
            }

            setBarbershops(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingData(false);
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

                {/* Search & Filters */}
                <div className="mb-12 space-y-6">
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

                {/* Barbershop List Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight italic">Estabelecimentos Recomendados</h2>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{barbershops.length} unidades</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loadingData ? (
                            Array(6).fill(0).map((_, i) => (
                                <div key={i} className="h-40 w-full bg-[#0A0A0B] animate-pulse rounded-[2.5rem] border border-white/5" />
                            ))
                        ) : barbershops.length > 0 ? barbershops.map(shop => (
                            <div
                                key={shop.id}
                                className="bg-[#0A0A0B] border border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-6 hover:border-primary/30 transition-all group cursor-pointer active:scale-[0.98] shadow-xl"
                                onClick={() => {
                                    if (!user) openLoginModal();
                                    else router.push(`/${shop.slug}`);
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="w-20 h-20 rounded-3xl border border-white/5 flex items-center justify-center relative bg-slate-900 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                                        {shop.logoUrl ? (
                                            <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-black text-sm text-primary bg-primary/5 uppercase">
                                                {shop.name.substring(0, 3)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-2 border border-white/10">
                                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                            <span className="text-[10px] font-black text-white">5.0</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-primary">
                                            <MapPin className="w-3 h-3 fill-current" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">1.2 km</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="font-black text-lg text-white group-hover:text-primary transition-colors uppercase tracking-tight truncate">{shop.name}</h3>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest truncate">
                                        {shop.address || 'Endereço não informado'}
                                    </p>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!user) openLoginModal();
                                        else router.push(`/${shop.slug}`);
                                    }}
                                    className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-black transition-all"
                                >
                                    Ver Perfil
                                </button>
                            </div>
                        )) : !loadingData && (
                            <div className="col-span-full py-24 text-center space-y-6">
                                <div className="relative w-32 h-32 mx-auto">
                                    <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                                    <div className="relative flex items-center justify-center w-full h-full bg-[#0A0A0B] border border-white/5 rounded-full shadow-2xl">
                                        <SearchIcon className="w-12 h-12 text-slate-800" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Nenhum resultado</h3>
                                    <p className="text-slate-500 text-sm font-medium">Tente buscar por outro termo ou região</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
