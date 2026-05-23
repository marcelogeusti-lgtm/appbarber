'use client';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import LEDCardWrapper from './LEDCardWrapper';
import { motion } from 'framer-motion';

export default function MainDashboardShowcase() {
    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden border-y border-white/[0.06]">
            {/* Background Grain & Glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="container mx-auto px-4 text-center">

                <div className="max-w-5xl mx-auto mb-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h2 className="font-display text-4xl lg:text-[5rem] font-extrabold text-white leading-[0.95] mb-10 tracking-[-0.05em] text-balance">
                            O Painel de Controle <br />
                            <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent italic">do Seu Império.</span>
                        </h2>
                        <p className="font-body text-xl text-slate-400 font-medium leading-relaxed max-w-3xl mx-auto">
                            Uma interface limpa e poderosa. Tenha visão total do seu faturamento, agenda e desempenho da equipe em tempo real, sem planilhas confusas.
                        </p>
                    </motion.div>
                </div>

                {/* Big Centered Mockup */}
                <div className="relative max-w-6xl mx-auto group">
                    {/* Shadow/Glow Background */}
                    <div className="absolute inset-0 bg-primary/10 blur-[150px] rounded-full scale-90 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    {/* The Image Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <LEDCardWrapper className="rounded-[3rem]">
                            <div className="relative z-10 rounded-[3rem] border border-white/[0.1] bg-[#0A0A0B]/80 backdrop-blur-3xl p-3 lg:p-5 shadow-[0_60px_120px_rgba(0,0,0,0.7)] flex flex-col items-center group transition-all duration-1000 hover:border-primary/30">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-400 to-primary rounded-t-[3rem] shadow-[0_0_20px_rgba(77,114,228,0.5)]" />

                                {/* Realistic UI Header dots */}
                                <div className="w-full flex justify-start gap-2.5 px-8 pt-6 pb-4 border-b border-white/[0.04] mb-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
                                </div>

                                <div className="rounded-2xl overflow-hidden border border-white/[0.04] bg-black relative shadow-inner aspect-[16/10] w-full">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none z-10" />
                                    <img
                                        src="/screenshots/dashboard-overview.png"
                                        alt="Dashboard Central"
                                        className="w-full h-full object-cover object-top transition-transform duration-[2s] group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-1000" />
                                </div>
                            </div>
                        </LEDCardWrapper>
                    </motion.div>

                    {/* Floating Badges with Enhanced Motion */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -left-16 top-1/4 hidden xl:flex p-6 bg-[#0A0A0B]/90 backdrop-blur-3xl rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/[0.1] items-center gap-5 transition-all duration-1000 group-hover:border-primary/40 group-hover:scale-110"
                    >
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <DollarSign className="w-7 h-7" />
                        </div>
                        <div className="text-left">
                            <p className="font-body text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-2">Faturamento</p>
                            <p className="font-display text-2xl font-black text-white leading-none tracking-tighter tabular-nums">R$ 18.420</p>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -right-16 bottom-1/4 hidden xl:flex p-6 bg-[#0A0A0B]/90 backdrop-blur-3xl rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/[0.1] items-center gap-5 transition-all duration-1000 group-hover:border-primary/40 group-hover:scale-110"
                    >
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(77,114,228,0.2)]">
                            <Calendar className="w-7 h-7" />
                        </div>
                        <div className="text-left">
                            <p className="font-body text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-2">Agendamentos</p>
                            <p className="font-display text-2xl font-black text-white leading-none tracking-tighter tabular-nums">42 Hoje</p>
                        </div>
                    </motion.div>
                </div>

                {/* Stats Grid Under Image */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 max-w-5xl mx-auto mt-32">
                    {[
                        { label: 'Lucro Previsto', val: 'R$ 18.420', color: 'emerald' },
                        { label: 'Ranking Equipe', val: 'Felipe M.', color: 'blue' },
                        { label: 'Ticket Médio', val: 'R$ 64,00', color: 'indigo' },
                        { label: 'Taxa Retorno', val: '84%', color: 'rose' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.8 + (i * 0.1) }}
                            className="text-center group"
                        >
                            <p className="font-body text-[11px] font-black text-slate-500 uppercase tracking-[0.35em] mb-4 group-hover:text-primary transition-all duration-500 group-hover:translate-y-[-2px]">{stat.label}</p>
                            <p className="font-display text-3xl font-extrabold text-white tracking-tighter tabular-nums group-hover:scale-105 transition-transform duration-700">{stat.val}</p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
