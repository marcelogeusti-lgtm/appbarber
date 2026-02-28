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
        if (!authLoading) {
            fetchData();
        }
    }, [user, authLoading]);

    const fetchData = async () => {
        try {
            const res = await api.get('/barbershops');
            setBarbershops(res.data || []);
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

                {/* VISITOR VIEW */}
                {!user && (
                    <>
                        {/* Header: Visitor */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-white">Seja bem vindo(a)</h1>
                                <p className="text-[11px] text-slate-500 font-medium capitalize mt-0.5">{formatDate()}</p>
                            </div>
                            <button className="p-2.5 bg-white/5 rounded-full border border-white/5 text-slate-400 hover:text-white transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-[#050505]"></span>
                            </button>
                        </div>

                        {/* Search: Visitor */}
                        <div className="mb-6 relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Pesquisar pelo nome"
                                onClick={() => router.push('/search')}
                                className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-all cursor-pointer"
                                readOnly
                            />
                        </div>

                        {/* Categories: Visitor */}
                        <div className="flex items-center gap-3 mb-10 overflow-x-auto no-scrollbar py-1">
                            <button className="flex items-center gap-2.5 px-6 py-3 bg-primary text-white rounded-2xl text-xs font-bold transition-transform active:scale-95 shadow-lg shadow-primary/20">
                                <div className="p-1 bg-white/20 rounded-md">
                                    <Search className="w-3.5 h-3.5" />
                                </div>
                                Nome
                            </button>
                            <button className="flex items-center gap-2.5 px-6 py-3 bg-[#111] border border-white/5 text-slate-300 rounded-2xl text-xs font-bold hover:bg-white/5 transition-colors">
                                <div className="p-1 bg-white/5 rounded-md text-slate-500">
                                    <MapPin className="w-3.5 h-3.5" />
                                </div>
                                Cidade
                            </button>
                            <button className="flex items-center gap-2.5 px-6 py-3 bg-[#111] border border-white/5 text-slate-300 rounded-2xl text-xs font-bold hover:bg-white/5 transition-colors">
                                <div className="p-1 bg-white/5 rounded-md text-slate-500">
                                    <Search className="w-3.5 h-3.5" />
                                </div>
                                Próximas
                            </button>
                        </div>

                        {/* Hero Carousel: Visitor */}
                        <div className="relative mb-12 aspect-[16/9] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl group">
                            {slides.map((slide, idx) => (
                                <div
                                    key={idx}
                                    className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                                >
                                    <img src={slide.image} alt="Carousel" className="w-full h-full object-cover brightness-[0.4]" />
                                    <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-black/80 to-transparent">
                                        <h2 className="text-lg md:text-xl font-bold leading-tight max-w-[80%] drop-shadow-lg">
                                            {slide.text}
                                        </h2>
                                    </div>
                                </div>
                            ))}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                {slides.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-primary w-6' : 'bg-white/30'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* LOGGED-IN VIEW */}
                {user && (
                    <>
                        {/* Header: Logged In */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                                Olá, <span className="text-primary">{user.name.split(' ')[0]}</span>
                            </h1>
                            <p className="text-[11px] text-slate-500 font-medium capitalize mt-1">{formatDate()}</p>
                        </div>

                        {/* Search: Logged In */}
                        <div className="mb-12 relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Encontre um estabelecimento"
                                onClick={() => router.push('/search')}
                                className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-all cursor-pointer"
                                readOnly
                            />
                        </div>

                        {/* Favorites Section */}
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white tracking-tight">Favoritos</h2>
                                <button className="px-4 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors">
                                    Editar lista
                                </button>
                            </div>

                            <div className="space-y-4">
                                {barbershops.slice(0, 1).map(shop => (
                                    <div
                                        key={shop.id}
                                        className="bg-[#111] border border-white/5 rounded-[2rem] p-4 flex items-center justify-between hover:border-white/10 transition-all group cursor-pointer"
                                        onClick={() => router.push(`/${shop.slug}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center relative bg-slate-900 overflow-hidden shadow-inner">
                                                {shop.logoUrl ? (
                                                    <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-black text-xs text-primary bg-primary/5 uppercase">
                                                        {shop.name.substring(0, 5)}
                                                    </div>
                                                )}
                                                <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                                                    <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />
                                                    <span className="text-[8px] font-black text-white">5.0</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-sm tracking-tight">{shop.name}</h3>
                                                <p className="text-slate-500 text-[10px] font-medium truncate max-w-[200px]">
                                                    {shop.address || 'Endereço não informado'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                                            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Accesses */}
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white tracking-tight">Últimos acessos</h2>
                                <button className="px-4 py-1.5 bg-[#1A1A1A] border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors">
                                    Editar lista
                                </button>
                            </div>

                            <div className="space-y-4">
                                {barbershops.slice(1, 2).map(shop => (
                                    <div
                                        key={shop.id}
                                        className="bg-[#111] border border-white/5 rounded-[2rem] p-4 flex items-center justify-between hover:border-white/10 transition-all group cursor-pointer"
                                        onClick={() => router.push(`/${shop.slug}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center relative bg-slate-900 overflow-hidden shadow-inner">
                                                {shop.logoUrl ? (
                                                    <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-black text-xs text-primary bg-primary/5 uppercase">
                                                        {shop.name.substring(0, 5)}
                                                    </div>
                                                )}
                                                <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                                                    <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />
                                                    <span className="text-[8px] font-black text-white">5.0</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-sm tracking-tight">{shop.name}</h3>
                                                <p className="text-slate-500 text-[10px] font-medium truncate max-w-[200px]">
                                                    {shop.address || 'Endereço não informado'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                                            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* SHARED LIST: Visible if search active or for visitors (Optional customization based on UX preference) */}
                {(!user || barbershops.length > 2) && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white tracking-tight">{user ? 'Mais opções' : 'Próximos a você'}</h2>
                        </div>

                        <div className="space-y-4">
                            {loadingData ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-28 w-full bg-[#111] animate-pulse rounded-[2rem]" />
                                ))
                            ) : barbershops.length > 0 ? barbershops.slice(user ? 2 : 0).map(shop => (
                                <div
                                    key={shop.id}
                                    className="bg-[#111] border border-white/5 rounded-[2rem] p-4 flex items-center justify-between hover:border-white/10 transition-all group cursor-pointer active:scale-[0.98]"
                                    onClick={() => router.push(`/${shop.slug}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center relative bg-slate-900 overflow-hidden shadow-inner">
                                            {shop.logoUrl ? (
                                                <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-xs text-primary bg-primary/5 uppercase">
                                                    {shop.name.substring(0, 5)}
                                                </div>
                                            )}
                                            <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                                                <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />
                                                <span className="text-[8px] font-black text-white">5.0</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white text-sm truncate tracking-tight">{shop.name}</h3>
                                            <p className="text-slate-500 text-[10px] font-medium leading-relaxed truncate max-w-[200px]">
                                                {shop.address || 'Endereço não informado'}
                                            </p>
                                            <div className="flex items-center gap-1 mt-1 text-primary">
                                                <MapPin className="w-2.5 h-2.5 fill-current" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">1.28 km</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white" />
                                    </div>
                                </div>
                            )) : !loadingData && (
                                <div className="py-24 text-center space-y-6">
                                    <div className="relative w-32 h-32 mx-auto">
                                        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                                        <div className="relative flex items-center justify-center w-full h-full bg-[#111] border border-white/5 rounded-full shadow-2xl">
                                            <SearchIcon className="w-12 h-12 text-slate-700" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Encontre um estabelecimento</h3>
                                        <p className="text-slate-500 text-sm font-medium">Pesquise pelo nome ou cidade do estabelecimento</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
