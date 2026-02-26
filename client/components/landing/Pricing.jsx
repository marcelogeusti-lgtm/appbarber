'use client';
import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
    return (
        <section className="py-24 bg-white" id="pricing">
            <div className="container mx-auto px-4">

                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tighter uppercase italic">
                        Escolha seu Nível de <br />
                        <span className="text-primary italic">Dominação.</span>
                    </h2>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed">
                        Comece pequeno, escale como um império. O NEXT se adapta ao seu momento.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">

                    {/* Autônomo */}
                    <div className="p-10 rounded-3xl bg-white border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col hover:border-primary/20 transition-all duration-300">
                        <h4 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight italic">Autônomo</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-8 text-gray-400">Para unidades individuais.</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-black text-gray-900 italic">R$ 49</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">/ mensal</span>
                        </div>
                        <ul className="space-y-5 mb-10 flex-1">
                            {['1 Profissional Master', 'Acesso à Agenda Maestro', 'Link de Agendamento Pro', 'WhatsApp Lembretes'].map(i => (
                                <li key={i} className="flex items-center gap-4 text-xs font-semibold text-gray-600 uppercase tracking-tight italic">
                                    <Check className="w-4 h-4 text-primary flex-shrink-0" /> {i}
                                </li>
                            ))}
                        </ul>
                        <Link href="/register">
                            <button className="w-full py-5 rounded-2xl border border-gray-200 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all text-gray-900 italic">
                                Ativar Plano
                            </button>
                        </Link>
                    </div>

                    {/* Diamond Pro */}
                    <div className="p-10 rounded-3xl bg-white border-2 border-primary shadow-[0_20px_60px_rgba(77,114,228,0.1)] flex flex-col relative scale-[1.03] z-10">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary rounded-full text-[10px] font-black text-white uppercase tracking-widest">Recomendado</div>
                        <h4 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight italic">Diamond Pro</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-8 text-primary">Crescimento acelerado.</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-black text-gray-900 italic">R$ 89,70</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">/ mensal</span>
                        </div>
                        <ul className="space-y-5 mb-10 flex-1">
                            {['Até 5 Profissionais', 'Dashboard de Elite', 'Fidelização Completa', 'Financeiro Avançado', 'Estoque & Produtos'].map(i => (
                                <li key={i} className="flex items-center gap-4 text-xs font-black text-gray-900 uppercase tracking-tight italic">
                                    <Check className="w-4 h-4 text-primary flex-shrink-0" /> {i}
                                </li>
                            ))}
                        </ul>
                        <Link href="/register">
                            <button className="w-full py-5 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 italic flex items-center justify-center gap-2">
                                Experimentar Grátis <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>

                    {/* Empire */}
                    <div className="p-10 rounded-3xl bg-white border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col hover:border-primary/20 transition-all duration-300">
                        <h4 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight italic">Empire</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-8 text-gray-400">Escala sem limites.</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-black text-gray-900 italic">R$ 159,70</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">/ mensal</span>
                        </div>
                        <ul className="space-y-5 mb-10 flex-1">
                            {['Ilimitados Profissionais', 'Multi-unidades', 'Suporte VIP 24h', 'Assunção de Custos MP', 'Exportação Full de Dados'].map(i => (
                                <li key={i} className="flex items-center gap-4 text-xs font-semibold text-gray-600 uppercase tracking-tight italic">
                                    <Check className="w-4 h-4 text-primary flex-shrink-0" /> {i}
                                </li>
                            ))}
                        </ul>
                        <Link href="/register">
                            <button className="w-full py-5 rounded-2xl border border-gray-200 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all text-gray-900 italic">
                                Ativar Plano
                            </button>
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
