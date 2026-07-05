'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { getFeatureBySlug } from '../../../lib/featuresData';
import { useTranslation } from '../../../contexts/LanguageContext';

export default function FeaturePage({ params }) {
    const router = useRouter();
    const { t } = useTranslation();
    const [feature, setFeature] = useState(null);

    useEffect(() => {
        // Resolve slug promise if necessary or directly read
        const resolvedSlug = params?.slug; 
        if (resolvedSlug) {
            const data = getFeatureBySlug(resolvedSlug);
            if (!data) {
                router.push('/'); // Fallback para home se n achar
            } else {
                setFeature(data);
            }
        }
    }, [params, router]);

    if (!feature) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

    const Icon = feature.icon;

    // Traduz o conteúdo por idioma; se faltar a chave, cai no texto PT do featuresData.js
    const tf = (field) => {
        const key = `featuresData.${feature.slug}.${field}`;
        const val = t(key);
        return val === key ? feature[field] : val;
    };
    const benefitsRaw = tf('benefits');
    const benefits = Array.isArray(benefitsRaw) ? benefitsRaw : feature.benefits;

    return (
        <div className="bg-[#050505] min-h-screen">
            {/* Background noise/texture for premium feel */}
            <div className="fixed inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

            {/* Nav Back */}
            <div className="container mx-auto px-4 py-8 relative z-20">
                <Link href="/#features" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {t('featureDetail.back')}
                </Link>
            </div>

            {/* Hero Section */}
            <section className="relative py-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full -translate-x-1/2 pointer-events-none" />
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={`w-24 h-24 mx-auto rounded-[2rem] bg-[#0A0A0B]/80 backdrop-blur-md border border-white/10 flex items-center justify-center ${feature.color} mb-10 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)] relative`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 rounded-[2rem] pointer-events-none" />
                            <Icon className="w-12 h-12" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0A0A0B]/50 backdrop-blur-md rounded-full mb-8 border border-white/10 shadow-2xl">
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${feature.color}`}>{tf('title')}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-8 tracking-tighter">
                                {tf('heroTitle')}
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-400 leading-relaxed font-medium">
                                {tf('heroDesc')}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Benefits Mockup Section */}
            <section className="py-24 relative overflow-hidden">
                {/* Subtle separator line using gradient */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-8">
                            {benefits.map((benefit, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: idx * 0.15, duration: 0.6, ease: "easeOut" }}
                                    whileHover={{ y: -5 }}
                                    className="bg-[#0A0A0B]/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 hover:border-white/10 shadow-2xl relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    <div className={`w-12 h-12 rounded-2xl bg-[#050505] border border-white/5 flex items-center justify-center ${feature.color} mb-8 shadow-inner shadow-white/5 relative z-10`}>
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-4 tracking-tight relative z-10">{benefit.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed font-medium relative z-10 group-hover:text-slate-300 transition-colors">{benefit.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto bg-gradient-to-br from-[#0A0A0B] to-[#050505] rounded-[3rem] p-12 md:p-16 relative overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                    >
                        {/* Glow inside CTA */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                        
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight relative z-10">
                            {t('featureDetail.ctaTitle')}
                        </h2>
                        <p className="text-slate-400 mb-12 font-medium text-lg max-w-xl mx-auto relative z-10">
                            {t('featureDetail.ctaDesc')}
                        </p>
                        <div className="relative z-10">
                            <Link href="/register">
                                <button className="px-10 py-5 bg-white text-black text-sm font-black uppercase tracking-widest rounded-2xl hover:scale-105 hover:bg-gray-100 transition-all shadow-xl flex items-center justify-center gap-3 mx-auto group">
                                    {t('featureDetail.ctaButton')}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
