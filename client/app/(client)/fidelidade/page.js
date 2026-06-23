'use client';
import { useEffect, useState } from 'react';
import { useClientAuth } from '../../../contexts/ClientAuthContext';
import { Star, Gift, Scissors, ChevronLeft } from 'lucide-react';
import api from '../../../lib/clientApi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FidelidadePage() {
    const { user, loading } = useClientAuth();
    const router = useRouter();
    const [balances, setBalances] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/inicio'); // or openLoginModal
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (user) {
            fetchBalances();
        }
    }, [user]);

    const fetchBalances = async () => {
        try {
            const res = await api.get('/loyalty/my-balances');
            setBalances(res.data || []);
        } catch (error) {
            console.error("Erro ao buscar fidelidade:", error);
            setBalances([]);
        } finally {
            setIsLoading(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">Carregando cartões...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border border-white/5 hover:bg-slate-800 transition">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            Meus Cartões Fidelidade
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">Acompanhe seus pontos e resgate prêmios exclusivos.</p>
                    </div>
                </div>

                {balances.length === 0 ? (
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                            <Gift className="w-10 h-10 text-slate-500" />
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">Nenhum Cartão Ativo</h3>
                        <p className="text-xs text-slate-400 max-w-xs mb-8">
                            Você ainda não tem pontos de fidelidade. Agende um serviço nas barbearias parceiras para começar a ganhar!
                        </p>
                        <Link href="/buscar" className="bg-primary text-black font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-full hover:bg-primary/90 transition shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                            Explorar Barbearias
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {balances.map((balance, idx) => {
                            const program = balance.barbershop.loyaltyProgram || { minPointsToRedeem: 10 };
                            const maxPoints = program.minPointsToRedeem || 10;
                            const currentPoints = Math.min(balance.points, maxPoints);
                            const isComplete = currentPoints >= maxPoints;

                            // Create array of slots
                            const slots = Array.from({ length: maxPoints }).map((_, i) => i < currentPoints);

                            return (
                                <div key={balance.id} className={`bg-gradient-to-b from-slate-900 to-black border ${isComplete ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)]' : 'border-white/10'} rounded-[32px] overflow-hidden relative animate-in zoom-in-95`} style={{ animationDelay: `${idx * 100}ms` }}>
                                    
                                    {isComplete && (
                                        <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-black py-2 px-4 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                                <Gift className="w-3 h-3" />
                                                Prêmio Desbloqueado! Resgate no próximo agendamento.
                                            </p>
                                        </div>
                                    )}

                                    <div className={`p-8 ${isComplete ? 'pt-14' : ''}`}>
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center border border-white/10 overflow-hidden shadow-xl shrink-0">
                                                {balance.barbershop.logoUrl ? (
                                                    <img src={balance.barbershop.logoUrl} alt={balance.barbershop.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Scissors className="w-6 h-6 text-slate-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h2 className="text-lg font-black text-white uppercase tracking-tight truncate">{balance.barbershop.name}</h2>
                                                <p className="text-xs text-slate-400 truncate">{currentPoints} de {maxPoints} pontos</p>
                                            </div>
                                            <Link href={`/${balance.barbershop.slug}`} className="bg-white/5 border border-white/10 text-white p-3 rounded-full hover:bg-primary hover:border-primary transition group">
                                                <ChevronLeft className="w-5 h-5 rotate-180 group-hover:scale-110 transition-transform" />
                                            </Link>
                                        </div>

                                        <div className="grid grid-cols-5 gap-3 sm:gap-4 mb-6 relative z-10">
                                            {slots.map((filled, i) => (
                                                <div key={i} className="aspect-square relative">
                                                    {/* Background Slot */}
                                                    <div className={`absolute inset-0 rounded-full border-2 ${filled ? 'border-primary bg-primary/20' : 'border-slate-800 bg-slate-900 border-dashed'} flex items-center justify-center transition-all duration-500`}>
                                                        {filled ? (
                                                            <div className="w-full h-full p-[20%] text-primary animate-in zoom-in spin-in-12 duration-500">
                                                                {balance.barbershop.logoUrl ? (
                                                                     <img src={balance.barbershop.logoUrl} alt="stamp" className="w-full h-full object-cover rounded-full opacity-80 mix-blend-screen grayscale sepia hue-rotate-180 saturate-200" />
                                                                ) : (
                                                                    <Scissors className="w-full h-full" strokeWidth={3} />
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] font-black text-slate-700">{i + 1}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Progress Bar (Visual sugar) */}
                                        <div className="w-full bg-slate-900 rounded-full h-2 mb-2 border border-white/5 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${isComplete ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,1)]' : 'bg-primary shadow-[0_0_10px_rgba(37,99,235,1)]'}`} 
                                                style={{ width: `${(currentPoints / maxPoints) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    {/* Decorative background logo */}
                                    {balance.barbershop.logoUrl && (
                                        <div className="absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.02] pointer-events-none z-0 mix-blend-luminosity">
                                            <img src={balance.barbershop.logoUrl} alt="bg" className="w-full h-full object-cover blur-sm" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
