'use client';
import { Check, ArrowRight, User, Scissors, Calendar, CreditCard, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import LEDCardWrapper from './LEDCardWrapper';

const STEPS = [
    { title: 'Serviço', icon: Scissors, desc: 'Corte + Barba' },
    { title: 'Profissional', icon: User, desc: 'Marcelo Maestro' },
    { title: 'Data/Hora', icon: Calendar, desc: 'Hoje, 15:00' },
    { title: 'Confirmação', icon: CreditCard, desc: 'Pagamento Seguro' }
];

export default function CheckoutShowcase() {
    const [activeStep, setActiveStep] = useState(2);

    return (
        <section className="py-24 bg-[#050505] overflow-hidden relative border-y border-white/5">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#4d72e4]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Experiência de Elite</span>
                    </div>
                    <h2 className="text-3xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-8 tracking-tighter">
                        Agendamento Sem Fricção. <br />
                        <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Conversão Máxima.</span>
                    </h2>
                    <p className="text-slate-400 text-xl font-medium leading-relaxed">
                        Inspirado nos checkouts de e-commerce mais rápidos do mundo. Seu cliente agenda e paga em menos de 30 segundos.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="bg-[#0A0A0B]/60 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-10 lg:p-16 shadow-[0_0_100px_rgba(0,0,0,0.6)] relative overflow-hidden group">

                        {/* Progress Bar */}
                        <div className="flex justify-between items-center mb-16 relative">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2" />
                            <div
                                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-blue-500 -translate-y-1/2 transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(77,114,228,0.5)]"
                                style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
                            />

                            {STEPS.map((step, idx) => {
                                const Icon = step.icon;
                                const isCompleted = idx < activeStep;
                                const isActive = idx === activeStep;

                                return (
                                    <div key={idx} className="relative z-10 flex flex-col items-center">
                                        <div
                                            onClick={() => setActiveStep(idx)}
                                            className={`w-12 lg:w-14 h-12 lg:h-14 rounded-2xl flex items-center justify-center transition-all duration-700 cursor-pointer shadow-2xl ${isCompleted ? 'bg-primary text-white scale-110 shadow-[0_0_30px_rgba(77,114,228,0.4)]' :
                                                isActive ? 'bg-primary/20 text-primary border-2 border-primary ring-8 ring-primary/5 lg:scale-125' :
                                                    'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {isCompleted ? <Check className="w-5 lg:w-7 h-5 lg:h-7 stroke-[3px]" /> : <Icon className="w-5 lg:w-6 h-5 lg:h-6" />}
                                        </div>
                                        <div className="hidden lg:block absolute top-[4.5rem] text-center w-36">
                                            <p className={`text-[10px] font-black uppercase tracking-[0.25em] transition-colors duration-500 ${isActive || isCompleted ? 'text-white' : 'text-slate-600'}`}>
                                                {step.title}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Step Card Display */}
                        <div className="grid lg:grid-cols-2 gap-16 items-center mt-24 lg:mt-40 focus-within:outline-none">
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <p className="text-primary font-black uppercase text-xs tracking-[0.4em]">Resumo do Agendamento</p>
                                    <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">{STEPS[activeStep].title}</h3>
                                </div>

                                <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 space-y-6 backdrop-blur-md shadow-inner">
                                    {STEPS.map((step, idx) => (
                                        <div key={idx} className={`flex items-center gap-6 transition-all duration-500 ${idx <= activeStep ? 'opacity-100' : 'opacity-20 translate-x-4'}`}>
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${idx === activeStep ? 'bg-primary text-white shadow-[0_0_20px_rgba(77,114,228,0.3)]' : 'bg-white/5 text-slate-400'}`}>
                                                <step.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{step.title}</p>
                                                <p className="text-lg font-bold text-white tracking-tight">{idx <= activeStep ? step.desc : 'Aguardando...'}</p>
                                            </div>
                                            {idx < activeStep && <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 border border-green-500/20"><Check className="w-3.5 h-3.5 stroke-[4px]" /></div>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative group/card">
                                <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000 shadow-[0_0_100px_#4d72e4]" />
                                
                            <LEDCardWrapper className="rounded-[3rem]">
                                <div className="relative bg-gradient-to-br from-[#121214] to-[#0A0A0B] border border-white/10 rounded-[3rem] p-10 shadow-2xl transition-all duration-700 hover:scale-[1.02] hover:border-white/20">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="w-16 h-16 bg-white/[0.05] border border-white/10 rounded-2xl flex items-center justify-center text-primary shadow-xl">
                                            <CreditCard className="w-8 h-8" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Total a Pagar</p>
                                            <p className="text-4xl font-black text-white tracking-tighter">R$ 85,00</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-6 rounded-2xl bg-white text-black text-center font-black uppercase text-xs tracking-[0.3em] shadow-[0_0_40px_rgba(255,255,255,0.2)] cursor-pointer hover:bg-slate-100 transition-all active:scale-95">
                                            Finalizar Agendamento
                                        </div>
                                        <p className="text-[10px] text-center text-slate-500 font-black uppercase tracking-widest leading-none">✨ Pagamento Seguro via Maestro Payments</p>
                                    </div>

                                    {/* Order Bump Mini */}
                                    <div className="mt-12 pt-10 border-t border-white/5">
                                        <div className="flex items-center gap-5 p-5 bg-white/[0.02] rounded-[1.5rem] border border-white/10 hover:bg-white/[0.04] transition-colors cursor-pointer group/bump">
                                            <div className="w-12 h-12 bg-primary/10 rounded-xl shadow-inner flex items-center justify-center text-primary group-hover/bump:bg-primary group-hover/bump:text-white transition-all">
                                                <ShoppingBag className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Adicionar ao Corte?</p>
                                                <p className="text-sm font-bold text-white">Pomada Efeito Seco</p>
                                            </div>
                                            <div className="text-sm font-black text-white group-hover:text-primary transition-colors">+ R$ 25</div>
                                        </div>
                                    </div>
                                </div>
                            </LEDCardWrapper>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
