'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ChevronLeft, MapPin, Star, ChevronRight, Loader2 } from 'lucide-react';
import api from '../../../lib/clientApi';

export default function FavoritesPage() {
    const router = useRouter();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadFavorites() {
            try {
                // Derived from appointments for demo/MVP as per existing code
                const res = await api.get('/appointments/me');
                const apps = res.data || [];
                const uniqueShops = [];
                const seen = new Set();

                apps.forEach(app => {
                    if (app.barbershop && !seen.has(app.barbershop.id)) {
                        seen.add(app.barbershop.id);
                        uniqueShops.push(app.barbershop);
                    }
                });

                setFavorites(uniqueShops);
            } catch (error) {
                console.error("Failed to load favorites", error);
            } finally {
                setLoading(false);
            }
        }
        loadFavorites();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#050505] to-black text-white font-sans px-5 pt-8 pb-32 max-w-7xl mx-auto overflow-x-hidden">
            
            {/* Header */}
            <header className="flex items-center gap-4 mb-10 px-1">
                <button onClick={() => router.back()} className="w-10 h-10 glass-premium rounded-xl flex items-center justify-center text-slate-400 active:scale-95 transition-all">
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                    <h1 className="text-xl font-black text-white uppercase italic tracking-tight">Favoritos</h1>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">Seus locais preferidos</p>
                </div>
            </header>

            <div className="space-y-6 px-1">
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {favorites.map(shop => (
                            <div
                                key={shop.id}
                                onClick={() => router.push(`/${shop.slug}`)}
                                className="glass-premium rounded-[2.5rem] p-5 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer border border-white/5 active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[1.5rem] glass-premium flex items-center justify-center relative overflow-hidden border-white/10 shadow-inner p-1">
                                        {shop.logoUrl ? (
                                            <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            <span className="text-xl font-black text-primary uppercase">{shop.name[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-base text-white group-hover:text-primary transition uppercase tracking-tight italic">{shop.name}</h3>
                                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-1 overflow-hidden">
                                            <MapPin className="w-3 h-3 text-primary shrink-0" /> 
                                            <span className="truncate">{shop.address || 'Endereço Premium'}</span>
                                        </p>
                                        <div className="flex items-center gap-1 mt-2">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} className="w-2.5 h-2.5 text-primary fill-primary" />
                                            ))}
                                            <span className="text-[8px] font-black text-white ml-1 opacity-40 uppercase tracking-widest">Master Class</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 glass-premium rounded-xl flex items-center justify-center text-slate-700 group-hover:text-primary group-hover:scale-110 transition-all">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 glass-premium rounded-full flex items-center justify-center mb-6 relative">
                            <Heart className="w-8 h-8 text-slate-700" strokeWidth={1} />
                            <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse opacity-20"></div>
                        </div>
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-2">Lista Vazia</h3>
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] max-w-xs mx-auto mb-10">
                            Sua lista de favoritos está aguardando por você.
                        </p>
                        <button onClick={() => router.push('/search')} className="px-10 py-5 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all">
                            Encontrar Barbearias
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
