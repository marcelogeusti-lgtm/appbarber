'use client';
import { motion } from 'framer-motion';
import {ArrowRight} from 'lucide-react';
import Link from 'next/link';
import { getFeaturesArray } from '../../lib/featuresData';

export default function Features() {
    const featureList = getFeaturesArray();

    const containerVariants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.1, delayChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

    return (
        <section className="py-24 bg-[#050505] relative overflow-hidden" id="features">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-6 tracking-tight">
                        Sua Barbearia rodando <br />
                        <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">no Piloto Automático.</span>
                    </h2>
                    <p className="text-gray-400 text-lg font-medium leading-relaxed">
                        Explore o maior ecossistema nativo do mercado. O NEXT consolida de agendas e comandas até uma universidade completa para o gestor.
                    </p>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {featureList.map((feature, idx) => (
                        <motion.div 
                            variants={itemVariants} 
                            key={idx} 
                            whileHover={{ y: -8, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="p-8 rounded-[2rem] bg-[#0A0A0B]/40 backdrop-blur-2xl border border-white/5 hover:border-white/10 shadow-2xl group flex flex-col h-full bg-cover transition-all relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 translate-x-[-100%] group-hover:animate-shine pointer-events-none" />

                            <div className={`w-14 h-14 rounded-2xl ${feature.bgIcon} flex items-center justify-center ${feature.color} mb-6 shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] relative z-10`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            
                            <h4 className="text-lg font-black text-white mb-3 uppercase tracking-tighter relative z-10">{feature.title}</h4>
                            <p className="text-slate-400 text-xs leading-relaxed font-semibold opacity-80 flex-1 mb-6 relative z-10">
                                {feature.oneLiner}
                            </p>
                            
                            <Link href={`/features/${feature.slug}`} className={`relative z-10 mt-auto inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${feature.color} opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all w-fit`}>
                                Ler Mais <ArrowRight className="w-3 h-3" />
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}
