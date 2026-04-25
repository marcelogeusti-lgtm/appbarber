'use client';

import { useState, useEffect } from 'react';
import { Gift, Info, Sparkles, Zap, Award } from 'lucide-react';
import api from '../../lib/clientApi';
import { motion } from 'framer-motion';

export default function LoyaltyTab({ points = 0, barbershopId }) {
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (barbershopId) {
            api.get(`/loyalty?barbershopId=${barbershopId}`)
                .then(res => {
                    setProgram(res.data);
                })
                .catch(err => console.error("Error fetching loyalty program", err))
                .finally(() => setLoading(false));
        }
    }, [barbershopId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] animate-pulse">Carregando...</p>
            </div>
        );
    }

    const effectiveProgram = program || { 
        active: false, 
        minPointsToRedeem: 100, 
        pointsPerReal: 1, 
        rewardDescription: 'Acumule pontos e troque por recompensas!' 
    };

    const showLoyalty = effectiveProgram.active || (points > 0);

    if (!showLoyalty) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 px-6 bg-card/40 rounded-3xl border border-white/5"
            >
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Gift className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-foreground">Programa de Fidelidade</p>
                <p className="text-xs text-muted-foreground mt-2 max-w-[200px] mx-auto leading-relaxed">
                    O programa de pontos desta unidade está temporariamente indisponível.
                </p>
            </motion.div>
        );
    }

    const target = effectiveProgram.minPointsToRedeem > 0 ? effectiveProgram.minPointsToRedeem : 1;
    const progress = Math.min((points / target) * 100, 100);
    const isReady = points >= target;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 pb-24"
        >
            {/* Points Balance Card */}
            <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/5 bg-black p-8 shadow-2xl">
                {/* Animated Background Gradients */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                                <p className="text-primary font-black uppercase tracking-[0.25em] text-[10px]">Seu Saldo</p>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <h2 className="text-7xl font-black text-white tracking-tighter tabular-nums">{points}</h2>
                                <span className="text-primary/40 font-black text-sm uppercase tracking-tighter">PTS</span>
                            </div>
                        </div>
                        <motion.div 
                            animate={isReady ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl ${
                                isReady 
                                ? 'bg-primary border-primary shadow-primary/20 text-white' 
                                : 'bg-white/5 border-white/10 text-primary'
                            }`}
                        >
                            {isReady ? <Award className="w-8 h-8" /> : <Gift className="w-8 h-8" />}
                        </motion.div>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-4 rounded-2xl">
                        <p className="text-white/80 text-xs font-bold flex items-center gap-2">
                            {isReady ? (
                                <>
                                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span>Você atingiu a meta! Resgate seu prêmio agora.</span>
                                </>
                            ) : (
                                <>
                                    <Target className="w-4 h-4 text-primary" />
                                    <span>Faltam {target - points} pontos para sua próxima recompensa.</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress / Rules */}
            <div className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 space-y-8">
                <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                        <span className="text-white/60">Progresso Atual</span>
                        <span className="text-primary">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite]"></div>
                        </motion.div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                    <h3 className="text-white font-black uppercase text-xs mb-4 flex items-center gap-2 tracking-widest">
                        <Info className="w-4 h-4 text-primary" />
                        Regras & Prêmios
                    </h3>
                    <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                        <p className="text-white/60 text-sm leading-relaxed italic font-medium">
                            "{effectiveProgram.rewardDescription || 'Acumule pontos em cada atendimento e troque por serviços ou descontos exclusivos!'}"
                        </p>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-3">
                        <div className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                            <p className="text-[10px] text-primary font-black uppercase tracking-tighter">
                                R$ 1.00 = {effectiveProgram.pointsPerReal} PONTOS
                            </p>
                        </div>
                        <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-tighter">
                                META: {target} PTS
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
            `}</style>
        </motion.div>
    );
}
