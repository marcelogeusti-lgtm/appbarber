'use client';
import { FileText, MessageSquare, Zap, Check, Minus, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../contexts/LanguageContext';

export default function ComparisonMatrix() {
    const { t } = useTranslation();
    const cards = [
        {
            title: t('comparison.c1_title'),
            subtitle: t('comparison.c1_sub'),
            icon: <FileText className="w-5 h-5" />,
            accentClass: "border-red-500/10 hover:border-red-500/20 text-red-400 bg-red-950/5",
            pros: false,
            points: [
                t('comparison.c1_p1'),
                t('comparison.c1_p2'),
                t('comparison.c1_p3'),
                t('comparison.c1_p4')
            ]
        },
        {
            title: t('comparison.c2_title'),
            subtitle: t('comparison.c2_sub'),
            icon: <MessageSquare className="w-5 h-5" />,
            accentClass: "border-amber-500/10 hover:border-amber-500/20 text-amber-400 bg-amber-950/5",
            pros: false,
            points: [
                t('comparison.c2_p1'),
                t('comparison.c2_p2'),
                t('comparison.c2_p3'),
                t('comparison.c2_p4')
            ]
        },
        {
            title: t('comparison.c3_title'),
            subtitle: t('comparison.c3_sub'),
            icon: <Zap className="w-5 h-5" />,
            accentClass: "border-primary/30 hover:border-primary/50 text-primary bg-primary/10 shadow-[0_0_50px_rgba(77,114,228,0.15)] scale-[1.02]",
            pros: true,
            points: [
                t('comparison.c3_p1'),
                t('comparison.c3_p2'),
                t('comparison.c3_p3'),
                t('comparison.c3_p4')
            ]
        }
    ];

    const tableRows = [
        { feature: t('comparison.t_r1'), paper: false, whatsapp: false, next: true },
        { feature: t('comparison.t_r2'), paper: false, whatsapp: false, next: true },
        { feature: t('comparison.t_r3'), paper: false, whatsapp: "Limites", next: true },
        { feature: t('comparison.t_r4'), paper: false, whatsapp: false, next: true },
        { feature: t('comparison.t_r5'), paper: false, whatsapp: false, next: true },
        { feature: t('comparison.t_r6'), paper: false, whatsapp: false, next: true },
        { feature: t('comparison.t_r7'), paper: false, whatsapp: false, next: true },
        { feature: t('comparison.t_r8'), paper: false, whatsapp: false, next: true }
    ];

    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden border-t border-white/[0.04]">
            {/* Background Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[130px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-24">
                    {/* LABEL / EYEBROW */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-body bg-white/[0.03] border border-white/[0.08] text-primary tracking-[0.2em] uppercase mb-5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t('comparison.eyebrow')}</span>
                    </div>
                    {/* SUBHEADLINE / HEADING → título secundário */}
                    <h2 className="font-display text-4xl lg:text-6xl font-extrabold text-white mb-6 tracking-[-0.04em] leading-[1.1]">
                        {t('comparison.title_part1')} <br />
                        <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent">{t('comparison.title_highlight')}</span>
                    </h2>
                    {/* BODY TEXT */}
                    <p className="font-body text-slate-400 text-[16px] max-w-xl mx-auto">
                        {t('comparison.subtitle')}
                    </p>
                </div>

                {/* 3 Top Cards Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-24">
                    {cards.map((card, i) => (
                        <div 
                            key={i} 
                            className={`relative rounded-3xl border p-7 sm:p-8 bg-[#09090b]/80 backdrop-blur-xl flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${card.accentClass}`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                                            {card.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-[17px] font-bold text-white font-display">{card.title}</h3>
                                            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider font-body">{card.subtitle}</p>
                                        </div>
                                    </div>
                                    {card.pros && (
                                        <span className="text-[9px] font-black uppercase text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">{t('comparison.recommended')}</span>
                                    )}
                                </div>

                                <ul className="space-y-4">
                                    {card.points.map((point, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-[13px] leading-relaxed font-body text-slate-400">
                                            {card.pros ? (
                                                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            ) : (
                                                <AlertTriangle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                                            )}
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Comparison Table */}
                <div className="mt-16 -mx-4 overflow-x-auto sm:mx-0">
                    <table className="min-w-[640px] w-full border-separate" style={{ borderSpacing: '0 8px' }}>
                        <thead>
                            <tr className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] font-body">
                                <th className="px-6 py-4 text-left font-bold">{t('comparison.t_col1')}</th>
                                <th className="px-3 py-4 text-center font-bold">{t('comparison.t_col2')}</th>
                                <th className="px-3 py-4 text-center font-bold">{t('comparison.t_col3')}</th>
                                <th className="relative px-3 py-4 text-center font-bold text-primary">
                                    <div className="absolute inset-0 bg-primary/[0.03] rounded-t-2xl border-t border-l border-r border-primary/20" />
                                    <span className="relative z-10 flex items-center justify-center gap-1.5 drop-shadow-[0_0_12px_rgba(77,114,228,0.3)]">
                                        <Zap className="w-3.5 h-3.5 fill-current" />
                                        NEXT
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, i) => (
                                <tr key={i} className="group transition-all duration-300 hover:bg-white/[0.015]">
                                    {/* Feature Title */}
                                    <td className="px-6 py-4 text-[14px] text-slate-300 font-medium font-body rounded-l-2xl border-y border-l border-white/[0.02] bg-[#08080a]/30 transition-colors group-hover:text-white">
                                        {row.feature}
                                    </td>
                                    
                                    {/* Paper Status */}
                                    <td className="px-3 py-4 text-center border-y border-white/[0.02] bg-[#08080a]/30">
                                        <Minus className="mx-auto h-4 w-4 text-slate-700" />
                                    </td>
                                    
                                    {/* WhatsApp Status */}
                                    <td className="px-3 py-4 text-center border-y border-white/[0.02] bg-[#08080a]/30 font-body text-[11px] text-slate-500 font-bold">
                                        {row.whatsapp === "Limites" ? (
                                            <span className="bg-white/[0.02] border border-white/[0.06] px-2 py-0.5 rounded-full">{t('comparison.t_limits')}</span>
                                        ) : (
                                            <Minus className="mx-auto h-4 w-4 text-slate-700" />
                                        )}
                                    </td>
                                    
                                    {/* App Barbeiro (NEXT) Status - Glowing column cell */}
                                    <td className="relative px-3 py-4 text-center border-y border-r border-primary/10">
                                        <div className="absolute inset-0 bg-primary/[0.03] border-l border-r border-primary/20 transition-colors duration-300 group-hover:bg-primary/[0.06] rounded-b-none" />
                                        {i === tableRows.length - 1 && (
                                            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary/20 rounded-b-2xl" />
                                        )}
                                        <div className="relative z-10 flex items-center justify-center">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(77,114,228,0.25)] group-hover:scale-110 transition-transform duration-300">
                                                <Check className="h-3.5 w-3.5 stroke-[3px]" />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </section>
    );
}
