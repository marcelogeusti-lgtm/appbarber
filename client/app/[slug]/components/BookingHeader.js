import { useState } from 'react';
import { ChevronLeft, Heart, Share2, Star, MapPin, ExternalLink } from 'lucide-react';

export default function BookingHeader({ barbershop, isFavorite, onToggleFavorite, onShare, onOpenMap }) {
    const [logoLightboxOpen, setLogoLightboxOpen] = useState(false);

    if (!barbershop) return null;

    return (
        <>
            <header className="relative h-64 w-full overflow-hidden group">
                {barbershop.bannerUrls && barbershop.bannerUrls.length > 0 ? (
                    // Placeholder for Carousel - for now just use first image or simple img if we don't have the Carousel component ready
                    <img src={barbershop.bannerUrls[0]} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-black z-0"></div>
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10 pointer-events-none"></div>

                <div className="absolute top-6 left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0 z-20 flex items-center gap-4 w-full justify-between sm:justify-start px-4 sm:px-0">
                    <button onClick={() => window.history.back()} className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/70 transition">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex gap-3 sm:hidden">
                        <button onClick={onToggleFavorite} className={`w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 transition ${isFavorite ? 'text-red-500 bg-red-500/10 border-red-500' : 'text-white hover:text-red-500'}`}>
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                        </button>
                        <button onClick={onShare} className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:text-primary transition">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="absolute top-6 right-6 z-20 gap-3 hidden sm:flex">
                    <button onClick={onToggleFavorite} className={`w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 transition ${isFavorite ? 'text-red-500 bg-red-500/10 border-red-500' : 'text-white hover:text-red-500'}`}>
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                    </button>
                    <button onClick={onShare} className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:text-primary transition">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="absolute -bottom-12 left-0 right-0 z-20 px-6 flex flex-col items-center text-center pointer-events-none">
                    <div className="pointer-events-auto cursor-zoom-in" onClick={() => setLogoLightboxOpen(true)}>
                        <div className="w-24 h-24 rounded-full bg-[#111] border-4 border-black shadow-2xl flex items-center justify-center overflow-hidden mb-3 hover:scale-105 transition-transform">
                            {barbershop.logoUrl ? (
                                <img src={barbershop.logoUrl} alt={barbershop.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-black text-3xl text-primary tracking-tighter">{barbershop.name.charAt(0)}</span>
                            )}
                        </div>
                    </div>
                    {barbershop.totalReviews > 0 ? (
                        <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold mb-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className={`w-3 h-3 ${i <= Math.round(barbershop.averageRating) ? 'fill-yellow-500' : 'text-slate-600'}`} />
                            ))}
                            <span className="text-white ml-2">{barbershop.averageRating}</span>
                            <span className="text-slate-400 ml-1 font-medium">({barbershop.totalReviews})</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Novo na plataforma</span>
                        </div>
                    )}
                    <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-1 leading-none drop-shadow-lg">{barbershop.name}</h1>
                    <div className="flex items-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-widest max-w-[80%] drop-shadow-md pointer-events-auto cursor-pointer hover:text-primary transition" onClick={onOpenMap}>
                        <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="truncate">{barbershop.address || 'Endereço não informado'}</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                    </div>
                </div>
            </header>

            {/* LOGO LIGHTBOX */}
            {logoLightboxOpen && (
                <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setLogoLightboxOpen(false)}>
                    <div className="relative max-w-lg w-full aspect-square bg-[#111] rounded-full border-4 border-slate-800 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        {barbershop.logoUrl ? (
                            <img src={barbershop.logoUrl} alt={barbershop.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="font-black text-9xl text-primary tracking-tighter">{barbershop.name.charAt(0)}</span>
                            </div>
                        )}
                        <button className="absolute top-8 right-8 bg-black/50 text-white rounded-full p-2 hover:bg-red-500/20 hover:text-red-500 transition" onClick={() => setLogoLightboxOpen(false)}>
                            X
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
