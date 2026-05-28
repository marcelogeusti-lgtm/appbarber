'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <section className="relative flex items-center pt-32 pb-20 overflow-hidden bg-[#050505] min-h-[90vh]">

            {/* Background Video */}
            <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
            >
                <source src="/hero-bg.mp4" type="video/mp4" />
            </video>

            {/* Dark Mask Overlay for Premium Readability (Booksy Style) */}
            <div className="absolute inset-0 bg-[#050505]/70 mix-blend-multiply z-0 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-transparent to-[#050505] z-0 pointer-events-none" />

            {/* Premium Background: Animated Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, 60, 0],
                    y: [0, -40, 0],
                    opacity: [0.25, 0.5, 0.25]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-[900px] h-[900px] bg-[#4D72E4]/15 blur-[180px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    x: [0, -70, 0],
                    y: [0, 90, 0],
                    opacity: [0.15, 0.35, 0.15]
                }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-blue-600/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none"
            />

            {/* Cinematic Radial */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_50%_40%,rgba(77,114,228,0.06),transparent_60%)] pointer-events-none" />

            {/* Subtle Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Content */}
                    <motion.div
                        className="max-w-2xl"
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        {/* Badge / beautifulMention Equivalent */}
                        <motion.div variants={itemVariants} className="text-[13px] leading-[1.3] px-1.5 py-[2px] rounded-md inline-flex items-center gap-1 font-medium bg-white/[0.04] border border-white/[0.08] mb-8 backdrop-blur-xl group hover:border-primary/30 transition-colors duration-500 text-white/80">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_12px_#4d72e4]" />
                            </span>
                            O Futuro é NEXT
                        </motion.div>

                        {/* Headline — High-Ticket Typography */}
                        <motion.h1 variants={itemVariants} className="font-display hero-title font-extrabold text-white mb-6 text-balance">
                            Acabe com as{' '}
                            <span className="bg-gradient-to-r from-[#4D72E4] via-[#6B8CFF] to-[#4D72E4] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">cadeiras vazias</span>
                            {' '}da sua barbearia.
                        </motion.h1>

                        {/* Subheadline — secondary-text Equivalent */}
                        <motion.p variants={itemVariants} className="font-body text-base text-slate-400 mb-10 leading-[1.6] max-w-lg font-normal opacity-90">
                            Zere a falta de clientes. O NEXT é o único sistema que agenda, cobra antecipado e traz seu client de volta no piloto automático enquanto você corta.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-10">
                            <Link href="/register">
                                <button className="w-full sm:w-auto px-10 py-4 bg-white text-black text-sm font-bold uppercase tracking-[0.15em] rounded-xl hover:scale-[1.03] active:scale-[0.98] transition-all shadow-[0_0_50px_rgba(255,255,255,0.08)] flex items-center justify-center gap-3 group font-body">
                                    Lotar Minha Agenda <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link href="#pricing" scroll={true}>
                                <button className="w-full sm:w-auto px-8 py-4 bg-transparent text-white/80 text-sm font-medium rounded-xl border border-white/[0.08] hover:border-white/20 hover:text-white hover:bg-white/[0.03] transition-all flex items-center justify-center gap-2 font-body">
                                    Ver demonstração
                                </button>
                            </Link>
                        </motion.div>

                        {/* Stats Row */}
                        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-x-10 gap-y-4 mb-14 py-8 border-y border-white/[0.06]">
                            {[
                                { val: '+182.000', label: 'Agendamentos' },
                                { val: '+R$ 1.4M', label: 'Gerenciados' },
                                { val: '+2.300', label: 'Barbeiros' }
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col">
                                    <span className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-[-0.03em]">{stat.val}</span>
                                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em] mt-1 font-body">{stat.label}</span>
                                </div>
                            ))}
                        </motion.div>

                        {/* Social Proof */}
                        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-5 mb-14">
                            <div className="flex -space-x-3">
                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100" alt="Barbeiro" className="w-11 h-11 rounded-full border-2 border-[#050505] object-cover ring-2 ring-primary/20" />
                                <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100" alt="Barbeiro" className="w-11 h-11 rounded-full border-2 border-[#050505] object-cover ring-2 ring-primary/20" />
                                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&h=100" alt="Barbeiro" className="w-11 h-11 rounded-full border-2 border-[#050505] object-cover ring-2 ring-primary/20" />
                                <div className="w-11 h-11 rounded-full border-2 border-[#050505] bg-[#0A0A0B] flex items-center justify-center text-xs font-bold text-white/60 ring-2 ring-primary/20">
                                    +2k
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-xs font-medium text-slate-500 mt-1 font-body">
                                    Junte-se a <span className="text-white font-semibold">+2.000 barbeiros</span> vitoriosos
                                </p>
                            </div>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-8 border-t border-white/[0.06] pt-10">
                            {[
                                { text: '15 Dias Grátis' },
                                { text: 'Sem fidelidade' }
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-slate-500 hover:text-white/80 transition-colors cursor-default font-body">
                                    <CheckCircle2 className="w-4 h-4 text-primary/80" />
                                    <span>{badge.text}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
