'use client';
import { Package } from 'lucide-react';

export default function PackagesTab() {
    return (
        <div className="space-y-4 pb-24">
            {/* Mock Packages */}
            {[
                { name: 'Combo Barba + Cabelo (4x)', price: 200, saves: 'Economize R$ 40' },
                { name: 'Pacote Pai e Filho', price: 150, saves: 'Economize R$ 20' }
            ].map((pkg, idx) => (
                <div key={idx} className="bg-[#111] p-6 rounded-3xl border border-white/5 hover:border-emerald-500/50 transition-all relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-black text-white text-lg uppercase tracking-tight max-w-[70%]">{pkg.name}</h3>
                            <span className="inline-block mt-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest">{pkg.saves}</span>
                        </div>
                        <div className="w-12 h-12 bg-[#1e293b] rounded-2xl flex items-center justify-center text-white group-hover:text-emerald-500 transition">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-end justify-between border-t border-white/10 pt-4">
                        <div>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Valor do Pacote</p>
                            <p className="text-2xl font-black text-white">R$ {pkg.price},00</p>
                        </div>
                        <button className="bg-white text-black px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition">
                            Comprar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
