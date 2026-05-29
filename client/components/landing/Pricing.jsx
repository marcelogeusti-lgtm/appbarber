'use client';
import { useState } from 'react';
import { Check, ArrowRight, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import LEDCardWrapper from './LEDCardWrapper';
import { motion } from 'framer-motion';
import { useTranslation } from '../../contexts/LanguageContext';

export default function Pricing() {
    const [isYearly, setIsYearly] = useState(false);
    const { t } = useTranslation();

    const plans = [
        {
            name: "START",
            price: isYearly ? "R$ 47" : "R$ 57",
            desc: t('pricing.plan_start_desc'),
            features: [
                t('pricing.f_start_1'),
                t('pricing.f_start_2'),
                t('pricing.f_start_3'),
                t('pricing.f_start_4'),
                t('pricing.f_start_5')
            ],
            color: "slate",
            bg: "bg-white/[0.02]"
        },
        {
            name: "PRO",
            price: isYearly ? "R$ 87" : "R$ 97",
            desc: t('pricing.plan_pro_desc'),
            features: [
                t('pricing.f_pro_1'),
                t('pricing.f_pro_2'),
                t('pricing.f_pro_3'),
                t('pricing.f_pro_4'),
                t('pricing.f_pro_5'),
                t('pricing.f_pro_6')
            ],
            recommended: true,
            color: "primary",
            bg: "bg-[#0A0A0B]/40"
        },
        {
            name: "ULTIMATE",
            price: isYearly ? "R$ 147" : "R$ 157",
            desc: t('pricing.plan_ultimate_desc'),
            features: [
                t('pricing.f_ult_1'),
                t('pricing.f_ult_2'),
                t('pricing.f_ult_3'),
                t('pricing.f_ult_4'),
                t('pricing.f_ult_5'),
                t('pricing.f_ult_6')
            ],
            color: "slate",
            bg: "bg-white/[0.02]"
        }
    ];

    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden" id="pricing">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="font-display hero-title font-extrabold text-white mb-10 text-balance">
                            {t('pricing.title_part1')} <br />
                            <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent">{t('pricing.title_highlight')}</span>
                        </h2>

                        {/* Toggle Switch */}
                        <div className="flex items-center justify-center gap-6 mt-16 font-body">
                            <span className={`text-[12px] font-black uppercase tracking-[0.2em] transition-colors ${!isYearly ? 'text-white' : 'text-slate-500'}`}>{t('pricing.monthly')}</span>
                            <button
                                onClick={() => setIsYearly(!isYearly)}
                                className="w-16 h-8 bg-white/[0.05] border border-white/10 rounded-full relative p-1.5 transition-all duration-500 hover:border-primary/40 group"
                            >
                                <div className="absolute inset-0 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <motion.div
                                    animate={{ x: isYearly ? 32 : 0 }}
                                    className="w-5 h-5 bg-primary rounded-full shadow-[0_0_15px_#4d72e4] relative z-10"
                                />
                            </button>
                            <span className={`text-[12px] font-black uppercase tracking-[0.2em] transition-colors flex items-center gap-2 ${isYearly ? 'text-white' : 'text-slate-500'}`}>
                                {t('pricing.yearly')}
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded text-[9px] border border-emerald-500/20">-20%</span>
                            </span>
                        </div>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            className="h-full"
                        >
                            <LEDCardWrapper className="h-full rounded-[2.5rem]">
                                <div className={`card-premium relative h-full border ${plan.recommended ? 'border-primary border-2 shadow-[0_40px_100px_rgba(77,114,228,0.15)] ring-4 ring-primary/5' : 'border-white/[0.08] shadow-2xl'} ${plan.bg} flex flex-col group transition-all duration-700 hover:border-white/20`}>

                                    {plan.recommended && (
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary rounded-full flex items-center gap-2.5 shadow-[0_15px_30px_rgba(77,114,228,0.3)] animate-pulse">
                                            <Star className="w-4 h-4 text-white fill-current" />
                                            <span className="font-body text-[10px] font-black text-white uppercase tracking-[0.3em]">{t('pricing.recommended')}</span>
                                        </div>
                                    )}

                                    <div className="mb-14">
                                        <span className="font-body text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">{plan.name}</span>
                                        <div className="flex items-baseline gap-2 mb-6">
                                            <span className="font-display text-4xl lg:text-7xl font-extrabold text-white tracking-tighter">{plan.price}</span>
                                            <span className="font-body text-slate-500 text-[11px] font-black uppercase tracking-[0.25em]">{t('pricing.perMonth')}</span>
                                        </div>
                                        <p className="font-body secondary-text">{plan.desc}</p>
                                    </div>

                                    <div className="space-y-6 flex-1 mb-16">
                                        {plan.features.map((feature, fIdx) => (
                                            <div key={fIdx} className="flex items-center gap-5 group/item transition-all">
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${plan.recommended ? 'bg-primary/20 text-primary' : 'bg-white/[0.04] text-slate-500'} group-hover/item:scale-110 transition-transform`}>
                                                    <Check className="w-3.5 h-3.5 stroke-[4]" />
                                                </div>
                                                <span className="font-body text-[12px] font-bold text-slate-300 uppercase tracking-[0.15em] group-hover/item:text-white transition-colors">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link href="/register" className="relative z-10">
                                        <button className={`w-full py-6 rounded-2xl font-body font-black uppercase text-[11px] tracking-[0.4em] transition-all duration-500 flex items-center justify-center gap-4 ${plan.recommended ? 'bg-white text-black shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-[1.03]' : 'bg-white/[0.04] text-white border border-white/10 hover:bg-white hover:text-black'}`}>
                                            {t('pricing.subscribe')} {plan.name} <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </div>
                            </LEDCardWrapper>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-24 text-center">
                    <p className="font-body text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">{t('pricing.freeTrialText')}</p>
                </div>
            </div>
        </section>
    );
}
