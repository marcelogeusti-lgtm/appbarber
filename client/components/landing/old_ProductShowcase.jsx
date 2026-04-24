'use client';
import { TrendingUp, Calendar, Zap, Smartphone, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProductShowcase() {
    const sections = [
        {
            title: "Agenda Maestro: Controle Total",
            desc: "Visualize toda a sua opera├º├úo em segundos. Arraste e solte agendamentos, gerencie profissionais e elimine o papel definitivamente.",
            img: "/screenshots/dashboard_agenda_1772068437988.png",
            features: ["Vis├úo Di├íria/Semanal Pro", "Bloqueio de Horas Inteligente", "Sincroniza├º├úo Cloud"]
        },
        {
            title: "O Site da Sua Barbearia",
            desc: "Uma vitrine digital profissional que funciona 24h por dia. Seu cliente escolhe o servi├ºo, o barbeiro e o hor├írio sem precisar te ligar.",
            img: "/screenshots/public_booking_page_1772068485163.png",
            features: ["Agendamento Online 24/7", "Totalmente Responsivo", "Link Personalizado"],
            reverse: true
        }
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4">

                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tighter italic uppercase">
                        Vis├úo Geral do Seu <span className="text-primary italic">Imp├®rio.</span>
                    </h2>
                    <p className="text-gray-500 font-medium">Cada detalhe foi pensado para facilitar sua gest├úo e encantar seus clientes.</p>
                </div>

                <div className="space-y-32">
                    {sections.map((section, idx) => (
                        <div key={idx} className="grid lg:grid-cols-2 gap-20 items-center">

                            {/* Image Side */}
                            <div className={`relative group ${section.reverse ? 'lg:order-2' : ''}`}>
                                <div className="absolute inset-0 bg-primary/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative rounded-xl border border-gray-100 overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]">
                                    <img
                                        src={section.img}
                                        alt={section.title}
                                        className="w-full h-auto"
                                    />
                                </div>
                            </div>

                            {/* Text Side */}
                            <div className={section.reverse ? 'lg:order-1' : ''}>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                                    <Zap className="w-3 h-3 fill-current" />
                                    <span>Funcionalidade Pro</span>
                                </div>
                                <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6 tracking-tighter italic uppercase">{section.title}</h3>
                                <p className="text-gray-500 text-lg mb-10 font-medium leading-relaxed">{section.desc}</p>

                                <ul className="space-y-4 mb-10">
                                    {section.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-3 text-sm font-black text-gray-700 uppercase tracking-tight italic">
                                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Check className="w-3 h-3 stroke-[4px]" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/register">
                                    <button className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:gap-4 transition-all italic">
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
