'use client';
import { Play } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import LEDCardWrapper from './LEDCardWrapper';
import { motion } from 'framer-motion';

export default function VCLSection() {
    const { t } = useTranslation();
    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden border-y border-white/[0.06]">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h2 className="font-display hero-title font-extrabold text-white tracking-[-0.05em] mb-8 text-balance">
                            {t('group4.vclSection.titlePart1')} <br className="hidden md:block" />
                            <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent">{t('group4.vclSection.titlePart2')}</span>
                        </h2>
                        <p className="font-body secondary-text font-medium max-w-2xl mx-auto">
                            {t('group4.vclSection.subtitle')}
                        </p>
                    </motion.div>
                </div>

                <div className="max-w-6xl mx-auto relative group">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        <LEDCardWrapper className="w-full rounded-[3.5rem]">
                            <div className="relative aspect-video rounded-[3.5rem] overflow-hidden shadow-[0_80px_160px_rgba(0,0,0,0.8)] bg-[#0A0A0B] group/video cursor-pointer border border-white/[0.1] h-full transition-all duration-700 hover:border-primary/40">

                                {/* Decorative Glow behind video */}
                                <div className="absolute -inset-20 bg-primary/10 blur-[150px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-[1.5s] pointer-events-none" />

                                {/* Placeholder image for the video */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-black/20 opacity-80 transition-opacity duration-500 group-hover:opacity-40 z-10" />
                                <img
                                    src="https://images.unsplash.com/photo-1543781525-2e1180b6a153?auto=format&fit=crop&w=1600&h=900"
                                    alt={t('group4.vclSection.altImage')}
                                    className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity grayscale group-hover:grayscale-0 group-hover:mix-blend-normal group-hover:scale-110 transition-all duration-[2s]"
                                />

                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center relative z-20">
                                    <div className="relative">
                                        {/* Pulse Ripple Effect */}
                                        <div className="absolute inset-0 rounded-full bg-white/20 animate-ripple" />
                                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ripple delay-700" />

                                        <motion.div
                                            whileHover={{ scale: 1.15, rotate: 5 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-24 lg:w-32 h-24 lg:h-32 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.4)] group-hover/video:bg-primary group-hover/video:text-white transition-all duration-500 relative z-10"
                                        >
                                            <Play className="w-10 lg:w-14 h-10 lg:h-14 fill-current ml-2 lg:ml-3" />
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Custom Video Header Interface */}
                                <div className="absolute top-10 left-10 z-20 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] backdrop-blur-3xl border border-white/20 flex items-center justify-center">
                                        <img src="/logos/logo_icon.svg" alt="Icon" className="w-6 h-6 p-1" />
                                    </div>
                                    <div>
                                        <p className="font-display font-black text-white text-sm tracking-tight">{t('group4.vclSection.tourTitle')}</p>
                                        <p className="font-body text-[10px] text-white/50 uppercase tracking-[0.2em]">{t('group4.vclSection.resolution')}</p>
                                    </div>
                                </div>

                                {/* Fictional progress bar refinement */}
                                <div className="absolute bottom-0 left-0 w-full h-2 bg-white/10 z-20">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '45%' }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 4, ease: "easeOut" }}
                                        className="h-full bg-primary relative shadow-[0_0_15px_#4d72e4]"
                                    >
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white]" />
                                    </motion.div>
                                </div>
                            </div>
                        </LEDCardWrapper>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
