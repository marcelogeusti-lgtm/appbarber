'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Search, Package, Clock, LogOut, ChevronRight, Star, MapPin, User, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

export default function ClientHome() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(userStr));
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans pb-24">
            {/* Header */}
            {/* Header */}
            <header className="p-6 flex justify-between items-center sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
                <div>
                    <p className="text-slate-400 text-sm font-medium mb-0.5">Olá, <span className="text-white font-bold">{user?.name?.split(' ')[0] || 'Cliente'}</span></p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="relative cursor-pointer hover:bg-slate-900 p-2 rounded-full transition">
                    <Bell className="w-6 h-6 text-white" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
                </div>
            </header>

            {/* Search Bar - Redirects to Search Tab */}
            <div className="px-6 mb-8">
                <Link href="/search" className="bg-slate-900 rounded-2xl p-4 flex items-center gap-3 border border-slate-800 active:scale-95 transition shadow-lg shadow-black/20">
                    <Search className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-500 text-sm font-medium">Encontre um estabelecimento...</span>
                </Link>
            </div>

            {/* Hero CTA */}
            <div className="px-6 mb-8">
                <div className="relative bg-gradient-to-br from-orange-600 to-red-600 rounded-[2rem] p-6 shadow-2xl shadow-orange-900/20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

                    <div className="relative z-10">
                        <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Novo</span>
                        <h2 className="text-3xl font-black text-white mb-2 leading-none">Visual novo?</h2>
                        <p className="text-orange-100 text-sm font-medium mb-6 opacity-90 max-w-[200px]">Agende seu horário agora e evite filas.</p>

                        <Link href="/agendamento" className="bg-white text-orange-600 px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-colors inline-flex items-center gap-2 shadow-lg">
                            Agendar Agora <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="px-6 mb-10">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Acesso Rápido</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/packages" className="bg-slate-900 p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110">
                            <Package className="w-16 h-16 text-white" />
                        </div>
                        <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-3">
                            <Package className="w-5 h-5 text-blue-500" />
                        </div>
                        <h4 className="font-bold text-white text-sm">Pacotes</h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">Economize nos cortes</p>
                    </Link>

                    <Link href="/history" className="bg-slate-900 p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110">
                            <Clock className="w-16 h-16 text-white" />
                        </div>
                        <div className="w-10 h-10 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-3">
                            <Clock className="w-5 h-5 text-purple-500" />
                        </div>
                        <h4 className="font-bold text-white text-sm">Histórico</h4>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">Veja seus agendamentos</p>
                    </Link>
                </div>
            </div>

            {/* Recent/Featured Section (Optional) */}
            <div className="px-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Para Você</h3>
                <div className="bg-slate-900 rounded-3xl p-1 border border-slate-800">
                    <div className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                            <Star className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-white text-sm">Avalie seu último corte</h4>
                            <p className="text-[10px] text-slate-500">Ajude-nos a melhorar</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </div>
                </div>
            </div>

            {/* Logout */}

        </div>
    );
}
