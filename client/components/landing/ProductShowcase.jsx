'use client';
import { TrendingUp, Calendar, Zap, Smartphone, Check, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

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
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4">

                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Visão Geral do Seu <span className="text-primary">Império.</span>
                    </h2>
                    <p className="text-gray-500 font-medium">Cada detalhe foi pensado para facilitar sua gestão e encantar seus clientes.</p>
                </div>

                <div className="space-y-32">
                    {sections.map((section, idx) => (
                        <div key={idx} className="grid lg:grid-cols-2 gap-20 items-center">

                            {/* Substituted Screenshot for Coded Interactive Content for HIGHER CONVERSION */}
                            <div className={`relative group ${section.reverse ? 'lg:order-2' : ''}`}>
                                <div className="absolute inset-0 bg-primary/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />

                                {section.isAgenda ? (
                                    <div className="relative rounded-3xl border border-gray-100 overflow-hidden shadow-2xl bg-gray-900 group/img">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none z-10" />
                                        <img 
                                            src="/screenshots/agenda-schedule.png" 
                                            alt="Agenda Maestro NexApp" 
                                            className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                ) : section.isAnalytics ? (
                                    <div className="relative rounded-3xl border border-gray-100 overflow-hidden shadow-2xl bg-gray-900 group/img">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent pointer-events-none z-10" />
                                        <img 
                                            src="/screenshots/analytics-performance.png" 
                                            alt="Analytics Performance NexApp" 
                                            className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                ) : section.isBooking ? (
                                    <div className="relative rounded-3xl border border-gray-100 overflow-hidden shadow-2xl bg-gray-900 p-4 lg:p-8 flex justify-center group/img">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none z-10" />
                                        {/* Mobile Frame */}
                                        <div className="relative w-[280px] lg:w-[320px] aspect-[9/19] rounded-[3rem] border-8 border-gray-800 bg-gray-900 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-800 rounded-b-2xl z-20" />
                                            <img 
                                                src="/screenshots/online-booking-mobile.png" 
                                                alt="Agendamento Online Mobile" 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative rounded-3xl border border-gray-100 overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]">
                                        <img
                                            src={section.img}
                                            alt={section.title}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Text Side */}
                            <div className={section.reverse ? 'lg:order-1' : ''}>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                                    <Zap className="w-3 h-3 fill-current" />
                                    <span>Funcionalidade Pro</span>
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 tracking-tight">{section.title}</h3>
                                <p className="text-gray-500 text-lg mb-10 font-medium leading-relaxed">
                                    {section.isAgenda ? "Nunca mais perca horários vazios. O NEXT organiza sua agenda automaticamente." : section.desc}
                                </p>

                                <ul className="space-y-4 mb-10">
                                    {section.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-3 text-sm font-black text-gray-700 uppercase tracking-tight">
                                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Check className="w-3 h-3 stroke-[4px]" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {section.isAgenda && (
                                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 mb-10">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="flex -space-x-2">
                                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=32&h=32" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                                                <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=32&h=32" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                                                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=32&h=32" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />)}
                                                </div>
                                                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mt-0.5">Nota 4.9/5 · 234 Avaliações</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Link href="/register">
                                    <button className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:gap-4 transition-all">
                                        Explorar Recurso <ArrowRight className="w-4 h-4" />
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
