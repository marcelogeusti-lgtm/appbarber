'use client';
import { XCircle, CheckCircle2, UserX, BookOpen, DollarSign, Heart, Zap, Calendar } from 'lucide-react';
import LEDCardWrapper from './LEDCardWrapper';
import { motion } from 'framer-motion';

import { useTranslation } from '../../contexts/LanguageContext';

export default function ProblemSolution() {
    const { t } = useTranslation();

    const comparisons = [
        {
            pain: t('group2.ProblemSolution.pain1'),
            painIcon: UserX,
            solution: t('group2.ProblemSolution.solution1'),
            solutionIcon: Zap
        },
        {
            pain: t('group2.ProblemSolution.pain2'),
            painIcon: BookOpen,
            solution: t('group2.ProblemSolution.solution2'),
            solutionIcon: Calendar
        },
        {
            pain: t('group2.ProblemSolution.pain3'),
            painIcon: DollarSign,
            solution: t('group2.ProblemSolution.solution3'),
            solutionIcon: CheckCircle2
        },
        {
            pain: t('group2.ProblemSolution.pain4'),
            painIcon: Heart,
            solution: t('group2.ProblemSolution.solution4'),
            solutionIcon: Heart
        }
    ];

    return (
        <section className="py-32 bg-[#050505] overflow-hidden" id="start">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-4xl mx-auto mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="font-display hero-title font-extrabold text-white mb-6 text-balance">
                            {t('group2.ProblemSolution.titlePart1')} <br />
                            <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent">{t('group2.ProblemSolution.titlePart2')}</span>
                        </h2>
                        <p className="font-body secondary-text font-medium max-w-2xl mx-auto">
                            {t('group2.ProblemSolution.subtitle')}
                        </p>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
                    {/* Pain Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <LEDCardWrapper className="h-full">
                            <div className="card-premium lg:p-14 bg-[#0A0A0B]/40 backdrop-blur-3xl border border-white/[0.06] flex flex-col group/pain transition-all hover:bg-[#0A0A0B]/60 h-full relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20" />

                                <div className="flex items-center gap-5 mb-16 relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 group-hover/pain:scale-110 transition-transform shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                                        <XCircle className="w-7 h-7" />
                                    </div>
                                    <h3 className="font-display text-2xl font-black text-slate-500 uppercase tracking-tighter transition-colors group-hover/pain:text-white">{t('group2.ProblemSolution.withoutNext')}</h3>
                                </div>

                                <div className="space-y-12 flex-1 relative z-10">
                                    {comparisons.map((c, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="mt-1 w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-red-400 group-hover:border-red-400/50 transition-all duration-300 flex-shrink-0 bg-white/[0.02]">
                                                <c.painIcon className="w-4 h-4" />
                                            </div>
                                            <p className="font-body text-slate-400 font-medium text-lg leading-relaxed group-hover:text-slate-300 transition-colors">{c.pain}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-16 pt-10 border-t border-white/[0.06] relative z-10">
                                    <p className="font-body text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-3">{t('group2.ProblemSolution.commonResultLabel')}</p>
                                    <p className="font-display text-xl md:text-2xl font-bold text-slate-400 transition-colors group-hover/pain:text-white">
                                        {t('group2.ProblemSolution.commonResultDesc1')} <br />
                                        {t('group2.ProblemSolution.commonResultDesc2')}
                                    </p>
                                </div>
                            </div>
                        </LEDCardWrapper>
                    </motion.div>

                    {/* Solution Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <LEDCardWrapper className="h-full">
                            <div className="card-premium lg:p-14 bg-gradient-to-br from-[#0A0A0B] to-[#050505] border-2 border-primary/40 flex flex-col relative overflow-hidden shadow-[0_0_100px_rgba(77,114,228,0.15)] group/solution hover:border-primary transition-all h-full">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 blur-[130px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

                                <div className="flex items-center gap-5 mb-16 relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-[0_0_30px_#4d72e4] group-hover/solution:scale-110 transition-transform">
                                        <CheckCircle2 className="w-7 h-7" />
                                    </div>
                                    <h3 className="font-display text-2xl font-black text-white uppercase tracking-tighter shadow-primary/20">{t('group2.ProblemSolution.withNext')}</h3>
                                </div>

                                <div className="space-y-12 flex-1 relative z-10">
                                    {comparisons.map((c, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="mt-1 w-7 h-7 rounded-full bg-primary/10 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-[0_0_20px_rgba(77,114,228,0.2)] flex-shrink-0">
                                                <c.solutionIcon className="w-4 h-4 stroke-[3]" />
                                            </div>
                                            <p className="font-body text-slate-200 font-semibold text-lg leading-relaxed group-hover:text-white transition-colors">{c.solution}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-16 pt-10 border-t border-white/10 relative z-10">
                                    <p className="font-body text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3">{t('group2.ProblemSolution.eliteJumpLabel')}</p>
                                    <p className="font-display text-xl md:text-2xl font-bold text-white drop-shadow-[0_0_15px_rgba(77,114,228,0.5)]">
                                        {t('group2.ProblemSolution.eliteJumpDesc1')} <br />
                                        {t('group2.ProblemSolution.eliteJumpDesc2')}
                                    </p>
                                </div>
                            </div>
                        </LEDCardWrapper>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
