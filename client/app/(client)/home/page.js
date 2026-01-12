'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, MapPin, Star, Play, Apple, ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

export default function ClientHome() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastAppointment, setLastAppointment] = useState(null);
    const [recentBarbershops, setRecentBarbershops] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(userStr));
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch last appointment
            const res = await api.get('/appointments/me');
            const apps = res.data || [];

            if (apps.length > 0) {
                setLastAppointment(apps[0]);
            }

            // Mock Favorites/Recents from appointments logic
            const shops = [];
            const seen = new Set();
            for (const app of apps) {
                if (app.barbershop && !seen.has(app.barbershop.id)) {
                    seen.add(app.barbershop.id);
                    shops.push(app.barbershop);
                }
            }
            setRecentBarbershops(shops.slice(0, 2));
            setFavorites(shops.slice(0, 1));

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;

    const formatDate = () => {
        return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">

            <main className="max-w-6xl mx-auto px-6 md:px-12 py-10">
                {/* Greeting */}
                <div className="mb-8">
                    <h1 className="text-2xl font-normal text-slate-300">
                        Olá, <span className="text-emerald-500 font-bold">{user?.name?.split(' ')[0] || 'Visitante'}</span>
                    </h1>
                    <p className="text-sm text-slate-500 capitalize mt-1 text-[13px]">{formatDate()}</p>
                </div>

                {/* Search Input */}
                <div className="mb-12 relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-slate-500 group-focus-within:text-white transition" />
                    </div>
                    <input
                        type="text"
                        placeholder="Procurar estabelecimento"
                        onClick={() => router.push('/search')}
                        className="w-full bg-[#111111] border border-white/5 rounded-lg py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition shadow-lg shadow-black/50 cursor-pointer hover:bg-[#151515]"
                        readOnly
                    />
                </div>

                {/* Last Appointment */}
                {lastAppointment && (
                    <div className="mb-10 animate-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-white font-medium text-lg mb-4">Último agendamento</h2>
                        <div
                            className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition group cursor-pointer"
                            onClick={() => router.push(`/${lastAppointment.barbershop?.slug || ''}`)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1 relative">
                                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden">
                                        {lastAppointment.barbershop?.name?.[0] || 'B'}
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-0.5 border border-[#111111]">
                                        <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">{lastAppointment.barbershop?.name}</h3>
                                    <p className="text-slate-500 text-xs">{lastAppointment.service?.name || 'Serviço Agendado'}</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center group-hover:bg-emerald-500 transition">
                                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Favorites */}
                <div className="mb-10 animate-in slide-in-from-bottom-6 duration-700 delay-100">
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-white font-medium text-lg">Favoritos</h2>
                        <button className="bg-white text-black text-[10px] font-bold px-3 py-1 rounded-full hover:bg-slate-200 transition">Editar lista</button>
                    </div>

                    <div className="space-y-3">
                        {favorites.length > 0 ? favorites.map(shop => (
                            <div
                                key={shop.id}
                                className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition group cursor-pointer"
                                onClick={() => router.push(`/${shop.slug}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full border border-yellow-500/20 flex items-center justify-center relative bg-slate-900 overflow-hidden">
                                        <span className="text-[9px] font-bold text-yellow-500">{shop.name.substring(0, 5).toUpperCase()}</span>
                                        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[8px] font-bold px-1 rounded-bl-lg">5.0</div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{shop.name}</h3>
                                        <p className="text-slate-500 text-xs">{shop.address || 'Endereço não informado'}</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center group-hover:bg-emerald-500 transition">
                                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-600 text-xs italic">Você ainda não tem favoritos.</p>
                        )}
                    </div>
                </div>

                {/* Recent Access */}
                <div className="animate-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-white font-medium text-lg">Últimos acessos</h2>
                        <button className="bg-white text-black text-[10px] font-bold px-3 py-1 rounded-full hover:bg-slate-200 transition">Editar lista</button>
                    </div>

                    <div className="space-y-3">
                        {recentBarbershops.length > 0 ? recentBarbershops.map(shop => (
                            <div
                                key={shop.id}
                                className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition group cursor-pointer"
                                onClick={() => router.push(`/${shop.slug}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full border border-yellow-500/20 flex items-center justify-center relative bg-slate-900 overflow-hidden">
                                        <span className="text-[9px] font-bold text-yellow-500">{shop.name.substring(0, 5).toUpperCase()}</span>
                                        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[8px] font-bold px-1 rounded-bl-lg">5.0</div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{shop.name}</h3>
                                        <p className="text-slate-500 text-xs">{shop.address || 'Endereço não informado'}</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center group-hover:bg-emerald-500 transition">
                                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-600 text-xs italic">Nenhum acesso recente.</p>
                        )}
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-[#08080A] pt-16 pb-8">
                <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    {/* Brand */}
                    <div>
                        <div className="bg-emerald-600 px-4 py-1.5 rounded-lg inline-flex items-center justify-center border border-white/10 shadow-lg shadow-emerald-500/10 mb-6">
                            <span className="text-white font-medium text-sm tracking-wide lowercase font-sans">barberon</span>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
                            Uma nova experiência para uma antiga tradição.
                        </p>
                        <div className="flex gap-4 mt-6">
                            <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">f</div>
                            <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">in</div>
                            <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">yt</div>
                            <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">x</div>
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div>
                        <h4 className="text-white font-bold text-sm mb-6">Acesso rápido</h4>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link href="/home" className="hover:text-emerald-500 transition">Início</Link></li>
                            <li><Link href="/search" className="hover:text-emerald-500 transition">Encontrar estabelecimentos</Link></li>
                            <li><Link href="/appointments" className="hover:text-emerald-500 transition">Meus agendamentos</Link></li>
                            <li><Link href="/profile" className="hover:text-emerald-500 transition">Favoritos</Link></li>
                        </ul>
                    </div>

                    {/* More */}
                    <div>
                        <h4 className="text-white font-bold text-sm mb-6">Mais</h4>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link href="/terms" className="hover:text-emerald-500 transition">Termos de uso</Link></li>
                            <li><Link href="/privacy" className="hover:text-emerald-500 transition">Preferências de cookies</Link></li>
                        </ul>
                    </div>

                    {/* App Download */}
                    <div>
                        <h4 className="text-white font-bold text-sm mb-6">Baixe nosso App</h4>
                        <div className="space-y-3">
                            <button className="w-full bg-[#0E1218] border border-white/10 rounded-lg py-3 px-4 flex items-center gap-3 hover:border-emerald-500/50 transition group">
                                <Apple className="w-5 h-5 text-white group-hover:text-emerald-500" />
                                <div className="text-left">
                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Download on the</p>
                                    <p className="text-xs text-white font-bold">App Store</p>
                                </div>
                            </button>
                            <button className="w-full bg-[#0E1218] border border-white/10 rounded-lg py-3 px-4 flex items-center gap-3 hover:border-emerald-500/50 transition group">
                                <Play className="w-5 h-5 text-white group-hover:text-emerald-500 fill-current" />
                                <div className="text-left">
                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Get it on</p>
                                    <p className="text-xs text-white font-bold">Google Play</p>
                                </div>
                            </button>
                        </div>

                        <div className="mt-8">
                            <h4 className="text-white font-bold text-sm mb-2">É um gestor?</h4>
                            <p className="text-xs text-slate-500 mb-4">Cadastre seu estabelecimento e comece a receber agendamentos online.</p>
                            <Link href="/register" className="bg-[#0E1218] border border-white/10 text-white text-xs font-bold py-2 px-6 rounded-lg hover:bg-white hover:text-black transition">Saiba mais</Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-6 md:px-12 border-t border-white/5 pt-8 flex items-center justify-between">
                    <p className="text-slate-600 text-xs text-[11px]">© 2026 StarApp Sistemas. Todos os direitos reservados.</p>
                    <button className="bg-[#0E1218] border border-white/10 p-2 rounded-lg hover:border-white/30 transition">
                        <ArrowUp className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </footer>
        </div>
    );
}
