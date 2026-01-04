'use client';
import { Gift } from 'lucide-react';

export default function LoyaltyTab({ points = 0 }) {
    return (
        <div className="space-y-6 pb-24">
            {/* Points Balance Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-black p-6 rounded-3xl border border-emerald-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full"></div>
                <div className="relative z-10 text-center">
                    <p className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] mb-1">Seus Pontos</p>
                    <h2 className="text-5xl font-black text-white">{points}</h2>
                    <p className="text-slate-400 text-xs mt-2 font-medium">
                        {points > 0 ? 'Parabéns! Continue agendando para ganhar mais.' : 'Faça agendamentos para ganhar pontos!'}
                    </p>
                </div>
            </div>

            {/* Rewards List */}
            <div className="space-y-4">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs border-b border-white/10 pb-2">Prêmios Disponíveis</h3>
                {[
                    { name: 'Corte de Cabelo', pts: 100 },
                    { name: 'Barba Completa', pts: 60 },
                    { name: 'Hidratação', pts: 40 }
                ].map((reward, i) => {
                    const canAfford = points >= reward.pts;
                    return (
                        <div key={i} className={`bg-[#111] p-4 rounded-2xl border flex items-center gap-4 transition-all ${canAfford ? 'border-emerald-500/50' : 'border-white/5 opacity-50'}`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${canAfford ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                <Gift className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm uppercase ${canAfford ? 'text-white' : 'text-slate-400'}`}>{reward.name}</h4>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${canAfford ? 'text-emerald-500' : 'text-emerald-900'}`}>Requer {reward.pts} pontos</p>
                            </div>
                            {canAfford && (
                                <button className="ml-auto bg-emerald-500 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase">Resgatar</button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
