'use client';

import { Star, MapPin, Clock, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BarberCard({ shop }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="group relative bg-[#1E1E1E]/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all"
        >
            <Link href={`/${shop.slug}`}>
                <div className="relative h-48 w-full overflow-hidden">
                    {shop.logoUrl ? (
                        <Image
                            src={shop.logoUrl}
                            alt={shop.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#2a2a2a] to-[#121212] flex items-center justify-center">
                            <span className="text-4xl">💈</span>
                        </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {shop.isOpen ? (
                            <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-green-500/90 text-white rounded-full backdrop-blur-sm">
                                Aberto
                            </span>
                        ) : (
                            <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-red-500/90 text-white rounded-full backdrop-blur-sm">
                                Fechado
                            </span>
                        )}
                    </div>

                    {shop.distance !== null && (
                        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-primary" />
                            <span className="text-[11px] font-medium text-white">{shop.distance} km</span>
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white text-lg leading-tight group-hover:text-primary transition-colors">
                            {shop.name}
                        </h3>
                        {shop.averageRating && (
                            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-white">{shop.averageRating}</span>
                            </div>
                        )}
                    </div>

                    <p className="text-white/40 text-sm line-clamp-1 mb-4 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        {shop.address}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">A partir de</span>
                            <span className="text-primary font-black text-lg">
                                R$ {shop.services?.[0]?.price || '0,00'}
                            </span>
                        </div>
                        <button className="px-4 py-2 bg-primary text-black font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors">
                            Reservar
                        </button>
                    </div>
                </div>
            </Link>

            <button className="absolute top-3 right-3 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/5 rounded-full text-white/60 hover:text-red-500 transition-all z-10">
                <Heart className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
