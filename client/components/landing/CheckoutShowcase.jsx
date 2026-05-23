'use client';
import { Check, ArrowRight, User, Scissors, Calendar, CreditCard, ShoppingBag, Zap } from 'lucide-react';
import { useState } from 'react';
import LEDCardWrapper from './LEDCardWrapper';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
    { title: 'Serviço', icon: Scissors, desc: 'Corte + Barba' },
    { title: 'Profissional', icon: User, desc: 'Marcelo Maestro' },
    { title: 'Data/Hora', icon: Calendar, desc: 'Hoje, 15:00' },
    { title: 'Confirmação', icon: CreditCard, desc: 'Pagamento Seguro' }
];

export default function CheckoutShowcase() {
    const [activeStep, setActiveStep] = useState(2);

    return (
        <section className="py-32 bg-[#050505] overflow-hidden relative border-y border-white/[0.06]">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-10 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#4d72e4]" />
                            <span className="font-body text-[10px] font-black text-white uppercase tracking-[0.3em]">Conversão Máxima</span>
                        </div>
                        <h2 className="font-display text-4xl lg:text-[5rem] font-extrabold text-white leading-[0.95] mb-8 tracking-[-0.05em] text-balance">
                            Agendamento Sem Fricção. <br />
                            <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent italic">Checkout de Elite.</span>
                        </h2>
                        <p className="font-body text-slate-400 text-xl font-medium leading-relaxed max-w-3xl mx-auto">
                            Inspirado nos checkouts de e-commerce mais rápidos do mundo. Seu cliente agenda e paga em menos de 30 segundos, direto do navegador.
                        </p>
                    </motion.div>
                </div>

                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-[#0A0A0B]/60 backdrop-blur-3xl border border-white/[0.1] rounded-[3.5rem] p-10 lg:p-20 shadow-[0_60px_120px_rgba(0,0,0,0.6)] relative overflow-hidden group/container"
                    >
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />

                        {/* Progress Bar with Coded Precision */}
                        <div className="flex justify-between items-center mb-24 relative px-4 lg:px-10">
                            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/[0.05] -translate-y-1/2" />
                            <motion.div
                                className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-primary to-blue-500 -translate-y-1/2 shadow-[0_0_20px_#4d72e4]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                            />

                            {STEPS.map((step, idx) => {
                                const Icon = step.icon;
                                const isCompleted = idx < activeStep;
                                const isActive = idx === activeStep;

                                return (
                                    <div key={idx} className="relative z-10 flex flex-col items-center">
                                        <motion.div
                                            onClick={() => setActiveStep(idx)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`w-14 lg:w-16 h-14 lg:h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-700 cursor-pointer shadow-2xl relative ${isCompleted ? 'bg-primary text-white shadow-[0_0_30px_rgba(77,114,228,0.4)] border-none' :
                                                isActive ? 'bg-[#0A0A0B] text-primary border-2 border-primary ring-8 ring-primary/5' :
                                                    'bg-[#121214] text-slate-500 border border-white/[0.08] hover:border-white/20 hover:text-white'
                                                }`}
                                        >
                                            <AnimatePresence mode="wait">
                                                {isCompleted ? (
                                                    <motion.div
                                                        key="check"
                                                        initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                        exit={{ opacity: 0, scale: 0.5 }}
                                                    >
                                                        <Check className="w-6 lg:w-8 h-6 lg:h-8 stroke-[4px]" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="icon"
                                                        initial={{ opacity: 0, scale: 0.5 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.5 }}
                                                    >
                                                        <Icon className="w-5 lg:w-7 h-5 lg:h-7" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                        <div className="hidden lg:block absolute top-[5rem] text-center w-40">
                                            <p className={`font-body text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${isActive || isCompleted ? 'text-white' : 'text-slate-600'}`}>
                                                {step.title}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Step Card Display */}
                        <div className="grid lg:grid-cols-2 gap-20 items-start mt-32 lg:mt-48">
                            <div className="space-y-12">
                                <div className="space-y-5">
                                    <p className="font-body text-primary font-black uppercase text-[10px] tracking-[0.4em]">Experiência do Cliente</p>
                                    <h3 className="font-display text-4xl lg:text-5xl font-extrabold text-white tracking-[-0.04em]">Resumo Maestro</h3>
                                </div>

                                <div className="bg-white/[0.02] border border-white/[0.08] rounded-[2rem] p-10 space-y-10 backdrop-blur-3xl shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                        <Zap className="w-32 h-32 text-primary" />
                                    </div>

                                    {STEPS.map((step, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{
                                                opacity: idx <= activeStep ? 1 : 0.2,
                                                x: idx <= activeStep ? 0 : 20,
                                                filter: idx <= activeStep ? 'blur(0px)' : 'blur(4px)'
                                            }}
                                            transition={{ duration: 0.5 }}
                                            className="flex items-center gap-8 group"
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${idx === activeStep ? 'bg-primary text-white scale-110 shadow-[0_0_25px_rgba(77,114,228,0.3)]' : 'bg-white/[0.04] text-slate-500 border border-white/[0.06]'}`}>
                                                <step.icon className="w-6 h-6 px-0.5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-body text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1.5">{step.title}</p>
                                                <p className="font-body text-xl font-bold text-white tracking-tight leading-none">{idx <= activeStep ? step.desc : 'Aguardando...'}</p>
                                            </div>
                                            {idx < activeStep && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/20"
                                                >
                                                    <Check className="w-4 h-4 stroke-[4px]" />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <motion.div
                                className="relative group/card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="absolute -inset-10 bg-primary/10 blur-[100px] rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                                <LEDCardWrapper className="rounded-[2.5rem]">
                                    <div className="relative bg-[#0A0A0B] border border-white/[0.1] rounded-[2.5rem] p-12 lg:p-14 shadow-2xl transition-all duration-700 hover:scale-[1.02] hover:border-white/20">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/5 to-primary/40 rounded-t-[2.5rem]" />

                                        <div className="flex items-center justify-between mb-14">
                                            <div className="w-16 h-16 bg-white/[0.04] border border-white/[0.08] rounded-2xl flex items-center justify-center text-primary shadow-2xl group-hover/card:rotate-[-5deg] transition-transform duration-700">
                                                <CreditCard className="w-8 h-8" />
                                            </div>
                                            <div className="text-right">
                                                <p className="font-body text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Total Investido</p>
                                                <p className="font-display text-5xl font-extrabold text-white tracking-[-0.05em] tabular-nums">R$ 85,00</p>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <motion.button
                                                whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full py-6 bg-white text-black text-center font-body font-black uppercase text-[12px] tracking-[0.4em] rounded-2xl shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-3"
                                            >
                                                Confirmar Reserva <ArrowRight className="w-4 h-4" />
                                            </motion.button>
                                            <p className="font-body text-[10px] text-center text-slate-500 font-black uppercase tracking-[0.25em] leading-none flex items-center justify-center gap-2">
                                                <Lock className="w-3 h-3 text-emerald-500" /> Transação Criptografada
                                            </p>
                                        </div>

                                        {/* Order Bump Mini */}
                                        <div className="mt-14 pt-12 border-t border-white/[0.06]">
                                            <motion.div
                                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.06)' }}
                                                className="flex items-center gap-6 p-6 bg-white/[0.03] rounded-[1.75rem] border border-white/[0.08] hover:border-primary/40 transition-colors cursor-pointer group/bump"
                                            >
                                                <div className="w-14 h-14 bg-primary/10 rounded-2xl shadow-inner flex items-center justify-center text-primary group-hover/bump:bg-primary group-hover/bump:text-white transition-all duration-500">
                                                    <ShoppingBag className="w-7 h-7" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-body text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-1.5">Sugestão Maestro</p>
                                                    <p className="font-body text-base font-bold text-white tracking-tight">Pomada Efeito Seco</p>
                                                </div>
                                                <div className="font-display text-lg font-black text-white group-hover/bump:text-primary transition-colors tabular-nums">+ R$ 25</div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </LEDCardWrapper>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
