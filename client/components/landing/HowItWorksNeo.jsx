'use client';
import { UserPlus, Settings, Scissors } from 'lucide-react';

const steps = [
    { title: 'Cadastre-se', desc: 'Crie sua conta em 30 segundos.', icon: UserPlus, color: '#b7c6c2' },
    { title: 'Configure', desc: 'Adicione seus serviços e profissionais.', icon: Settings, color: '#ffe17c' },
    { title: 'Deixe fluir', desc: 'Receba agendamentos e fature mais.', icon: Scissors, color: '#ffffff' },
];

export default function HowItWorksNeo() {
    return (
        <section id="como-funciona" className="py-24 bg-[#171e19] text-white overflow-hidden px-6">
            <div className="container mx-auto">
                <h2 className="font-cabinet font-extrabold text-5xl lg:text-7xl mb-16 text-center uppercase tracking-tighter">
                    Tão simples <br /> quanto um <span className="text-[#3b82f6]">CORTE</span>.
                </h2>

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-12">
                    {/* Connecting Line (Desktop) */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-[#272727] hidden md:block -translate-y-12" />

                    {steps.map((s, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center text-center max-w-xs transition-transform duration-300 hover:scale-105">
                            <div
                                className="w-24 h-24 rounded-full border-4 flex items-center justify-center mb-8 bg-[#171e19] neo-shadow-sm"
                                style={{ borderColor: s.color, boxShadow: `0px 0px 20px -5px ${s.color}` }}
                            >
                                <s.icon className="w-10 h-10" style={{ color: s.color }} />
                            </div>
                            <div className="bg-black/40 p-6 neo-border neo-shadow-sm">
                                <h3 className="font-cabinet font-extrabold text-2xl mb-2 uppercase">{s.title}</h3>
                                <p className="font-satoshi text-gray-400 font-medium">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
