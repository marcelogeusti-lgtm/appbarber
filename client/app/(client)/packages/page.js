'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/clientApi';
import { Package, Calendar, Scissors, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyPackagesPage() {
    const router = useRouter();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSub() {
            try {
                const res = await api.get('/subscriptions/my-active');
                setSubscription(res.data);
            } catch (error) {
                console.error('Erro ao buscar assinatura:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchSub();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#050505] to-black text-white px-5 pt-8 pb-32 max-w-7xl mx-auto overflow-x-hidden uppercase">
            
            {/* Header */}
            <header className="flex items-center gap-4 mb-10 px-1">
                <button onClick={() => router.back()} className="w-10 h-10 glass-premium rounded-xl flex items-center justify-center text-slate-400 active:scale-95 transition-all">
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                    <h1 className="text-xl font-black text-white italic tracking-tight">Meus Pacotes</h1>
                    <p className="text-slate-500 text-[9px] font-bold tracking-[0.2em] mt-0.5">Assinaturas e Créditos</p>
                </div>
            </header>

            <div className="px-1">
                {subscription ? (
                    <div className="glass-premium border-primary/30 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl transition-all active:scale-[0.99]">
                        <div className="absolute top-8 right-8 w-12 h-12 glass-premium rounded-2xl flex items-center justify-center border-primary/20 shadow-inner">
                            <Package className="w-6 h-6 text-primary" />
                        </div>

                        <div className="mb-10 relative z-10 transition-transform active:scale-[0.99]">
                            <p className="text-[9px] font-black text-primary tracking-[0.4em] mb-2">Plano de Benefícios</p>
                            <h2 className="text-2xl font-black italic tracking-tighter leading-none mb-1">{subscription.plan?.name}</h2>
                            <div className="flex items-center gap-2 mt-3">
                                <span className="text-[10px] font-black text-white opacity-40 tracking-[0.2em]">MEMBRO VIP</span>
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,1)]"></span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 mb-10 relative z-10">
                            <div className="glass-premium p-6 rounded-[2rem] flex items-center gap-5 border-white/5 bg-white/5 transition-all hover:bg-white/10">
                                <div className="w-14 h-14 glass-premium rounded-2xl flex items-center justify-center border-primary/20 shadow-inner">
                                    <Scissors className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[9px] font-black tracking-widest uppercase">Cortes Restantes</p>
                                    <p className="text-2xl font-black text-white italic tracking-tighter">{subscription.remainingCuts || 0} DE {subscription.plan?.limit || '∞'}</p>
                                </div>
                            </div>

                            <div className="glass-premium p-6 rounded-[2rem] flex items-center gap-5 border-white/5 bg-white/5 transition-all hover:bg-white/10">
                                <div className="w-14 h-14 glass-premium rounded-2xl flex items-center justify-center border-primary/20 shadow-inner">
                                    <Calendar className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[9px] font-black tracking-widest uppercase">Válido Até</p>
                                    <p className="text-xl font-black text-white italic tracking-tighter">
                                        {new Date(subscription.endDate).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full glass-premium border-white/10 text-white font-black py-5 rounded-[2rem] text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-xl relative z-10">
                            Gerenciar Minha Assinatura
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center glass-premium border-white/5 rounded-[3rem] space-y-8 px-8">
                        <div className="w-24 h-24 glass-premium rounded-full flex items-center justify-center border-white/5 relative overflow-hidden">
                            <Package className="w-10 h-10 text-slate-800" strokeWidth={1} />
                            <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse opacity-20"></div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-lg font-black text-white italic tracking-tight italic">Nenhum Pacote Ativo</h3>
                            <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] leading-relaxed max-w-xs mx-auto text-center">Você ainda não possui assinaturas ou pacotes de serviços contratados.</p>
                        </div>
                        <button onClick={() => router.push('/search')} className="px-10 py-5 glass-premium border-primary/20 text-primary uppercase text-[10px] font-black tracking-widest rounded-[1.5rem] active:scale-95 transition-all">
                            Explorar Ofertas
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
