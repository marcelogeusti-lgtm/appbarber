'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { getFeatureBySlug } from '../../../lib/featuresData';

export default function FeaturePage({ params }) {
    const router = useRouter();
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

    if (!feature) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

    const Icon = feature.icon;

    return (
        <div className="bg-white">
            {/* Nav Back */}
            <div className="container mx-auto px-4 py-8">
                <Link href="/#features" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar para visão geral
                </Link>
            </div>

            {/* Hero Section */}
            <section className="relative py-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={`w-20 h-20 mx-auto rounded-3xl ${feature.bgIcon} flex items-center justify-center ${feature.color} mb-8 shadow-sm`}
                        >
                            <Icon className="w-10 h-10" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full mb-6 border border-gray-100">
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${feature.color}`}>{feature.title}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                                {feature.heroTitle}
                            </h1>
                            <p className="text-xl text-gray-500 leading-relaxed font-medium">
                                {feature.heroDesc}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Benefits Mockup Section */}
            <section className="py-20 bg-gray-50/50 border-y border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-8">
                            {feature.benefits.map((benefit, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                                    className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${feature.bgIcon} flex items-center justify-center ${feature.color} mb-6`}>
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 mb-3">{benefit.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed font-medium">{benefit.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-2xl mx-auto bg-gray-900 rounded-[3rem] p-12 relative overflow-hidden"
                    >
                        {/* Glow inside CTA */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl -translate-y-1/2 translate-x-1/2" />
                        
                        <h2 className="text-3xl font-extrabold text-white mb-6 tracking-tight relative z-10">
                            Pronto para dominar essa funcionalidade?
                        </h2>
                        <p className="text-gray-400 mb-10 font-medium relative z-10">
                            Pare de usar sistemas que limitam seu crescimento. O NEXT tem tudo o que você precisa habilitado agora.
                        </p>
                        <div className="relative z-10">
                            <Link href="/register">
                                <button className="px-10 py-5 bg-primary text-white text-sm font-bold uppercase tracking-wider rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2 mx-auto group">
                                    Começar Meus 15 Dias Grátis 
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
