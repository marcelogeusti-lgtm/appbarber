'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Star, ShieldCheck } from 'lucide-react';
import RollingNotificationFeed from './RollingNotificationFeed';
import { motion } from 'framer-motion';

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
        <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-white">

            {/* Premium Background Elements (Floating Parallax) */}
            <motion.div 
                animate={{ rotate: 360, x: [0, 50, 0], y: [0, -50, 0] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" 
            />
            <motion.div 
                animate={{ rotate: -360, x: [0, -30, 0], y: [0, 30, 0] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" 
            />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Content */}
                    <motion.div 
                        className="max-w-2xl"
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-8">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">O Futuro é NEXT</span>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                            Acabe com as <br />
                            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">cadeiras vazias</span> da sua barbearia de uma <br />
                            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">vez por todas.</span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl font-medium">
                            Zere a falta de clientes. O NEXT é o único sistema que agenda, cobra antecipado e traz seu cliente de volta no piloto automático enquanto você corta.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-10">
                            <Link href="/register">
                                <button className="w-full sm:w-auto px-10 py-5 bg-gray-900 text-white text-base font-bold rounded-2xl hover:bg-black hover:shadow-[0_0_30px_rgba(30,58,138,0.3)] transition-all shadow-xl flex items-center justify-center gap-2 group transform hover:-translate-y-1">
                                    Lotar Minha Agenda <span className="opacity-60 text-xs font-black uppercase">(Grátis)</span> <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link href="#pricing" scroll={true}>
                                <button className="w-full sm:w-auto px-10 py-4 bg-white text-gray-900 text-base font-bold rounded-2xl border border-gray-200 hover:border-primary/30 hover:bg-blue-50/50 hover:text-primary transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1">
                                    Ver demonstração
                                </button>
                            </Link>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-12 py-6 border-y border-gray-50">
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-gray-900 tracking-tighter">+182.000</span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Agendamentos<br />realizados</span>
                            </div>
                            <div className="w-px h-8 bg-gray-100 hidden sm:block" />
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-gray-900 tracking-tighter">+R$ 1.4M</span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Em serviços<br />gerenciados</span>
                            </div>
                            <div className="w-px h-8 bg-gray-100 hidden md:block" />
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-gray-900 tracking-tighter">+2.300</span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Barbeiros<br />cadastrados</span>
                            </div>
                            <div className="w-px h-8 bg-gray-100 hidden lg:block" />
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-gray-900 tracking-tighter">+89.000</span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Clientes<br />atendidos</span>
                            </div>
                        </motion.div>

                        {/* Social Proof Avatars */}
                        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mb-12">
                            <div className="flex -space-x-3">
                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100" alt="Barbeiro" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
                                <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&h=100" alt="Barbeiro" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
                                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&h=100" alt="Barbeiro" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100" alt="Barbeiro" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-600 shadow-sm">
                                    +2k
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-[11px] font-semibold text-gray-500 mt-1">
                                    Junte-se a <span className="text-gray-900 font-bold">+2.000 barbeiros</span> cadastrados
                                </p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-8 border-t border-gray-50 pt-10">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <span>15 Dias Grátis</span>
                            </div>
                            <div className="h-8 w-px bg-gray-100 hidden sm:block" />
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
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
                            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_50px_100px_rgba(0,0,0,0.08)] p-3 relative overflow-hidden transition-all duration-700 hover:scale-[1.03]">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-blue-600" />

                                {/* Mockup Header */}
                                <div className="flex items-center justify-between mb-6 px-5 pt-5">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400/20" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400/20" />
                                        <div className="w-3 h-3 rounded-full bg-green-400/20" />
                                    </div>
                                    <div className="px-3 py-1 bg-gray-50 rounded-full flex items-center gap-2 border border-gray-200/50">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Maestro Server: Online</span>
                                    </div>
                                </div>

                                {/* Real Dashboard Screenshot */}
                                <div className="rounded-[1.5rem] border border-gray-50 overflow-hidden bg-gray-900 relative aspect-video group/img shadow-inner">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none z-10" />
                                    <img 
                                        src="/screenshots/dashboard-overview.png" 
                                        alt="NexApp Dashboard Overview" 
                                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/img:scale-110"
                                    />
                                </div>
                            </div>

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
