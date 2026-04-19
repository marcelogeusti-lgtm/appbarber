'use client';
import { TrendingUp, Calendar, Zap, Smartphone, Check, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import LEDCardWrapper from './LEDCardWrapper';

export default function ProductShowcase() {
    const sections = [
        {
            title: "Agenda Maestro: Controle Total",
            desc: "Visualize toda a sua operação em segundos. Arraste e solte agendamentos, gerencie profissionais e elimine o papel definitivamente.",
            isAgenda: true,
            features: ["Visão Diária/Semanal Pro", "Bloqueio de Horas Inteligente", "Sincronização Cloud"]
        },
        {
            title: "As métricas que importam",
            desc: "Decisões baseadas em dados, não em palpites. Acompanhe seu ticket médio, taxa de retenção e faturamento bruto com gráficos intuitivos.",
            isAnalytics: true,
            features: ["Relatórios de Faturamento", "Ranking de Profissionais", "Previsão de Receita"],
            reverse: true
        },
        {
            title: "O Site da Sua Barbearia",
            desc: "Uma vitrine digital profissional que funciona 24h por dia. Seu cliente escolhe o serviço, o barbeiro e o horário sem precisar te ligar.",
            isBooking: true,
            features: ["Agendamento Online 24/7", "Totalmente Responsivo", "Link Personalizado"]
        }
    ];

    return (
        <section className="py-24 bg-[#050505] relative overflow-hidden">
            <div className="container mx-auto px-4">

                <div className="text-center max-w-4xl mx-auto mb-20">
                    <h2 className="text-3xl lg:text-6xl font-extrabold text-white mb-8 tracking-tighter">
                        Visão Geral do Seu <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Império.</span>
                    </h2>
                    <p className="text-slate-400 text-xl font-medium leading-relaxed">Cada detalhe foi pensado para facilitar sua gestão e encantar seus clientes.</p>
                </div>

                <div className="space-y-32">
                    {sections.map((section, idx) => (
                        <div key={idx} className="grid lg:grid-cols-2 gap-20 items-center">

                            {/* Substituted Screenshot for Coded Interactive Content for HIGHER CONVERSION */}
                            <div className={`relative group ${section.reverse ? 'lg:order-2' : ''}`}>
                                <LEDCardWrapper className="h-full">
                                    {section.isAgenda ? (
                                        <div className="relative rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] bg-[#0A0A0B]/60 backdrop-blur-3xl group/img p-4 lg:p-6 h-full">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none z-10" />
                                            <img 
                                                src="/screenshots/agenda-schedule.png" 
                                                alt="Agenda Maestro" 
                                                className="w-full h-auto rounded-2xl transition-transform duration-1000 group-hover:scale-105"
                                            />
                                        </div>
                                    ) : section.isAnalytics ? (
                                        <div className="relative rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] bg-[#0A0A0B]/60 backdrop-blur-3xl group/img p-4 lg:p-6 h-full">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent pointer-events-none z-10" />
                                            <img 
                                                src="/screenshots/analytics-performance.png" 
                                                alt="Analytics Performance" 
                                                className="w-full h-auto rounded-2xl transition-transform duration-1000 group-hover:scale-105"
                                            />
                                        </div>
                                    ) : section.isBooking ? (
                                        <div className="relative rounded-3xl border border-gray-100 overflow-hidden shadow-2xl bg-gray-900 p-4 lg:p-8 flex justify-center group/img h-full">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none z-10" />
                                            {/* Mobile Frame */}
                                            <div className="relative w-[280px] lg:w-[320px] aspect-[9/19] rounded-[3rem] border-8 border-gray-800 bg-gray-900 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-800 rounded-b-2xl z-20" />
                                                <img 
                                                    src="/screenshots/online-booking-mobile.png" 
                                                    alt="Agendamento Online Mobile" 
                                                    className="w-full h-full object-contain object-top transition-transform duration-700 group-hover:scale-110"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative rounded-3xl border border-gray-100 overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.01] h-full">
                                            <img
                                                src={section.img}
                                                alt={section.title}
                                                className="w-full h-auto"
                                            />
                                        </div>
                                    )}
                                </LEDCardWrapper>
                            </div>

                            {/* Text Side */}
                            <div className={section.reverse ? 'lg:order-1' : ''}>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                                    <Zap className="w-3.5 h-3.5 fill-primary text-primary" />
                                    <span>Funcionalidade Pro</span>
                                </div>
                                <h3 className="text-3xl lg:text-4xl font-black text-white mb-6 tracking-tighter">{section.title}</h3>
                                <p className="text-slate-400 text-xl mb-10 font-medium leading-relaxed">
                                    {section.isAgenda ? "Nunca mais perca horários vazios. O NEXT organiza sua agenda automaticamente." : section.desc}
                                </p>

                                <ul className="space-y-6 mb-12">
                                    {section.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-4 text-[11px] font-black text-slate-300 uppercase tracking-widest leading-none">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(77,114,228,0.2)]">
                                                <Check className="w-3.5 h-3.5 stroke-[4px]" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {section.isAgenda && (
                                    <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 mb-12 backdrop-blur-md">
                                        <div className="flex items-center gap-5">
                                            <div className="flex -space-x-3">
                                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=32&h=32" alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#050505] bg-[#0A0A0B]" />
                                                <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=32&h=32" alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#050505] bg-[#0A0A0B]" />
                                                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=32&h=32" alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#050505] bg-[#0A0A0B]" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" />)}
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 leading-none">Aprovado por +2k Profissionais</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Link href="/register">
                                    <button className="flex items-center gap-3 text-xs font-black text-white uppercase tracking-[0.25em] group/btn transition-all">
                                        Explorar Recurso <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-black transition-all">
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </div>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
