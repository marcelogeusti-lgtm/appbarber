'use client';
import { Zap, Smartphone, Heart, QrCode, MousePointer2, UserCheck } from 'lucide-react';
import LEDCardWrapper from './LEDCardWrapper';
import { motion } from 'framer-motion';

export default function PremiumExperience() {
    const cards = [
        {
            icon: QrCode,
            category: "SIMPLICIDADE",
            title: "Acesso via QR Code ou Link",
            gradient: "from-blue-500/20 to-transparent",
            desc: "Zero barreiras. Seu cliente agenda no momento da impulsão."
        },
        {
            icon: MousePointer2,
            category: "AGILIDADE",
            title: "Agendamento em 3 toques",
            gradient: "from-indigo-500/20 to-transparent",
            desc: "Interface ultra-rápida otimizada para conversão mobile."
        },
        {
            icon: UserCheck,
            category: "RETENÇÃO",
            title: "Fidelização automática",
            gradient: "from-primary/20 to-transparent",
            desc: "O sistema reconhece o cliente e incentiva o retorno."
        }
    ];

    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto mb-24 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h2 className="font-display text-4xl lg:text-[5.5rem] font-extrabold text-white mb-10 tracking-[-0.05em] uppercase leading-[0.9] italic">
                            A EXPERIÊNCIA <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent not-italic">PREMIUM</span> <br />
                            DE AGENDAMENTO.
                        </h2>
                        <p className="font-body text-slate-400 text-xl font-medium leading-relaxed max-w-3xl">
                            O NEXT foi desenhado para eliminar fricção. Seu cliente não precisa de apps pesados ou cadastros complexos. É agendar e pronto.
                        </p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: idx * 0.15 }}
                            className="h-full"
                        >
                            <LEDCardWrapper className="h-full">
                                <div className="group relative h-full">
                                    <div className={`p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.06] backdrop-blur-3xl transition-all duration-700 hover:border-primary/40 hover:bg-white/[0.04] flex flex-col h-full relative overflow-hidden shadow-2xl`}>
                                        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />

                                        <div className="relative z-10">
                                            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-primary mb-12 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-xl">
                                                <card.icon className="w-8 h-8" />
                                            </div>

                                            <div className="space-y-5">
                                                <span className="font-body text-[10px] font-black text-primary uppercase tracking-[0.4em] opacity-80">{card.category}</span>
                                                <h4 className="font-display text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
                                                    {card.title}
                                                </h4>
                                                <p className="font-body text-sm text-slate-400 font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                                    {card.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </LEDCardWrapper>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
