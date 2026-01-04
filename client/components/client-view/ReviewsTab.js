'use client';
import { Star, User } from 'lucide-react';

export default function ReviewsTab() {
    return (
        <div className="space-y-6 pb-24">
            {/* Summary */}
            <div className="bg-[#111] p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-5xl font-black text-white">5.0</h3>
                    <div className="flex text-yellow-500 gap-1 my-2">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-500" />)}
                    </div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Baseado em 128 avaliações</p>
                </div>
                <button className="bg-white text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition">
                    Avaliar
                </button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b border-white/5 pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-white text-xs uppercase">Cliente Anônimo</span>
                            </div>
                            <span className="text-[10px] text-slate-600 font-bold uppercase">Há 2 dias</span>
                        </div>
                        <div className="flex text-yellow-500 gap-1 mb-2 text-[10px]">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 fill-yellow-500" />)}
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            "Melhor barbearia da região! Atendimento impecável e o ambiente é muito top."
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
