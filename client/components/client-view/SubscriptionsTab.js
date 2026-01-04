'use client';
import { Crown, Check } from 'lucide-react';

export default function SubscriptionsTab({ plans = [] }) {
    const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="space-y-6 pb-24">
            {plans.length > 0 ? (
                plans.map((plan) => (
                    <div key={plan.id} className="bg-gradient-to-b from-[#1e293b] to-[#111] p-1 rounded-[2.5rem] border border-emerald-500/30">
                        <div className="bg-[#111] rounded-[2.3rem] p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                            </div>

                            <h3 className="font-black text-white text-2xl uppercase tracking-tight mb-2">{plan.name}</h3>
                            <p className="text-slate-400 text-sm mb-6 max-w-[80%]">Assinatura exclusiva para quem busca o melhor custo-benefício.</p>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-emerald-500" />
                                    </div>
                                    <span className="text-slate-300 text-sm font-medium">{plan.quantityOfCuts} Cortes inclusos</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-emerald-500" />
                                    </div>
                                    <span className="text-slate-300 text-sm font-medium">Válido por {plan.validityDays} dias</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-emerald-500" />
                                    </div>
                                    <span className="text-slate-300 text-sm font-medium">Agendamento Prioritário</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Valor do Plano</p>
                                    <p className="text-2xl font-black text-white">{formatCurrency(plan.price)}</p>
                                </div>
                                <button className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20">
                                    Assinar Agora
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-10">
                    <Crown className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nenhuma assinatura disponível no momento.</p>
                </div>
            )}
        </div>
    );
}
