'use client';
import { Check, ArrowRight, Zap, Trophy, Crown } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import LEDCardWrapper from './LEDCardWrapper';

export default function Pricing() {
    const containerVariants = {
        hidden: {},
        visible: {
            transition: { staggerChildren: 0.2, delayChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden" id="pricing">
            {/* Background Accents */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent -translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-4xl mx-auto mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-md">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Planos Maestro</span>
                    </div>
                    <h2 className="text-3xl lg:text-7xl font-extrabold text-white mb-8 tracking-tighter leading-[1.1]">
                        Escolha seu Nível de <br />
                        <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent">Dominação.</span>
                    </h2>
                    <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-3xl mx-auto">
                        Comece pequeno, escale como um império. O NEXT se adapta ao seu momento.
                    </p>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch"
                >

                    {/* Autônomo */}
                    <LEDCardWrapper className="h-full">
                        <motion.div 
                            variants={cardVariants} 
                            whileHover={{ y: -15, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="p-12 pt-16 rounded-[3.5rem] bg-[#0A0A0B] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] flex flex-col hover:border-primary/20 group cursor-default backdrop-blur-3xl h-full"
                        >
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Autônomo</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Para unidades individuais.</p>
                                </div>
                                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-all duration-500 border border-white/5">
                                    <Zap className="w-7 h-7" />
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2 mb-12">
                                <span className="text-5xl lg:text-6xl font-black text-white tracking-tighter flex items-start">R$49</span>
                                <span className="text-xs font-black uppercase tracking-[0.1em] text-[#94A3B8]">/ Mensal</span>
                            </div>

                            <ul className="space-y-6 mb-12 flex-1">
                                {['1 Profissional Master', 'Acesso à Agenda Maestro', 'Link de Agendamento Pro', 'WhatsApp Lembretes'].map(i => (
                                    <li key={i} className="flex items-center gap-4 text-[11px] font-black text-white uppercase tracking-tight">
                                        <div className="w-5 h-5 rounded-full bg-[#4D72E4]/15 flex items-center justify-center text-[#4D72E4] flex-shrink-0">
                                            <Check className="w-3 h-3 stroke-[3px]" />
                                        </div> {i}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/register">
                                <button className="w-full py-5 rounded-xl border border-white/15 text-[11px] font-black uppercase tracking-[0.2em] transition-all text-white hover:bg-white hover:text-black">
                                    Ativar Plano Core
                                </button>
                            </Link>
                        </motion.div>
                    </LEDCardWrapper>

                    {/* Diamond Pro */}
                    <LEDCardWrapper className="h-full">
                        <motion.div 
                            variants={cardVariants} 
                            whileHover={{ y: -15, scale: 1.07 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="p-12 pt-16 rounded-[4rem] bg-gradient-to-br from-[#0A0A0C] to-black flex flex-col relative scale-[1.05] z-10 shadow-[0_0_0_1px_#4D72E4,0_0_32px_rgba(77,114,228,0.25),0_0_64px_rgba(77,114,228,0.10)] overflow-visible group cursor-default h-full"
                        >
                            {/* Shine Effect Animation Overlay */}
                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shine_1.5s_ease-in-out_infinite] pointer-events-none" />

                            {/* Glow Effect */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/25 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-3 bg-gradient-to-r from-primary to-blue-500 rounded-full text-[10px] font-black text-white uppercase tracking-[0.4em] shadow-[0_0_30px_rgba(77,114,228,0.5)] z-20">
                                Recomendado
                            </div>

                            <div className="flex justify-between items-start mb-12 relative z-10">
                                <div>
                                    <h4 className="text-3xl font-black text-white uppercase tracking-tighter">Diamond Pro</h4>
                                    <p className="text-[11px] font-black uppercase tracking-widest text-primary mt-2">Crescimento Acelerado</p>
                                </div>
                                <div className="w-16 h-16 bg-primary/20 rounded-[1.5rem] flex items-center justify-center text-primary shadow-xl shadow-primary/20 border border-primary/20">
                                    <Crown className="w-8 h-8 fill-current" />
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2 mb-12 relative z-10">
                                <span className="text-5xl lg:text-7xl font-black text-white tracking-tighter flex items-start">
                                    R$89<span className="text-[40%] leading-none" style={{ verticalAlign: 'super' }}>,70</span>
                                </span>
                                <span className="text-xs font-black uppercase tracking-[0.1em] text-[#94A3B8]">/ Mensal</span>
                            </div>

                            <ul className="space-y-7 mb-16 flex-1 relative z-10">
                                {['Até 5 Profissionais', 'Dashboard de Elite', 'Fidelização Completa', 'Financeiro Avançado', 'Estoque & Produtos'].map(i => (
                                    <li key={i} className="flex items-center gap-5 text-[11px] font-black text-white uppercase tracking-widest">
                                        <div className="w-6 h-6 rounded-full bg-[#4D72E4]/15 flex items-center justify-center text-[#4D72E4] flex-shrink-0">
                                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                        </div> {i}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/register">
                                <button className="w-full py-5 rounded-xl bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 group/btn relative z-10">
                                    Upgrade Diamond <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                                </button>
                            </Link>
                        </motion.div>
                    </LEDCardWrapper>

                    {/* Empire */}
                    <LEDCardWrapper className="h-full">
                        <motion.div 
                            variants={cardVariants} 
                            whileHover={{ y: -15, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="p-12 pt-16 rounded-[3.5rem] bg-[#0A0A0B] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] flex flex-col hover:border-white/20 group cursor-default backdrop-blur-3xl h-full"
                        >
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Empire</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Escala sem limites.</p>
                                </div>
                                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-white transition-all duration-500 border border-white/5">
                                    <Trophy className="w-7 h-7" />
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2 mb-12">
                                <span className="text-5xl lg:text-6xl font-black text-white tracking-tighter flex items-start">
                                    R$159<span className="text-[40%] leading-none" style={{ verticalAlign: 'super' }}>,70</span>
                                </span>
                                <span className="text-xs font-black uppercase tracking-[0.1em] text-[#94A3B8]">/ Mensal</span>
                            </div>

                            <ul className="space-y-7 mb-16 flex-1">
                                {['Ilimitados Profissionais', 'Multi-unidades', 'Suporte VIP 24h', 'Prioridade Maestro', 'Exportação Full'].map(i => (
                                    <li key={i} className="flex items-center gap-5 text-[11px] font-black text-slate-300 uppercase tracking-widest">
                                        <div className="w-6 h-6 rounded-full bg-[#4D72E4]/15 flex items-center justify-center text-[#4D72E4] flex-shrink-0">
                                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                        </div> {i}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/register">
                                <button className="w-full py-5 rounded-xl border border-white/15 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all text-white">
                                    Solicitar Convite Empire
                                </button>
                            </Link>
                        </motion.div>
                    </LEDCardWrapper>

                </motion.div>

                <div className="mt-24">
                    <div className="max-w-3xl mx-auto bg-white/[0.02] border border-white/5 rounded-xl p-10 flex flex-col lg:flex-row items-center gap-10 justify-center backdrop-blur-3xl group/trust">
                        <div className="w-16 h-16 bg-primary/10 rounded-xl shadow-inner flex items-center justify-center flex-shrink-0 text-primary group-hover/trust:scale-110 transition-transform">
                            <Zap className="w-8 h-8 fill-current" />
                        </div>
                        <div className="text-center lg:text-left">
                            <h5 className="font-black text-white text-base uppercase tracking-tight mb-2">Medo de migrar seus dados?</h5>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">Fique tranquilo. A equipe Maestro importa <strong className="text-white">toda a sua base atual gratuitamente</strong> em 24h durante seu onboarding.</p>
                        </div>
                    </div>
                    
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em] flex items-center justify-center gap-6 mt-16">
                        <span className="w-12 h-px bg-white/10" />
                        Sem contratos de fidelidade
                        <span className="w-12 h-px bg-white/10" />
                    </p>
                </div>
            </div>
        </section >
    );
}
