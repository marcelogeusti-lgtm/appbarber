'use client';
import { useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';

export default function ProductsTab({ products }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const productsList = Array.isArray(products) ? products : (products?.data || []);

    if (!productsList || productsList.length === 0) {
        return (
            <div className="text-center py-10 opacity-50">
                <p className="text-sm font-bold uppercase tracking-widest">Nenhum produto disponível.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-3 pb-24">
                {productsList.map(product => (
                    <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="bg-[#111] p-4 rounded-2xl border border-white/5 hover:border-emerald-500/50 transition-all group cursor-pointer flex items-center gap-4"
                    >
                        <div className="w-16 h-16 bg-[#1e293b] rounded-xl flex items-center justify-center text-slate-600 group-hover:text-emerald-500 transition overflow-hidden shrink-0">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <ShoppingBag className="w-6 h-6" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-sm uppercase tracking-tight truncate">{product.name}</h3>
                            <p className="text-slate-500 text-xs line-clamp-1">{product.description || 'Clique para ver detalhes'}</p>
                            <p className="text-emerald-500 font-black text-sm mt-1">{formatCurrency(product.price)}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 group-hover:bg-emerald-500 group-hover:text-white transition">
                            <ShoppingBag className="w-4 h-4" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-[#111] w-full max-w-sm rounded-[2rem] border border-slate-800 p-6 relative shadow-2xl animate-in zoom-in-95">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition">
                            <X className="w-4 h-4" />
                        </button>

                        <div className="aspect-square bg-slate-900 rounded-2xl mb-6 overflow-hidden flex items-center justify-center">
                            {selectedProduct.imageUrl ? (
                                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-full h-full object-cover" />
                            ) : (
                                <ShoppingBag className="w-16 h-16 text-slate-700" />
                            )}
                        </div>

                        <h2 className="text-2xl font-black text-white uppercase leading-none mb-2">{selectedProduct.name}</h2>
                        <p className="text-emerald-500 font-black text-xl mb-4">{formatCurrency(selectedProduct.price)}</p>

                        <div className="bg-slate-900/50 p-4 rounded-xl mb-6 max-h-32 overflow-y-auto">
                            <p className="text-slate-400 text-sm">{selectedProduct.description || 'Sem descrição.'}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
