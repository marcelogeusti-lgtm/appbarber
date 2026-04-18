'use client';
import { Check, ArrowRight, Zap, Trophy, Crown } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
        <section className="py-32 bg-white relative overflow-hidden" id="pricing">
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-6">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Planos Maestro</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Escolha seu Nível de <br />
                        <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Dominação.</span>
                    </h2>
                    <p className="text-gray-500 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
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
                    <motion.div 
                        variants={cardVariants} 
                        whileHover={{ y: -15, scale: 1.02, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="p-10 rounded-[3rem] bg-gray-50 border border-gray-200 flex flex-col hover:border-primary/20 group cursor-default"
                    >
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h4 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Autônomo</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Para unidades individuais.</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                <Zap className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="flex items-baseline gap-1 mb-10">
                            <span className="text-5xl font-extrabold text-gray-900 tracking-tight">R$49</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">/ mensal</span>
                        </div>

                        <ul className="space-y-6 mb-12 flex-1">
                            {['1 Profissional Master', 'Acesso à Agenda Maestro', 'Link de Agendamento Pro', 'WhatsApp Lembretes'].map(i => (
                                <li key={i} className="flex items-center gap-4 text-xs font-black text-gray-900 uppercase tracking-tight">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Check className="w-3 h-3" />
                                    </div> {i}
                                </li>
                            ))}
                        </ul>

                        <Link href="/register">
                            <button className="w-full py-6 rounded-2xl border-2 border-gray-100 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:shadow-lg transition-all text-gray-900">
                                Ativar Plano Core
                            </button>
                        </Link>
                    </motion.div>

                    {/* Diamond Pro */}
                    <motion.div 
                        variants={cardVariants} 
                        whileHover={{ y: -15, scale: 1.07 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="p-10 rounded-[3rem] bg-gray-900 border-2 border-primary flex flex-col relative scale-[1.05] z-10 shadow-[0_40px_100px_rgba(77,114,228,0.25)] hover:shadow-[0_60px_120px_rgba(77,114,228,0.4)] overflow-hidden group cursor-default"
                    >
                        {/* Shine Effect */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40 group-hover:animate-shine" />

                        {/* Glow Effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-primary to-blue-500 rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em] shadow-xl shadow-primary/40">
                            Recomendado para você
                        </div>

                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Diamond Pro</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Crescimento Acelerado</p>
                            </div>
                            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                                <Crown className="w-6 h-6 fill-current" />
                            </div>
                        </div>

                        <div className="flex items-baseline gap-1 mb-10">
                            <span className="text-5xl font-extrabold text-white tracking-tight">R$89<span className="text-2xl">,70</span></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">/ mensal</span>
                        </div>

                        <ul className="space-y-6 mb-12 flex-1">
                            {['Até 5 Profissionais', 'Dashboard de Elite', 'Fidelização Completa', 'Financeiro Avançado', 'Estoque & Produtos'].map(i => (
                                <li key={i} className="flex items-center gap-4 text-xs font-black text-white uppercase tracking-tight">
                                    <div className="w-5 h-5 rounded-full bg-primary/80 flex items-center justify-center text-white shadow-lg shadow-primary/40">
                                        <Check className="w-3 h-3" />
                                    </div> {i}
                                </li>
                            ))}
                        </ul>

                        <Link href="/register">
                            <button className="w-full py-6 rounded-2xl bg-gradient-to-r from-primary to-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:from-blue-600 hover:to-primary transition-all shadow-[0_20px_40px_rgba(77,114,228,0.4)] flex items-center justify-center gap-3 group/btn">
                                Upgrade Diamond <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                    </motion.div>

                    {/* Empire */}
                    <motion.div 
                        variants={cardVariants} 
                        whileHover={{ y: -15, scale: 1.02, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="p-10 rounded-[3rem] bg-gray-50 border border-gray-200 flex flex-col hover:border-gray-900/10 group cursor-default"
                    >
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h4 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Empire</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Escala sem limites.</p>
                            </div>
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-gray-900 transition-colors">
                                <Trophy className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="flex items-baseline gap-1 mb-10">
                            <span className="text-5xl font-extrabold text-gray-900 tracking-tight">R$159<span className="text-2xl">,70</span></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">/ mensal</span>
                        </div>

                        <ul className="space-y-6 mb-12 flex-1">
                            {['Ilimitados Profissionais', 'Multi-unidades', 'Suporte VIP 24h', 'Assunção de Custos MP', 'Exportação Full de Dados'].map(i => (
                                <li key={i} className="flex items-center gap-4 text-xs font-black text-gray-600 uppercase tracking-tight">
                                    <div className="w-5 h-5 rounded-full bg-gray-900/5 flex items-center justify-center text-gray-900">
                                        <Check className="w-3 h-3" />
                                    </div> {i}
                                </li>
                            ))}
                        </ul>

                        <Link href="/register">
                            <button className="w-full py-6 rounded-2xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-gray-200 hover:-translate-y-1">
                                Solicitar Convite Empire
                            </button>
                        </Link>
                    </motion.div>

                </motion.div>

                <div className="mt-20">
                    <div className="max-w-2xl mx-auto bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6 justify-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center flex-shrink-0 text-blue-500">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h5 className="font-extrabold text-gray-900 text-sm uppercase tracking-tight">Tem medo de perder seus clientes ao trocar de sistema?</h5>
                            <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">Fique tranquilo. A equipe Maestro importa <strong className="text-primary">toda a sua base atual do concorrente (ou da planilha) gratuitamente em 1 clique</strong> durante seu onboarding.</p>
                        </div>
                    </div>
                    
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] flex items-center justify-center gap-4 mt-12">
                        <span className="w-12 h-px bg-gray-100" />
                        Sem Contratos de Fidelidade
                        <span className="w-12 h-px bg-gray-100" />
                    </p>
                </div>
            </div>
        </section >
    );
}
