'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '../../contexts/LanguageContext';

export default function PerspectiveCTA() {
    const { t } = useTranslation();
    const [coords, setCoords] = useState({ rotateX: 0, rotateY: 0, mx: "50%", my: "50%" });
    const [hovering, setHovering] = useState(false);
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        
        // Cursor positions relative to the card dimensions
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Find centers of the card
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Offsets normalized to range [-1, 1]
        const offsetX = (x - centerX) / centerX;
        const offsetY = (y - centerY) / centerY;
        
        // Calculate smooth rotation (max 10 degrees)
        const maxRotation = 10;
        const rotateX = -offsetY * maxRotation;
        const rotateY = offsetX * maxRotation;
        
        // Spotlight gradient percentage strings
        const mx = `${(x / rect.width) * 100}%`;
        const my = `${(y / rect.height) * 100}%`;
        
        setCoords({ rotateX, rotateY, mx, my });
        setHovering(true);
    };

    const handleMouseLeave = () => {
        setHovering(false);
        setCoords({ rotateX: 0, rotateY: 0, mx: "50%", my: "50%" });
    };

    return (
        <section className="relative overflow-hidden bg-[#050505] px-5 py-28 sm:px-6 sm:py-36 perspective-[2000px]">
            {/* Grid decoration */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>
            
            {/* Soft Ambient glowing orbs */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[50rem] w-[50rem] rounded-full bg-primary/5 opacity-40 blur-[150px]" />
            
            {/* 3D Slanted Preserve-3d card container */}
            <div 
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="group relative z-20 mx-auto max-w-4xl select-none"
                style={{
                    perspective: '2000px',
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* Slanted actual wrapper box */}
                <div 
                    className="relative rounded-[32px] border border-white/[0.07] bg-[#0A0A0C]/80 px-8 py-16 text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.85),_0_0_80px_rgba(77,114,228,0.06)] backdrop-blur-2xl sm:px-16 overflow-hidden"
                    style={{
                        transform: `rotateX(${coords.rotateX}deg) rotateY(${coords.rotateY}deg)`,
                        transition: hovering ? 'transform 0.05s ease-out, border-color 0.5s' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s',
                        transformStyle: 'preserve-3d',
                        borderColor: hovering ? 'rgba(77, 114, 228, 0.25)' : 'rgba(255, 255, 255, 0.07)'
                    }}
                >
                    {/* Glowing Spotlight Overlay - Tracks mouse pointer */}
                    <div 
                        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500" 
                        style={{
                            background: hovering 
                                ? `radial-gradient(700px circle at ${coords.mx} ${coords.my}, rgba(77,114,228,0.08), transparent 60%)`
                                : 'none',
                            opacity: hovering ? 1 : 0
                        }}
                    />

                    {/* Laser Neon Light Border on Top */}
                    <div 
                        aria-hidden="true" 
                        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-3xl transition-opacity duration-500"
                        style={{
                            background: `linear-gradient(90deg, transparent 15%, rgba(77,114,228,0.55) 50%, transparent 85%)`,
                            opacity: hovering ? 1 : 0.4
                        }}
                    />

                    {/* Sparkles Floating Icon [translateZ(30px)] */}
                    <div 
                        className="relative z-10 mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_30px_-5px_rgba(77,114,228,0.7)] transition-all duration-300"
                        style={{ 
                            transform: 'translateZ(30px)',
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        <Sparkles className="h-5 w-5 fill-current animate-pulse" />
                    </div>

                    {/* Heading [translateZ(45px)] */}
                    <h2 
                        className="relative z-10 mt-8 text-[32px] font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-[50px] font-display"
                        style={{ 
                            transform: 'translateZ(45px)',
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        {t('perspectiveCta.title1')} <br />
                        <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent">{t('perspectiveCta.title2')}</span>
                    </h2>

                    {/* Subtitle [translateZ(20px)] */}
                    <p 
                        className="relative z-10 mt-6 text-slate-400 text-base max-w-md mx-auto leading-relaxed font-body"
                        style={{ 
                            transform: 'translateZ(20px)',
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        {t('perspectiveCta.subtitle')}
                    </p>

                    {/* Features checklist row [translateZ(25px)] */}
                    <ul 
                        className="relative z-10 mx-auto mt-9 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[12px] font-body font-black text-slate-400 uppercase tracking-wider"
                        style={{ 
                            transform: 'translateZ(25px)',
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        <li className="inline-flex items-center gap-2">
                            <Check className="h-4.5 w-4.5 text-primary stroke-[3px]" />
                            <span>{t('perspectiveCta.feature1')}</span>
                        </li>
                        <li className="inline-flex items-center gap-2">
                            <Check className="h-4.5 w-4.5 text-primary stroke-[3px]" />
                            <span>{t('perspectiveCta.feature2')}</span>
                        </li>
                        <li className="inline-flex items-center gap-2">
                            <Check className="h-4.5 w-4.5 text-primary stroke-[3px]" />
                            <span>{t('perspectiveCta.feature3')}</span>
                        </li>
                    </ul>

                    {/* CTAs [translateZ(50px)] */}
                    <div 
                        className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-4"
                        style={{ 
                            transform: 'translateZ(50px)',
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        <Link href="/register">
                            <button className="group/btn inline-flex items-center gap-3 rounded-xl bg-white text-black px-8 py-4 text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(255,255,255,0.06)] hover:scale-[1.03] active:scale-[0.98] transition-all font-body">
                                {t('perspectiveCta.btnStart')}
                                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                            </button>
                        </Link>
                        <Link href="/login">
                            <button className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all font-body">
                                {t('perspectiveCta.btnAccess')}
                            </button>
                        </Link>
                    </div>

                    {/* Trust row [translateZ(10px)] */}
                    <div 
                        className="relative z-10 mt-10 inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] text-slate-500 uppercase tracking-widest font-black font-body"
                        style={{ 
                            transform: 'translateZ(10px)',
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        <span className="inline-flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary/80" />
                            <span>{t('perspectiveCta.trust1')}</span>
                        </span>
                        <span className="hidden h-1 w-1 rounded-full bg-white/15 sm:block"></span>
                        <span>{t('perspectiveCta.trust2')}</span>
                    </div>

                </div>
            </div>
        </section>
    );
}
