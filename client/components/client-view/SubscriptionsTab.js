'use client';
import { Crown, Check } from 'lucide-react';

export default function SubscriptionsTab() {
    return (
        <div className="space-y-6 pb-24">
            {/* Mock Subscription */}
            <div className="bg-gradient-to-b from-[#1e293b] to-[#111] p-1 rounded-[2.5rem] border border-emerald-500/30">
                <div className="bg-[#111] rounded-[2.3rem] p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                    </div>

                    <h3 className="font-black text-white text-2xl uppercase tracking-tight mb-2">Clube VIP</h3>
                    <p className="text-slate-400 text-sm mb-6 max-w-[80%]">Tenha cortes ilimitados e descontos exclusivos em produtos.</p>

                    <div className="space-y-3 mb-8">
                        {['Cortes Ilimitados', '10% OFF em Produtos', 'Agendamento Prioritário'].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-emerald-500" />
                                </div>
                                <span className="text-slate-300 text-sm font-medium">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Mensalidade</p>
                            <p className="text-2xl font-black text-white">R$ 99,90</p>
                        </div>
                        <button className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20">
                            Assinar Agora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
