'use client';
import { ShoppingBag } from 'lucide-react';

export default function ProductsTab({ products }) {
    const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-10 opacity-50">
                <p className="text-sm font-bold uppercase tracking-widest">Nenhum produto disponível.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 pb-24">
            {products.map(product => (
                <div key={product.id} className="bg-[#111] p-4 rounded-3xl border border-white/5 hover:border-emerald-500/50 transition-all group">
                    <div className="aspect-square bg-[#1e293b] rounded-2xl mb-3 flex items-center justify-center text-slate-600 group-hover:text-emerald-500 transition">
                        <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-white text-xs uppercase tracking-tight line-clamp-1">{product.name}</h3>
                    <p className="text-emerald-500 font-black text-sm mt-1">{formatCurrency(product.price)}</p>
                </div>
            ))}
        </div>
    );
}
