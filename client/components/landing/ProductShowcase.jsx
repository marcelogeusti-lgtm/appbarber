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
            title: "O Site da Sua Barbearia",
            desc: "Uma vitrine digital profissional que funciona 24h por dia. Seu cliente escolhe o serviço, o barbeiro e o horário sem precisar te ligar.",
            isBooking: true,
            features: ["Agendamento Online 24/7", "Totalmente Responsivo", "Link Personalizado"],
            reverse: true
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
                                    <div className="relative rounded-3xl border border-gray-100 overflow-hidden shadow-2xl bg-gray-50 p-6 transition-transform duration-700 group-hover:scale-[1.01]">
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                                            <h4 className="font-black text-gray-900 text-sm tracking-tight uppercase">Agenda de Hoje</h4>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 rounded-full">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                <span className="text-[10px] font-black text-green-600 uppercase">Agenda Cheia</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { t: '09:00', n: 'João Silva', s: 'Corte', a: 'Marcelo' },
                                                { t: '09:30', n: 'Rafael Costa', s: 'Corte + Barba', a: 'Marcelo' },
                                                { t: '10:00', n: 'Pedro Rocha', s: 'Barba', a: 'Betinho' },
                                                { t: '10:30', n: 'Lucas Lima', s: 'Corte', a: 'Marcelo' },
                                                { t: '11:00', n: 'Carlos Souza', s: 'Pigmentação', a: 'Betinho' }
                                            ].map((slot, i) => (
                                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                    <span className="text-xs font-black text-primary w-10">{slot.t}</span>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-gray-900 leading-none mb-1">{slot.n}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{slot.s}</p>
                                                    </div>
                                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{slot.a}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : section.isBooking ? (
                                    <div className="relative rounded-3xl border border-gray-100 overflow-hidden shadow-2xl bg-[#fafafa] p-6 transition-transform duration-700 group-hover:scale-[1.01]">
                                        <div className="w-full bg-white rounded-2xl shadow-sm p-4 mb-4 border border-gray-100">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                                                    <Smartphone className="w-5 h-5" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-black text-gray-900">Next Barber Shop</p>
                                                    <p className="text-[9px] text-gray-400 font-medium">Auto-agendamento Online</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="h-8 w-full bg-gray-50 rounded-lg border border-gray-100 flex items-center px-3 text-[10px] text-gray-400">Escolha o Profissional</div>
                                                <div className="h-8 w-full bg-gray-50 rounded-lg border border-gray-100 flex items-center px-3 text-[10px] text-gray-400">Escolha o Serviço</div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                                        <div key={i} className={`h-8 rounded-lg border flex items-center justify-center text-[10px] font-bold ${i === 3 ? 'bg-primary border-primary text-white' : 'bg-white border-gray-100 text-gray-400'}`}>
                                                            09:{i}0
                                                        </div>
                                                    ))}
                                                </div>
                                                <button className="w-full h-10 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest mt-2 shadow-lg shadow-primary/20">Confirmar Horário</button>
                                            </div>
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
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                                                ))}
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
