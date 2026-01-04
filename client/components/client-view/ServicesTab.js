'use client';
import { ShoppingBag } from 'lucide-react';

export default function ServicesTab({ services, onSelect }) {
    const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="space-y-4 pb-24">
            {/* Search Input Placeholder */}
            {/* <div className="relative">
                <Search className="absolute left-4 top-4 text-slate-500 w-5 h-5" />
                <input placeholder="Pesquisar serviço..." className="w-full bg-[#1e293b] p-4 pl-12 rounded-2xl text-white font-bold text-sm outline-none border border-slate-800 focus:border-emerald-500 transition" />
            </div> */}

            {services?.map(service => (
                <div key={service.id} className="bg-[#111] p-4 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-emerald-500/50 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            {/* Icon based on service name? For now generic */}
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm uppercase tracking-wide">{service.name}</h3>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                <span>{formatCurrency(service.price)}</span>
                                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                <span>{service.duration} min</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => onSelect(service)}
                        className="bg-[#0070f3] text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition"
                    >
                        Agendar
                    </button>
                </div>
            ))}
        </div>
    );
}
