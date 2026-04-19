'use client';

import { X, Star, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuickBookingModal({ isOpen, onClose, favorites = [] }) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Agendamento Rápido</h2>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <p className="text-slate-400 text-sm mb-6">
                        Selecione uma de suas barbearias favoritas para agendar agora:
                    </p>

                    <div className="space-y-3 max-h-[40vh] overflow-y-auto no-scrollbar mb-6">
                        {favorites.map((shop) => (
                            <button
                                key={shop.id}
                                onClick={() => {
                                    router.push(`/${shop.slug}`);
                                    onClose();
                                }}
                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                                        <img 
                                            src={shop.logoUrl || '/default-barber.png'} 
                                            alt={shop.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{shop.name}</h3>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                            <span>{shop.averageRating || '5.0'}</span>
                                            <span className="mx-1">•</span>
                                            <span>{shop.address?.city || 'Local próximo'}</span>
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-primary transition-all group-hover:translate-x-1" />
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            router.push('/buscar');
                            onClose();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-black font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                    >
                        Ver todas as barbearias
                    </button>
                </div>
            </div>
        </div>
    );
}
