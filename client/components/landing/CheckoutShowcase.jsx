'use client';
import { Check, ArrowRight, User, Scissors, Calendar, CreditCard } from 'lucide-react';
import { useState } from 'react';

const STEPS = [
    { title: 'Serviço', icon: Scissors, desc: 'Corte + Barba' },
    { title: 'Profissional', icon: User, desc: 'Marcelo Maestro' },
    { title: 'Data/Hora', icon: Calendar, desc: 'Hoje, 15:00' },
    { title: 'Confirmação', icon: CreditCard, desc: 'Pagamento Seguro' }
];

export default function CheckoutShowcase() {
    const [activeStep, setActiveStep] = useState(2);

    return (
        <section className="py-24 bg-gray-900 overflow-hidden relative">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Experiência de Elite</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-6 tracking-tight">
                        Agendamento Sem Fricção. <br />
                        <span className="text-primary">Conversão Máxima.</span>
                    </h2>
                    <p className="text-gray-400 text-lg font-medium leading-relaxed">
                        Inspirado nos checkouts de e-commerce mais rápidos do mundo. Seu cliente agenda e paga em menos de 30 segundos.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden group">

                        {/* Progress Bar */}
                        <div className="flex justify-between items-center mb-12 relative">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2" />
                            <div
                                className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-700 ease-in-out"
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
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 cursor-pointer ${isCompleted ? 'bg-primary text-white scale-110' :
                                                isActive ? 'bg-primary/20 text-primary border-2 border-primary ring-4 ring-primary/10 lg:scale-125' :
                                                    'bg-white/10 text-gray-500 hover:bg-white/20'
                                                }`}
                                        >
                                            {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                        </div>
                                        <div className="hidden lg:block absolute top-14 text-center w-32">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`}>
                                                {step.title}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Step Card Display */}
                        <div className="grid lg:grid-cols-2 gap-12 items-center mt-20 lg:mt-32">
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <p className="text-primary font-black uppercase text-xs tracking-widest">Resumo do Checkout</p>
                                    <h3 className="text-2xl font-bold text-white">{STEPS[activeStep].title}</h3>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                                    {STEPS.map((step, idx) => (
                                        <div key={idx} className={`flex items-center gap-4 transition-opacity duration-300 ${idx <= activeStep ? 'opacity-100' : 'opacity-20'}`}>
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                                                <step.icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{step.title}</p>
                                                <p className="text-sm font-black text-white">{idx <= activeStep ? step.desc : '...'}</p>
                                            </div>
                                            {idx < activeStep && <Check className="w-4 h-4 text-green-500" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                                <div className="relative bg-white rounded-[2rem] p-8 shadow-2xl transition-transform duration-500">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                                            <CreditCard className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-400">Total à pagar</p>
                                            <p className="text-2xl font-black text-gray-900">R$ 85,00</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-primary text-white text-center font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/30 cursor-pointer hover:scale-[1.02] transition-transform">
                                            Finalizar Agendamento
                                        </div>
                                        <p className="text-[10px] text-center text-gray-400 font-medium">✨ Pagamento 100% Seguro via Maestro Payments</p>
                                    </div>

                                    {/* Order Bump Mini */}
                                    <div className="mt-8 pt-8 border-t border-gray-100">
                                        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl border border-primary/10">
                                            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-primary">
                                                <ShoppingBag className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[9px] font-black text-primary uppercase">Adicionar ao Corte?</p>
                                                <p className="text-[11px] font-bold text-gray-900">Pomada Efeito Seco</p>
                                            </div>
                                            <div className="text-[10px] font-black text-gray-900">+ R$ 25</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}

import { ShoppingBag } from 'lucide-react';
