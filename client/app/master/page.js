'use client';
import { useState, useEffect } from 'react';
import { Store, Users, TrendingUp, AlertCircle, DollarSign, Activity } from 'lucide-react';
import api from '../../lib/api';

export default function MasterDashboard() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            const res = await api.get('/barbershops');
            setShops(res.data);
        } catch (error) {
            console.error('Error fetching barbershops:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Metrics
    const activeShops = shops.filter(s => s.subscriptionStatus === 'ACTIVE').length;
    const trialShops = shops.filter(s => s.subscriptionStatus === 'TRIAL').length;
    const overdueShops = shops.filter(s => s.subscriptionStatus === 'OVERDUE').length;

    // Simulated MRR based on plans (Assuming Basic=109, Pro=164)
    const mrr = shops.reduce((acc, shop) => {
        if (shop.subscriptionStatus !== 'ACTIVE') return acc;
        if (shop.saasPlan === 'BASIC') return acc + 109.90;
        if (shop.saasPlan === 'PRO') return acc + 164.50;
        if (shop.saasPlan === 'ENTERPRISE') return acc + 219.90;
        return acc + 79.90; // SOLO
    }, 0);

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-32 bg-[#111] rounded-2xl w-full border border-white/5"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-[#111] rounded-2xl border border-white/5"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Visão Geral</h1>
                <p className="text-white/40 text-sm font-medium mt-1">Métricas em tempo real do seu SaaS.</p>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase tracking-widest">+12%</span>
                    </div>
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">MRR Atual</p>
                        <h3 className="text-3xl font-black text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mrr)}
                        </h3>
                    </div>
                </div>

                <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                            <Store className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Pagantes</span>
                    </div>
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Barbearias Ativas</p>
                        <h3 className="text-3xl font-black text-white">{activeShops}</h3>
                    </div>
                </div>

                <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Em Período de Testes</p>
                        <h3 className="text-3xl font-black text-white">{trialShops}</h3>
                    </div>
                </div>

                <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Inadimplentes</p>
                        <h3 className="text-3xl font-black text-red-500">{overdueShops}</h3>
                    </div>
                </div>
            </div>

            {/* Chart Area Simulator */}
            <div className="bg-[#111] border border-white/5 p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Crescimento do MRR (Simulado)
                    </h3>
                </div>
                
                <div className="h-64 flex items-end gap-2 justify-between">
                    {[30, 45, 40, 60, 55, 75, 80, 95, 85, 110, 105, 120].map((height, i) => (
                        <div key={i} className="w-full bg-white/5 rounded-t-lg relative group transition-all hover:bg-primary/20" style={{ height: `${height}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-white text-black text-[10px] font-bold px-2 py-1 rounded transition-opacity">
                                R$ {height * 150}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] text-white/40 font-bold uppercase tracking-widest border-t border-white/5 pt-4">
                    <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Set</span><span>Out</span><span>Nov</span><span>Dez</span>
                </div>
            </div>
        </div>
    );
}
