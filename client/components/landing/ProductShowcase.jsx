'use client';
import { TrendingUp, Calendar, Zap, Smartphone, Check, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import LEDCardWrapper from './LEDCardWrapper';
import { motion } from 'framer-motion';
import { useTranslation } from '../../contexts/LanguageContext';

export default function ProductShowcase() {
    const { t } = useTranslation();

    const sections = [
        {
            title: t('group3.productShowcase.sections.0.title'),
            desc: t('group3.productShowcase.sections.0.desc'),
            isAgenda: true,
            features: [
                t('group3.productShowcase.sections.0.features.0'),
                t('group3.productShowcase.sections.0.features.1'),
                t('group3.productShowcase.sections.0.features.2')
            ]
        },
        {
            title: t('group3.productShowcase.sections.1.title'),
            desc: t('group3.productShowcase.sections.1.desc'),
            isAnalytics: true,
            features: [
                t('group3.productShowcase.sections.1.features.0'),
                t('group3.productShowcase.sections.1.features.1'),
                t('group3.productShowcase.sections.1.features.2')
            ],
            reverse: true
        },
        {
            title: t('group3.productShowcase.sections.2.title'),
            desc: t('group3.productShowcase.sections.2.desc'),
            isBooking: true,
            features: [
                t('group3.productShowcase.sections.2.features.0'),
                t('group3.productShowcase.sections.2.features.1'),
                t('group3.productShowcase.sections.2.features.2')
            ]
        }
    ];

    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden">
            <div className="container mx-auto px-4">

                <div className="text-center max-w-4xl mx-auto mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* SUBHEADLINE / HEADING → título secundário */}
                        <h2 className="font-display hero-title font-extrabold text-white mb-6 text-balance">
                            {t('group3.productShowcase.headingLine1')} <br />
                            <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent">{t('group3.productShowcase.headingLine2')}</span>
                        </h2>
                        {/* BODY TEXT */}
                        <p className="font-body secondary-text font-medium max-w-2xl mx-auto">
                            {t('group3.productShowcase.bodyText')}
                        </p>
                    </motion.div>
                </div>

                <div className="space-y-48">
                    {sections.map((section, idx) => (
                        <div key={idx} className="grid lg:grid-cols-2 gap-20 items-center">

                            {/* visual Side */}
                            <motion.div
                                initial={{ opacity: 0, x: section.reverse ? 40 : -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className={`relative group ${section.reverse ? 'lg:order-2' : ''}`}
                            >
                                <LEDCardWrapper className="h-full">
                                    <div className="card-premium relative border border-white/[0.08] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] bg-[#0A0A0B]/60 backdrop-blur-3xl group/img h-full transition-all duration-700 hover:border-white/20">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none z-10" />

                                        {section.isAgenda ? (
                                            <img
                                                src="/screenshots/agenda-schedule.png"
                                                alt="Agenda Maestro"
                                                className="w-full h-auto rounded-2xl transition-transform duration-[1.5s] group-hover/img:scale-105"
                                            />
                                        ) : section.isAnalytics ? (
                                            <img
                                                src="/screenshots/analytics-performance.png"
                                                alt="Analytics Performance"
                                                className="w-full h-auto rounded-2xl transition-transform duration-[1.5s] group-hover/img:scale-105"
                                            />
                                        ) : (
                                            <div className="relative w-full aspect-video flex justify-center items-center bg-[#050505] rounded-2xl overflow-hidden border border-white/[0.06]">
                                                {/* Mobile Frame Simulation within the card */}
                                                <div className="relative w-[180px] lg:w-[220px] aspect-[9/19] rounded-[2rem] border-[6px] border-[#1A1A1A] bg-black overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-90 group-hover/img:scale-100 transition-transform duration-1000">
                                                    <img
                                                        src="/screenshots/online-booking-mobile.png"
                                                        alt="Mobile Booking"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </LEDCardWrapper>
                            </motion.div>

                            {/* Text Side */}
                            <motion.div
                                initial={{ opacity: 0, x: section.reverse ? -40 : 40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className={section.reverse ? 'lg:order-1' : ''}
                            >
                                {/* LABEL / EYEBROW */}
                                <div className="text-[13px] leading-[1.3] px-1.5 py-[2px] rounded-md inline-flex items-center gap-1 font-medium bg-white/[0.04] border border-white/[0.08] text-primary mb-8 font-body">
                                    <Zap className="w-3.5 h-3.5 fill-current" />
                                    <span>{t('group3.productShowcase.proFeature')}</span>
                                </div>
                                {/* SUBHEADLINE / HEADING → título secundário */}
                                <h3 className="font-display text-3xl lg:text-5xl font-extrabold text-white mb-6 tracking-[-0.04em] leading-[1.1]">{section.title}</h3>
                                {/* BODY TEXT */}
                                <p className="font-body secondary-text font-medium mb-10">
                                    {section.desc}
                                </p>

                                <ul className="space-y-6 mb-14">
                                    {section.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-5 font-body text-[12px] font-black text-slate-300 uppercase tracking-[0.2em] group/li transition-all">
                                            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(77,114,228,0.2)] group-hover/li:bg-primary group-hover/li:text-white transition-all">
                                                <Check className="w-4 h-4 stroke-[4px]" />
                                            </div>
                                            <span className="group-hover/li:translate-x-1 transition-transform">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/register">
                                    <button className="flex items-center gap-4 text-[11px] font-black text-white uppercase tracking-[0.3em] group/btn transition-all font-body">
                                        {t('group3.productShowcase.exploreDetails')}
                                        <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-black transition-all duration-311">
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </div>
                                    </button>
                                </Link>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
