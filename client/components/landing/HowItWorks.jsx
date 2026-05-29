'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, Clock, Star, Wifi, Battery, Scissors, MessageSquare, ShieldCheck, Sparkles, Award, Phone, Search, MapPin, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

export default function HowItWorks() {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);

    const steps = [
        {
            num: "01",
            title: t('howItWorks.s1_title'),
            desc: t('howItWorks.s1_desc'),
            label: t('howItWorks.s1_label')
        },
        {
            num: "02",
            title: t('howItWorks.s2_title'),
            desc: t('howItWorks.s2_desc'),
            label: t('howItWorks.s2_label')
        },
        {
            num: "03",
            title: t('howItWorks.s3_title'),
            desc: t('howItWorks.s3_desc'),
            label: t('howItWorks.s3_label')
        },
        {
            num: "04",
            title: t('howItWorks.s4_title'),
            desc: t('howItWorks.s4_desc'),
            label: t('howItWorks.s4_label')
        }
    ];

    // Auto-advance tabs every 5.5 seconds, resetting the interval automatically on activeIndex changes (manual click)
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % steps.length);
        }, 5500);
        return () => clearInterval(interval);
    }, [activeIndex]);

    const handleTabClick = (index) => {
        setActiveIndex(index);
    };

    return (
        <section id="start" className="py-32 bg-[#050505] relative overflow-hidden border-t border-white/[0.04]">
            {/* Background glowing lights */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/[0.03] blur-[140px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                
                {/* Section Header */}
                <div className="max-w-3xl mb-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-body bg-white/[0.03] border border-white/[0.08] text-primary tracking-[0.2em] uppercase mb-5">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        <span>{t('howItWorks.eyebrow')}</span>
                    </div>
                    <h2 className="font-display text-4xl lg:text-6xl font-extrabold text-white mb-6 tracking-[-0.04em] leading-[1.1]">
                        {t('howItWorks.title_part1')} <br />
                        <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent">{t('howItWorks.title_highlight')}</span>
                    </h2>
                    <p className="font-body text-gray-400 text-lg max-w-xl">
                        {t('howItWorks.subtitle')}
                    </p>
                </div>

                {/* Main Interactive Grid */}
                <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
                    
                    {/* Left Column: Interactive Tabs (col-span-5) */}
                    <div className="w-full lg:col-span-5 flex flex-col gap-5">
                        {steps.map((step, i) => {
                            const isActive = activeIndex === i;
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleTabClick(i)}
                                    className={`relative overflow-hidden group text-left p-6 sm:p-7 rounded-[24px] border transition-all duration-500 focus:outline-none ${
                                        isActive
                                            ? 'border-white/[0.08] bg-white/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[1.01]'
                                            : 'border-white/[0.02] bg-white/[0.005] hover:bg-white/[0.015]'
                                    }`}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] font-body transition-colors duration-500 ${
                                                isActive ? 'text-primary' : 'text-slate-500'
                                            }`}>
                                                {step.label}
                                            </span>
                                            <h3 className={`text-[18px] sm:text-[20px] font-bold font-display mt-1 transition-colors duration-500 ${
                                                isActive ? 'text-white' : 'text-white/40 group-hover:text-white/60'
                                            }`}>
                                                {step.title}
                                            </h3>
                                            
                                            {/* Expandable description based on active status */}
                                            <div className={`mt-2 text-[14px] font-body leading-relaxed text-slate-400 transition-all duration-500 overflow-hidden ${
                                                isActive ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                                            }`}>
                                                {step.desc}
                                            </div>
                                        </div>
                                        
                                        <span className={`text-[13px] font-mono tracking-wider font-black transition-colors duration-500 ${
                                            isActive ? 'text-primary/25' : 'text-white/5'
                                        }`}>
                                            {step.num}
                                        </span>
                                    </div>

                                    {/* Bottom Animated Progress Line */}
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 h-[2px] bg-white/5 w-full">
                                            <div 
                                                key={activeIndex} // dynamic key triggers animation reset perfectly on change
                                                className="h-full bg-gradient-to-r from-primary to-blue-400 w-full origin-left animate-progress"
                                            />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Column: Bezel-less Mobile Mockup Simulator (col-span-7) */}
                    <div className="w-full lg:col-span-7 flex justify-center lg:justify-end">
                        <div className="relative">
                            
                            {/* Glow Behind Mobile */}
                            <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full -z-10 animate-pulse duration-[8s]" />

                            {/* Ultra High-Fidelity Phone Frame container */}
                            <div className="relative mx-auto h-[580px] w-[275px] sm:h-[620px] sm:w-[295px] shrink-0 rounded-[48px] border-[10px] border-[#151516] bg-black shadow-[0_40px_90px_-20px_rgba(0,0,0,0.95)] ring-1 ring-white/15 overflow-hidden">
                                
                                {/* Dynamic Island / Notch */}
                                <div className="absolute top-2.5 left-1/2 z-30 h-[20px] w-[78px] -translate-x-1/2 rounded-full bg-black flex items-center justify-between px-2.5 text-[8px] text-white/30">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-900 border border-blue-500/40 animate-pulse" />
                                    <div className="w-3.5 h-1 rounded-full bg-neutral-900" />
                                </div>

                                {/* Custom Mobile Screen Container */}
                                <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-[#0c0c0d] flex flex-col">
                                    
                                    {/* Simulated Mobile Status & Browser Bar */}
                                    <div className="flex flex-col bg-[#0d0d0e] border-b border-white/[0.04] px-4 pb-2.5 pt-8">
                                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono tracking-tight mb-2">
                                            <span>18:30</span>
                                            <div className="flex items-center gap-1.5">
                                                <Wifi className="w-2.5 h-2.5" />
                                                <Battery className="w-3 h-3" />
                                            </div>
                                        </div>
                                        <div className="mx-auto flex w-full max-w-[210px] items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-[9px] text-slate-400 font-body">
                                            <span className="truncate tracking-wide font-medium">app.barbeiro/imperio</span>
                                        </div>
                                    </div>

                                    {/* Live Simulated Screen Views - Animated Transitions */}
                                    <div className="relative flex-1 w-full bg-[#0c0c0d] overflow-hidden p-4">
                                        <AnimatePresence mode="wait">
                                            
                                            {/* STEP 1: Escolha do Profissional */}
                                            {activeIndex === 0 && (
                                                <motion.div
                                                    key="step-0"
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -15 }}
                                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                                    className="absolute inset-0 flex flex-col px-3 py-3"
                                                >
                                                    <span className="text-[10px] font-black uppercase text-primary tracking-wider">Passo 1</span>
                                                    <h4 className="text-[14px] font-bold text-white font-display mt-0.5 mb-4">Escolha o Profissional</h4>
                                                    
                                                    {/* Barbers List */}
                                                    <div className="space-y-3 flex-1">
                                                        
                                                        {/* Selected Barber Card */}
                                                        <motion.div 
                                                            animate={{ borderColor: ["rgba(255,255,255,0.04)", "rgba(77,114,228,0.4)", "rgba(77,114,228,0.4)"] }}
                                                            transition={{ delay: 1.2, duration: 0.8 }}
                                                            className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] transition-all"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white text-[11px] font-black font-mono shadow-md">
                                                                    MS
                                                                </div>
                                                                <div>
                                                                    <p className="text-[11px] font-bold text-white font-body">Marcos Silva</p>
                                                                    <p className="text-[9px] text-slate-500 font-body">Cabelo & Barba Maestro</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-0.5 text-amber-400 text-[9px] font-mono">
                                                                <Star className="w-2.5 h-2.5 fill-current" />
                                                                <span className="font-bold">4.9</span>
                                                            </div>
                                                        </motion.div>

                                                        {/* Barber 2 */}
                                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.01] border border-white/[0.02] opacity-50">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-blue-700 flex items-center justify-center text-white text-[11px] font-black font-mono">
                                                                    TR
                                                                </div>
                                                                <div>
                                                                    <p className="text-[11px] font-bold text-white font-body">Thiago Ramos</p>
                                                                    <p className="text-[9px] text-slate-500 font-body">Especialista em Degradê</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-0.5 text-slate-500 text-[9px] font-mono">
                                                                <Star className="w-2.5 h-2.5 fill-current text-slate-600" />
                                                                <span>4.8</span>
                                                            </div>
                                                        </div>

                                                        {/* Barber 3 */}
                                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.01] border border-white/[0.02] opacity-50">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-[11px] font-black font-mono">
                                                                    LN
                                                                </div>
                                                                <div>
                                                                    <p className="text-[11px] font-bold text-white font-body">Lucas Neto</p>
                                                                    <p className="text-[9px] text-slate-500 font-body">Visagista Premium</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-0.5 text-slate-500 text-[9px] font-mono">
                                                                <Star className="w-2.5 h-2.5 fill-current text-slate-600" />
                                                                <span>5.0</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Simulated Cursor Clicking MS */}
                                                    <motion.div 
                                                        initial={{ x: 120, y: 150, opacity: 0 }}
                                                        animate={{ x: 200, y: 35, opacity: [0, 1, 1, 0] }}
                                                        transition={{ delay: 0.4, duration: 1.2, ease: "easeInOut" }}
                                                        className="absolute w-5 h-5 rounded-full bg-primary/40 border border-primary flex items-center justify-center shadow-lg pointer-events-none z-40"
                                                    >
                                                        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
                                                    </motion.div>
                                                </motion.div>
                                            )}

                                            {/* STEP 2: Menu de Serviços Online */}
                                            {activeIndex === 1 && (
                                                <motion.div
                                                    key="step-1"
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -15 }}
                                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                                    className="absolute inset-0 flex flex-col px-3 py-3"
                                                >
                                                    <span className="text-[10px] font-black uppercase text-primary tracking-wider">Passo 2</span>
                                                    <h4 className="text-[14px] font-bold text-white font-display mt-0.5 mb-1">Escolha o Serviço</h4>
                                                    <p className="text-[9px] text-slate-500 font-body mb-3">Profissional: Marcos Silva</p>
                                                    
                                                    {/* Services list */}
                                                    <div className="space-y-3 flex-1">
                                                        
                                                        {/* Service 1 */}
                                                        <div className="p-3 rounded-2xl bg-white/[0.01] border border-white/[0.02] opacity-40">
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-[10px] font-bold text-white font-body">Corte degradê moderno</p>
                                                                <p className="text-[10px] font-bold text-slate-400 font-mono">R$ 45,00</p>
                                                            </div>
                                                            <p className="text-[8px] text-slate-500 mt-1 font-body">Lavagem e finalização profissional com pomada.</p>
                                                        </div>

                                                        {/* Service 2: Selected Combo */}
                                                        <motion.div 
                                                            animate={{ borderColor: ["rgba(255,255,255,0.02)", "rgba(77,114,228,0.4)", "rgba(77,114,228,0.4)"] }}
                                                            transition={{ delay: 1.2, duration: 0.8 }}
                                                            className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.02] relative"
                                                        >
                                                            <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary">
                                                                <Check className="w-2.5 h-2.5 stroke-[3px]" />
                                                            </div>
                                                            
                                                            <div className="flex justify-between items-start pr-5">
                                                                <div>
                                                                    <span className="text-[7px] font-black uppercase text-primary tracking-wider bg-primary/10 px-1.5 py-0.5 rounded-full">Popular</span>
                                                                    <p className="text-[10px] font-bold text-white font-body mt-1">Combo Imperador</p>
                                                                </div>
                                                                <p className="text-[10px] font-bold text-primary font-mono">R$ 75,00</p>
                                                            </div>
                                                            <p className="text-[8px] text-slate-400 mt-1 font-body">Corte moderno + Barba navalhada + Toalha quente e massagem facial.</p>
                                                        </motion.div>

                                                        {/* Service 3 */}
                                                        <div className="p-3 rounded-2xl bg-white/[0.01] border border-white/[0.02] opacity-40">
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-[10px] font-bold text-white font-body">Barboterapia Simples</p>
                                                                <p className="text-[10px] font-bold text-slate-400 font-mono">R$ 35,00</p>
                                                            </div>
                                                            <p className="text-[8px] text-slate-500 mt-1 font-body">Barba alinhada com creme especial e navalha descartável.</p>
                                                        </div>
                                                    </div>

                                                    {/* Simulated Cursor Selecting Combo */}
                                                    <motion.div 
                                                        initial={{ x: 220, y: 30, opacity: 0 }}
                                                        animate={{ x: 200, y: 110, opacity: [0, 1, 1, 0] }}
                                                        transition={{ delay: 0.4, duration: 1.2, ease: "easeInOut" }}
                                                        className="absolute w-5 h-5 rounded-full bg-primary/40 border border-primary flex items-center justify-center shadow-lg pointer-events-none z-40"
                                                    >
                                                        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
                                                    </motion.div>
                                                </motion.div>
                                            )}

                                            {/* STEP 3: Horários em Tempo Real */}
                                            {activeIndex === 2 && (
                                                <motion.div
                                                    key="step-2"
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -15 }}
                                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                                    className="absolute inset-0 flex flex-col px-3 py-3"
                                                >
                                                    <span className="text-[10px] font-black uppercase text-primary tracking-wider">Passo 3</span>
                                                    <h4 className="text-[14px] font-bold text-white font-display mt-0.5 mb-1">Selecione Data e Hora</h4>
                                                    <p className="text-[9px] text-slate-500 font-body mb-3">Serviço: Combo Imperador</p>
                                                    
                                                    {/* Calendar Days */}
                                                    <div className="flex gap-2 mb-4 justify-between">
                                                        <div className="flex-1 py-1.5 rounded-xl bg-white/[0.01] border border-white/[0.04] text-center opacity-40">
                                                            <p className="text-[7px] text-slate-400 font-body">Sex</p>
                                                            <p className="text-[10px] font-bold text-white font-mono mt-0.5">27</p>
                                                        </div>
                                                        <motion.div 
                                                            animate={{ borderColor: ["rgba(255,255,255,0.04)", "rgba(77,114,228,0.4)"] }}
                                                            transition={{ delay: 0.8 }}
                                                            className="flex-1 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.04] text-center"
                                                        >
                                                            <p className="text-[7px] text-primary font-bold font-body">Sáb</p>
                                                            <p className="text-[10px] font-bold text-white font-mono mt-0.5">28</p>
                                                        </motion.div>
                                                        <div className="flex-1 py-1.5 rounded-xl bg-white/[0.01] border border-white/[0.04] text-center opacity-40">
                                                            <p className="text-[7px] text-slate-400 font-body">Ter</p>
                                                            <p className="text-[10px] font-bold text-white font-mono mt-0.5">31</p>
                                                        </div>
                                                    </div>

                                                    {/* Hour Grid */}
                                                    <div className="grid grid-cols-2 gap-2 flex-1">
                                                        <div className="py-2.5 rounded-xl bg-white/[0.01] border border-white/[0.02] text-center opacity-30 flex items-center justify-center gap-1">
                                                            <Clock className="w-2.5 h-2.5" />
                                                            <span className="text-[10px] font-mono">09:00</span>
                                                        </div>
                                                        <div className="py-2.5 rounded-xl bg-white/[0.01] border border-white/[0.02] text-center opacity-30 flex items-center justify-center gap-1">
                                                            <Clock className="w-2.5 h-2.5" />
                                                            <span className="text-[10px] font-mono">10:30</span>
                                                        </div>
                                                        
                                                        {/* Selected Hour Slot */}
                                                        <motion.div 
                                                            animate={{ 
                                                                backgroundColor: ["rgba(255,255,255,0.02)", "rgba(77,114,228,1)"],
                                                                color: ["#ffffff", "#ffffff"],
                                                                borderColor: ["rgba(255,255,255,0.04)", "rgba(77,114,228,1)"]
                                                            }}
                                                            transition={{ delay: 1.2, duration: 0.6 }}
                                                            className="py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center flex items-center justify-center gap-1 font-bold text-white"
                                                        >
                                                            <Clock className="w-2.5 h-2.5" />
                                                            <span className="text-[10px] font-mono">14:30</span>
                                                        </motion.div>

                                                        <div className="py-2.5 rounded-xl bg-white/[0.01] border border-white/[0.02] text-center opacity-30 flex items-center justify-center gap-1">
                                                            <Clock className="w-2.5 h-2.5" />
                                                            <span className="text-[10px] font-mono">16:00</span>
                                                        </div>
                                                    </div>

                                                    {/* Simulated Cursor Selecting 14:30 */}
                                                    <motion.div 
                                                        initial={{ x: 50, y: 50, opacity: 0 }}
                                                        animate={{ x: 130, y: 135, opacity: [0, 1, 1, 0] }}
                                                        transition={{ delay: 0.4, duration: 1.2, ease: "easeInOut" }}
                                                        className="absolute w-5 h-5 rounded-full bg-primary/40 border border-primary flex items-center justify-center shadow-lg pointer-events-none z-40"
                                                    >
                                                        <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
                                                    </motion.div>
                                                </motion.div>
                                            )}

                                            {/* STEP 4: Confirmação & Disparo via WhatsApp */}
                                            {activeIndex === 3 && (
                                                <motion.div
                                                    key="step-3"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.4 }}
                                                    className="absolute inset-0 flex flex-col items-center justify-between px-3 py-6 text-center"
                                                >
                                                    {/* Top empty spacer for the WhatsApp push down alert */}
                                                    <div className="h-10" />

                                                    {/* Success Card content */}
                                                    <div className="flex flex-col items-center">
                                                        <motion.div 
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                                                            className="w-14 h-14 rounded-full bg-primary/10 border border-primary flex items-center justify-center text-primary mb-4 shadow-[0_0_20px_rgba(77,114,228,0.2)] animate-pulse"
                                                        >
                                                            <Check className="w-7 h-7 stroke-[3px]" />
                                                        </motion.div>
                                                        
                                                        <span className="text-[9px] font-black uppercase text-primary/80 tracking-widest font-body">Tudo Pronto!</span>
                                                        <h4 className="text-[15px] font-bold text-white font-display mt-1">Horário Agendado</h4>
                                                        
                                                        {/* Summary card */}
                                                        <div className="mt-4 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-left w-full max-w-[190px]">
                                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider font-body">Profissional</p>
                                                            <p className="text-[10px] font-bold text-white font-body">Marcos Silva</p>
                                                            
                                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider font-body mt-2">Data & Hora</p>
                                                            <p className="text-[10px] font-bold text-primary font-mono">Sáb, 28 Mai às 14:30</p>
                                                        </div>
                                                    </div>

                                                    {/* Bottom badge */}
                                                    <div className="text-[8px] text-slate-500 font-body flex items-center gap-1.5 justify-center py-1.5 px-3 rounded-full bg-white/[0.02] border border-white/[0.04]">
                                                        <ShieldCheck className="w-3.5 h-3.5 text-primary/65" />
                                                        <span>Agendamento Criptografado</span>
                                                    </div>

                                                    {/* WhatsApp Floating Native Alert - Slides Down elegantly */}
                                                    <motion.div 
                                                        initial={{ y: -100, opacity: 0 }}
                                                        animate={{ y: -20, opacity: 1 }}
                                                        transition={{ delay: 1.0, duration: 0.6, type: "spring", stiffness: 80 }}
                                                        className="absolute top-10 inset-x-2 bg-[#121b22] border border-[#232e36] text-left p-3.5 rounded-[18px] shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-40 flex gap-2.5 items-start shrink-0"
                                                    >
                                                        <div className="w-7 h-7 rounded-lg bg-[#25d366] flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/10">
                                                            <MessageSquare className="w-4 h-4 fill-current text-[#121b22]" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[9px] font-bold text-[#25d366] uppercase tracking-wider font-body">WhatsApp</span>
                                                                <span className="text-[8px] text-slate-500 font-mono">Agora mesmo</span>
                                                            </div>
                                                            <p className="text-[9px] font-bold text-white font-body mt-0.5 truncate">Barbearia Império</p>
                                                            <p className="text-[8px] text-slate-300 font-body leading-relaxed mt-0.5">
                                                                Olá! Seu Combo Imperador para Sábado às 14:30 está confirmado! ✂️
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                </motion.div>
                                            )}

                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* Custom Embedded CSS Animation Styles for the Linear Tab Progress Bar */}
            <style>{`
                @keyframes progress {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
                .animate-progress {
                    animation: progress 5.5s linear forwards;
                }
            `}</style>
        </section>
    );
}
