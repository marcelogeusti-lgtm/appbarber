'use client';
import { Instagram, Youtube, Facebook, Mail, Phone, MapPin, ArrowUpRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '../../contexts/LanguageContext';

export default function Footer() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#050505] pt-32 pb-12 relative overflow-hidden">
            {/* Final CTA Wave */}
            <div className="container mx-auto px-4 mb-32">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="relative rounded-[3.5rem] bg-gradient-to-br from-primary via-blue-500 to-indigo-600 p-16 lg:p-24 overflow-hidden group/cta shadow-[0_40px_100px_rgba(77,114,228,0.3)]"
                >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
                    <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-white/10 blur-[120px] rounded-full group-hover:scale-125 transition-transform duration-[2s]" />

                    <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="font-display hero-title font-extrabold text-white mb-8 text-balance">
                                {t('footer.cta_title_part1')} <br />
                                <span>{t('footer.cta_title_highlight')}</span>
                            </h2>
                            <p className="font-body secondary-text font-medium max-w-xl text-white/80">
                                {t('footer.cta_subtitle')}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link href="/register" className="flex-1">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full py-6 bg-white text-black font-body font-black uppercase text-[12px] tracking-[0.4em] rounded-[1.5rem] shadow-2xl transition-all flex items-center justify-center gap-4"
                                >
                                    {t('footer.cta_button_main')} <ArrowUpRight className="w-5 h-5" />
                                </motion.button>
                            </Link>
                            <Link href="#pricing" className="flex-1">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full py-6 bg-transparent border-2 border-white/20 text-white hover:bg-white/5 font-body font-black uppercase text-[12px] tracking-[0.4em] rounded-[1.5rem] transition-all flex items-center justify-center gap-4"
                                >
                                    {t('footer.cta_button_sec')}
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24 border-t border-white/[0.06] pt-24">

                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-block mb-10 group">
                            <img src="/logos/logo_full.svg" alt="NEXT Logo" className="h-10 w-auto group-hover:scale-105 transition-transform" />
                        </Link>
                        <p className="font-body text-slate-500 text-lg font-medium leading-relaxed max-w-md mb-10">
                            {t('footer.desc')}
                        </p>
                        <div className="flex gap-4">
                            {[Instagram, Youtube, Facebook].map((Icon, i) => (
                                <Link key={i} href="#" className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:scale-110 transition-all duration-500">
                                    <Icon className="w-5 h-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-display font-black text-white text-[10px] uppercase tracking-[0.4em] mb-10 opacity-60">{t('footer.col1_title')}</h4>
                        <ul className="space-y-5">
                            {[t('footer.col1_l1'), t('footer.col1_l2'), t('footer.col1_l3'), t('footer.col1_l4')].map((link, i) => (
                                <li key={i}>
                                    <Link href="#" className="font-body text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">{link}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-display font-black text-white text-[10px] uppercase tracking-[0.4em] mb-10 opacity-60">{t('footer.col2_title')}</h4>
                        <ul className="space-y-5">
                            {[t('footer.col2_l1'), t('footer.col2_l2'), t('footer.col2_l3'), t('footer.col2_l4')].map((link, i) => (
                                <li key={i}>
                                    <Link href="#" className="font-body text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">{link}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-display font-black text-white text-[10px] uppercase tracking-[0.4em] mb-10 opacity-60">{t('footer.col3_title')}</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4 group cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="font-body text-slate-400 text-sm font-bold group-hover:text-white transition-colors">contato@next.com</span>
                            </li>
                            <li className="flex items-start gap-4 group cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span className="font-body text-slate-400 text-sm font-bold group-hover:text-white transition-colors">0800 000 0000</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/[0.06] pt-12 flex flex-col md:flex-row justify-between items-center gap-10">
                    <p className="font-body text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
                        {t('footer.rights')}
                    </p>
                    <div className="flex gap-12">
                        <Link href="#" className="font-body text-slate-600 hover:text-white text-[9px] font-black uppercase tracking-[0.3em] transition-colors">{t('footer.privacy')}</Link>
                        <Link href="#" className="font-body text-slate-600 hover:text-white text-[9px] font-black uppercase tracking-[0.3em] transition-colors">{t('footer.terms')}</Link>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2 bg-white/[0.02] border border-white/[0.06] rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-body text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">{t('footer.status')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
