'use client';
import { Package } from 'lucide-react';

export default function PackagesTab({ plans = [] }) {
    const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="space-y-4 pb-24">
            {plans.length > 0 ? (
                plans.map((pkg) => (
                    <div key={pkg.id} className="bg-[#111] p-6 rounded-3xl border border-white/5 hover:border-emerald-500/50 transition-all relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-black text-white text-lg uppercase tracking-tight max-w-[70%]">{pkg.name}</h3>
                                <div className="flex gap-2 mt-2">
                                    <span className="inline-block bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest">
                                        {pkg.quantityOfCuts} Cortes
                                    </span>
                                    <span className="inline-block bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest">
                                        Validez: {pkg.validityDays} dias
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-[#1e293b] rounded-2xl flex items-center justify-center text-white group-hover:text-emerald-500 transition">
                                <Package className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex items-end justify-between border-t border-white/10 pt-4">
                            <div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Valor do Pacote</p>
                                <p className="text-2xl font-black text-white">{formatCurrency(pkg.price)}</p>
                            </div>
                            <button className="bg-white text-black px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition shadow-lg">
                                Comprar
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-10">
                    <Package className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nenhum pacote disponível no momento.</p>
                </div>
            )}
        </div>
    );
}
