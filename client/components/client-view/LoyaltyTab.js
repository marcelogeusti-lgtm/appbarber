'use client';
import { Gift } from 'lucide-react';

export default function LoyaltyTab() {
    return (
        <div className="space-y-6 pb-24">
            {/* Points Balance Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-black p-6 rounded-3xl border border-emerald-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full"></div>
                <div className="relative z-10 text-center">
                    <p className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] mb-1">Seus Pontos</p>
                    <h2 className="text-5xl font-black text-white">0</h2>
                    <p className="text-slate-400 text-xs mt-2 font-medium">Faça agendamentos para ganhar pontos!</p>
                </div>
            </div>

            {/* Rewards List */}
            <div className="space-y-4">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs border-b border-white/10 pb-2">Prêmios Disponíveis</h3>
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-[#111] p-4 rounded-2xl border border-white/5 opacity-50 flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                            <Gift className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-400 text-sm uppercase">Corte Grátis</h4>
                            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Requer 100 pontos</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
