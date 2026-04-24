'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Star, ShieldCheck } from 'lucide-react';
import RollingNotificationFeed from './RollingNotificationFeed';
import { motion } from 'framer-motion';
import LEDCardWrapper from './LEDCardWrapper';

export default function Hero() {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-[#050505]">

            {/* Premium Background Elements (Moving Light Orbs) */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" 
            />
            <motion.div 
                animate={{ 
                    scale: [1, 1.4, 1],
                    x: [0, -60, 0],
                    y: [0, 80, 0],
                    opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/15 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" 
            />
            
            {/* Cinematic Focal Lens (Glow Center) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(77,114,228,0.08),transparent_70%)] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Content */}
                    <motion.div 
                        className="max-w-2xl"
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#4d72e4]" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">O Futuro é NEXT</span>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-3xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-8 tracking-tighter">
                            Acabe com as <br />
                            <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-600 bg-clip-text text-transparent">cadeiras vazias</span> da sua barbearia de uma <br />
                            <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-600 bg-clip-text text-transparent">vez por todas.</span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl font-medium">
                            Zere a falta de clientes. O NEXT é o único sistema que agenda, cobra antecipado e traz seu cliente de volta no piloto automático enquanto você corta.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 mb-14">
                            <Link href="/register">
                                <button className="w-full sm:w-auto px-12 py-5 bg-white text-black text-base font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 group">
                                    Lotar Minha Agenda <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link href="#pricing" scroll={true}>
                                <button className="w-full sm:w-auto px-10 py-5 bg-[#0A0A0B]/80 backdrop-blur-md text-white text-base font-bold rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                                    Ver demonstração
                                </button>
                            </Link>
                        </motion.div>

                        <motion.div variants={itemVariants} className="grid grid-cols-2 md:flex flex-wrap items-center gap-x-10 gap-y-6 mb-14 py-8 border-y border-white/5">
                            <div className="flex flex-col">
                                <span className="text-xl md:text-2xl font-black text-white tracking-tighter">+182.000</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight mt-1">Agendamentos<br />realizados</span>
                            </div>
                            <div className="w-px h-10 bg-white/5 hidden md:block" />
                            <div className="flex flex-col">
                                <span className="text-xl md:text-2xl font-black text-white tracking-tighter">+R$ 1.4M</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight mt-1">Em serviços<br />gerenciados</span>
                            </div>
                            <div className="w-px h-10 bg-white/5 hidden md:block lg:hidden xl:block" />
                            <div className="flex flex-col">
                                <span className="text-xl md:text-2xl font-black text-white tracking-tighter">+2.300</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight mt-1">Barbeiros<br />cadastrados</span>
                            </div>
                        </motion.div>

                        {/* Social Proof Avatars */}
                        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-5 mb-14">
                            <div className="flex -space-x-3">
                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100" alt="Barbeiro" className="w-12 h-12 rounded-full border-2 border-[#050505] object-cover shadow-2xl" />
                                <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100" alt="Barbeiro" className="w-12 h-12 rounded-full border-2 border-[#050505] object-cover shadow-2xl" />
                                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&h=100" alt="Barbeiro" className="w-12 h-12 rounded-full border-2 border-[#050505] object-cover shadow-2xl" />
                                <div className="w-12 h-12 rounded-full border-2 border-[#050505] bg-[#0A0A0B] flex items-center justify-center text-xs font-black text-white shadow-2xl">
                                    +2k
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-xs font-bold text-slate-400 mt-1.5">
                                    Junte-se a <span className="text-white font-black">+2.000 barbeiros</span> vitoriosos
                                </p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-10 border-t border-white/5 pt-12">
                            <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors cursor-default">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                <span>15 Dias Grátis</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors cursor-default">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                <span>Sem fidelidade</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Visual / High-End Dashboard Mockup */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative z-20 group">
                            {/* Decorative Glow */}
                            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <LEDCardWrapper className="rounded-xl">
                                <div className="rounded-xl bg-[#0A0A0B]/80 backdrop-blur-2xl border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] p-4 relative overflow-hidden transition-all duration-700 hover:scale-[1.02] hover:border-white/20">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-blue-500 shadow-[0_0_20px_#4d72e4]" />

                                    {/* Mockup Header */}
                                    <div className="flex items-center justify-between mb-8 px-6 pt-6">
                                        <div className="flex gap-2.5">
                                            <div className="w-3.5 h-3.5 rounded-full bg-red-500/10 border border-red-500/20" />
                                            <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/10 border border-yellow-500/20" />
                                            <div className="w-3.5 h-3.5 rounded-full bg-green-500/10 border border-green-500/20" />
                                        </div>
                                        <div className="px-4 py-1.5 bg-white/5 rounded-full flex items-center gap-2.5 border border-white/5">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sistemas: Ativo</span>
                                        </div>
                                    </div>

                                    {/* Real Dashboard Screenshot */}
                                    <div className="rounded-xl border border-white/5 overflow-hidden bg-black relative aspect-[14/9] group/img shadow-2xl">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none z-10" />
                                        <img 
                                            src="/screenshots/dashboard-overview.png" 
                                            alt="NexApp Dashboard" 
                                            className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover/img:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover/img:bg-transparent transition-colors duration-700" />
                                    </div>
                                </div>
                            </LEDCardWrapper>

                            {/* Rolling Notification Feed (SaaS Style) */}
                            <div className="absolute -left-12 bottom-0 z-30">
                                <RollingNotificationFeed />
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
