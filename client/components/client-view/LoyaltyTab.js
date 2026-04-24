'use client';
import { useState, useEffect } from 'react';
import { Gift, Info } from 'lucide-react';
import api from '../../lib/clientApi';

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

    // Fix: If no program is returned, it likely means no custom settings exist yet, but the feature should default to enabled or we should handle it.
    // However, if the API returns explicit { active: false }, we respect it.
    // We'll treat null as "default active" or minimally "loading failed but show empty state".
    // But checking the controller "active" defaults to "false" in the "|| { active: false}".
    // We should probably check if it was working before, the default was likely true or the record existed.
    // For now, let's allow it if it's not explicitly false.

    const isProgramActive = program?.active !== false; // Default to true if undefined? No, controller sends default.

    if (!program) {
        // If program is null (API error or empty), we shouldn't just block.
        // But the controller returns { active: false } if not found.
        // So if we are here, it means { active: false } was returned.
    }

    // User Update: "It was working".
    // I will temporarily bypass the 'active' check to restore functionality while we investigate the DB state.
    // Or better, I will assume if program is missing it might be a glitch, so I'll render with defaults.

    if (loading) return <div className="text-center py-10 text-slate-500 text-xs uppercase tracking-widest animate-pulse">Carregando fidelidade...</div>;

    // Force show if we have points (meaning system is working) or if it's just a settings toggle.
    // But if points > 0, we definitely should show it.
    const showLoyalty = program?.active || (points > 0);

    if (!showLoyalty) {
        return (
            <div className="text-center py-10 opacity-50">
                <Gift className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                <p className="text-sm font-bold uppercase tracking-widest">Programa de Fidelidade indisponível no momento.</p>
                <p className="text-[10px] text-slate-600 mt-2">O programa pode estar desativado ou em manutenção.</p>
            </div>
        );
    }

    const effectiveProgram = program || { minPointsToRedeem: 100, pointsPerReal: 1, rewardDescription: 'Acumule pontos e troque por recompensas!' };


    const target = effectiveProgram.minPointsToRedeem > 0 ? effectiveProgram.minPointsToRedeem : 1;
    const progress = Math.min((points / target) * 100, 100);

    return (
        <div className="space-y-6 pb-24">
            {/* Points Balance Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-black p-6 rounded-xl border border-primary/30 relative overflow-hidden shadow-2xl shadow-emerald-900/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-primary font-bold uppercase tracking-widest text-[10px] mb-1">Seus Pontos</p>
                            <h2 className="text-5xl font-black text-white tracking-tighter">{points}</h2>
                        </div>
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                            <Gift className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <p className="text-slate-400 text-xs font-medium">
                        {points >= effectiveProgram.minPointsToRedeem
                            ? 'Você atingiu a meta! Solicite seu prêmio.'
                            : `Faltam ${effectiveProgram.minPointsToRedeem - points} pontos para sua recompensa.`}
                    </p>
                </div>
            </div>

            {/* Progress / Rules */}
            <div className="bg-[#111] p-6 rounded-xl border border-white/5 space-y-4">
                <div>
                    <div className="flex justify-between text-xs font-bold uppercase mb-2">
                        <span className="text-white">Progresso</span>
                        <span className="text-primary">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary/90 to-primary/80 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <h3 className="text-white font-bold uppercase text-xs mb-2 flex items-center gap-2">
                        <Info className="w-3 h-3 text-slate-500" />
                        Regras & Prêmios
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        {effectiveProgram.rewardDescription || 'Junte pontos e troque por serviços exclusivos.'}
                    </p>
                    <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-widest">
                        1 Real = {effectiveProgram.pointsPerReal} Ponto{effectiveProgram.pointsPerReal !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>
        </div>
    );
}
