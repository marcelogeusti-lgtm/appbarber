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

    if (loading) return <div className="text-center py-10 text-slate-500 text-xs uppercase tracking-widest animate-pulse">Carregando fidelidade...</div>;

    if (!program || !program.active) {
        return (
            <div className="text-center py-10 opacity-50">
                <Gift className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                <p className="text-sm font-bold uppercase tracking-widest">Programa de Fidelidade indisponível no momento.</p>
            </div>
        );
    }

    const progress = Math.min((points / program.minPointsToRedeem) * 100, 100);

    return (
        <div className="space-y-6 pb-24">
            {/* Points Balance Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-black p-6 rounded-[2rem] border border-emerald-500/30 relative overflow-hidden shadow-2xl shadow-emerald-900/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] mb-1">Seus Pontos</p>
                            <h2 className="text-5xl font-black text-white tracking-tighter">{points}</h2>
                        </div>
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                            <Gift className="w-6 h-6 text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-slate-400 text-xs font-medium">
                        {points >= program.minPointsToRedeem
                            ? 'Você atingiu a meta! Solicite seu prêmio.'
                            : `Faltam ${program.minPointsToRedeem - points} pontos para sua recompensa.`}
                    </p>
                </div>
            </div>

            {/* Progress / Rules */}
            <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 space-y-4">
                <div>
                    <div className="flex justify-between text-xs font-bold uppercase mb-2">
                        <span className="text-white">Progresso</span>
                        <span className="text-emerald-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <h3 className="text-white font-bold uppercase text-xs mb-2 flex items-center gap-2">
                        <Info className="w-3 h-3 text-slate-500" />
                        Regras & Prêmios
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        {program.rewardDescription || 'Junte pontos e troque por serviços exclusivos.'}
                    </p>
                    <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-widest">
                        1 Real = {program.pointsPerReal} Ponto{program.pointsPerReal !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>
        </div>
    );
}
