'use client';
import { Star, Sparkles } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

export default function Testimonials() {
    const { t } = useTranslation();

    const row1 = [
        {
            name: t('group1.t1_name'),
            role: t('group1.t1_role'),
            initials: "JP",
            bg: "from-blue-500 to-indigo-600",
            text: t('group1.t1_text')
        },
        {
            name: t('group1.t2_name'),
            role: t('group1.t2_role'),
            initials: "MN",
            bg: "from-purple-500 to-pink-600",
            text: t('group1.t2_text')
        },
        {
            name: t('group1.t3_name'),
            role: t('group1.t3_role'),
            initials: "PH",
            bg: "from-emerald-500 to-teal-600",
            text: t('group1.t3_text')
        },
        {
            name: t('group1.t4_name'),
            role: t('group1.t4_role'),
            initials: "BC",
            bg: "from-amber-500 to-orange-600",
            text: t('group1.t4_text')
        },
        {
            name: t('group1.t5_name'),
            role: t('group1.t5_role'),
            initials: "LS",
            bg: "from-cyan-500 to-blue-600",
            text: t('group1.t5_text')
        },
        {
            name: t('group1.t6_name'),
            role: t('group1.t6_role'),
            initials: "MS",
            bg: "from-blue-600 to-indigo-700",
            text: t('group1.t6_text')
        }
    ];

    const row2 = [
        {
            name: t('group1.t7_name'),
            role: t('group1.t7_role'),
            initials: "CR",
            bg: "from-teal-500 to-blue-600",
            text: t('group1.t7_text')
        },
        {
            name: t('group1.t8_name'),
            role: t('group1.t8_role'),
            initials: "TM",
            bg: "from-indigo-500 to-purple-600",
            text: t('group1.t8_text')
        },
        {
            name: t('group1.t9_name'),
            role: t('group1.t9_role'),
            initials: "FL",
            bg: "from-pink-500 to-rose-600",
            text: t('group1.t9_text')
        },
        {
            name: t('group1.t10_name'),
            role: t('group1.t10_role'),
            initials: "RM",
            bg: "from-cyan-500 to-blue-600",
            text: t('group1.t10_text')
        },
        {
            name: t('group1.t11_name'),
            role: t('group1.t11_role'),
            initials: "AC",
            bg: "from-emerald-600 to-green-700",
            text: t('group1.t11_text')
        },
        {
            name: t('group1.t12_name'),
            role: t('group1.t12_role'),
            initials: "GS",
            bg: "from-orange-500 to-red-600",
            text: t('group1.t12_text')
        }
    ];
    
    // Render a single testimonial card with correct spacing and typography
    const renderCard = (t, i) => (
        <div 
            key={i} 
            className="w-[310px] sm:w-[360px] shrink-0 p-6 rounded-[24px] bg-[#0A0A0C]/90 border border-white/[0.04] backdrop-blur-xl hover:border-primary/20 hover:bg-[#0E0E12]/80 transition-all duration-300 relative select-none"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${t.bg} flex items-center justify-center text-white text-[11px] font-black font-mono shadow-md`}>
                        {t.initials}
                    </div>
                    <div>
                        <h4 className="text-[14px] sm:text-base font-bold text-white font-display leading-tight">{t.name}</h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-body leading-tight mt-0.5">{t.role}</p>
                    </div>
                </div>

                {/* Highly Realistic Google Multi-color G Icon */}
                <svg className="w-3.5 h-3.5 shrink-0 opacity-80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
            </div>

            {/* Rating Stars */}
            <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-[13px] sm:text-[14px] leading-relaxed text-slate-300 font-body">
                "{t.text}"
            </p>
        </div>
    );

    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden border-t border-white/[0.04]">
            {/* Background Grid */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
            
            <div className="container mx-auto px-4 relative z-10 mb-20">
                {/* Section Title */}
                <div className="text-center max-w-3xl mx-auto">
                    {/* LABEL / EYEBROW */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-body bg-white/[0.03] border border-white/[0.08] text-primary tracking-[0.2em] uppercase mb-5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t('group1.testimonials_label')}</span>
                    </div>
                    {/* SUBHEADLINE / HEADING */}
                    <h2 className="font-display text-4xl lg:text-6xl font-extrabold text-white mb-6 tracking-[-0.04em] leading-[1.1]">
                        {t('group1.testimonials_heading_1')} <br />
                        <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent">{t('group1.testimonials_heading_2')}</span>
                    </h2>
                    {/* BODY TEXT */}
                    <p className="font-body text-slate-400 text-lg max-w-xl mx-auto">
                        {t('group1.testimonials_description')}
                    </p>
                </div>
            </div>

            {/* Infinite Carousels Area */}
            <div className="flex flex-col gap-6 relative w-full overflow-hidden py-4 select-none">
                
                {/* ROW 1: Moves Left */}
                <div className="flex overflow-hidden w-full relative group">
                    <div className="flex shrink-0 animate-marquee gap-6 pr-6">
                        {row1.map((t, idx) => renderCard(t, `r1-${idx}`))}
                    </div>
                    <div className="flex shrink-0 animate-marquee gap-6 pr-6" aria-hidden="true">
                        {row1.map((t, idx) => renderCard(t, `r1-dup-${idx}`))}
                    </div>
                </div>

                {/* ROW 2: Moves Right */}
                <div className="flex overflow-hidden w-full relative group">
                    <div className="flex shrink-0 animate-marquee-reverse gap-6 pr-6">
                        {row2.map((t, idx) => renderCard(t, `r2-${idx}`))}
                    </div>
                    <div className="flex shrink-0 animate-marquee-reverse gap-6 pr-6" aria-hidden="true">
                        {row2.map((t, idx) => renderCard(t, `r2-dup-${idx}`))}
                    </div>
                </div>

            </div>

            {/* Embedded Marquee keyframe styles with 12s duration and -100% translation loop */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
                @keyframes marquee-reverse {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(0); }
                }
                .animate-marquee {
                    animation: marquee 12s linear infinite;
                }
                .animate-marquee-reverse {
                    animation: marquee-reverse 12s linear infinite;
                }
                .group:hover .animate-marquee, 
                .group:hover .animate-marquee-reverse {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}
