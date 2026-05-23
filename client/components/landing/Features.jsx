'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { getFeaturesArray } from '../../lib/featuresData';
import LEDCardWrapper from './LEDCardWrapper';

export default function Features() {
    const featureList = getFeaturesArray();

    const containerVariants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.08, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden" id="features">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-4xl mx-auto mb-32"
                >
                    <h2 className="font-display text-4xl lg:text-[5rem] font-extrabold text-white mb-10 tracking-[-0.05em] leading-[0.95]">
                        Sua Barbearia no <br />
                        <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent italic">Piloto Automático.</span>
                    </h2>
                    <p className="font-body text-slate-400 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                        Explore o maior ecossistema nativo do mercado. O NEXT consolida de agendas e comandas até uma universidade completa para o gestor.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                    {featureList.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className="h-full"
                        >
                            <LEDCardWrapper className="rounded-[2.5rem] h-full">
                                <motion.div
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    className="p-10 rounded-[2.5rem] bg-[#0A0A0B]/40 backdrop-blur-3xl border border-white/[0.06] hover:border-primary/40 shadow-2xl group flex flex-col h-full relative overflow-hidden transition-colors duration-500"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                                    <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent rotate-45 translate-x-[-100%] group-hover:animate-shine pointer-events-none" />

                                    <div className={`w-16 h-16 rounded-2xl ${feature.bgIcon} flex items-center justify-center ${feature.color} mb-10 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)] relative z-10 group-hover:scale-110 transition-transform duration-700 bg-white/[0.03] border border-white/5`}>
                                        <feature.icon className="w-8 h-8" />
                                    </div>

                                    <h4 className="font-display text-xl font-extrabold text-white mb-4 uppercase tracking-tight relative z-10">{feature.title}</h4>
                                    <p className="font-body text-slate-400 text-sm leading-relaxed font-medium flex-1 mb-10 relative z-10 group-hover:text-slate-300 transition-colors">
                                        {feature.oneLiner}
                                    </p>

                                    <Link href={`/features/${feature.slug}`} className={`relative z-10 mt-auto inline-flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] ${feature.color} group-hover:translate-x-2 transition-all w-fit font-body`}>
                                        Explorar <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </motion.div>
                            </LEDCardWrapper>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom CTA for Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-24 text-center"
                >
                    <Link href="/register">
                        <button className="px-10 py-5 bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-xl hover:scale-105 transition-all shadow-2xl flex items-center gap-4 group font-body mx-auto">
                            Ver Todas Funcionalidades <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </Link>
                </motion.div>

            </div>
        </section>
    );
}
