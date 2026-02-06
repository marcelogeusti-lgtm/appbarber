'use client';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-black relative overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Planos e Preços</h2>
                    <h3 className="text-4xl font-bold text-white mb-6">Investimento que se paga.</h3>
                    <p className="text-gray-400 text-lg">
                        Escolha o plano ideal para o tamanho do seu negócio. Cancele quando quiser.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">

                    {/* Starter */}
                    <div className="p-8 rounded-3xl bg-[#09090b] border border-white/5 text-gray-400">
                        <h4 className="text-xl font-bold text-white mb-2">Autônomo</h4>
                        <p className="text-sm mb-6">Para quem trabalha sozinho.</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-4xl font-bold text-white">R$ 49</span>
                            <span className="text-sm">/mês</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {['1 Profissional', 'Agenda Online', 'Link de Agendamento', 'Lembretes WhatsApp', 'Relatórios Básicos'].map(i => (
                                <li key={i} className="flex items-center gap-3 text-sm">
                                    <Check className="w-5 h-5 text-gray-500" /> {i}
                                </li>
                            ))}
                        </ul>
                        <Link href="/register">
                            <button className="w-full py-3 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-colors">
                                Começar Agora
                            </button>
                        </Link>
                    </div>

                    {/* PRO (Featured) */}
                    <div className="p-8 rounded-3xl bg-[#0F1115] border border-primary/50 relative shadow-[0_0_50px_rgba(0,230,118,0.1)] scale-105">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            Mais Popular
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">Profissional</h4>
                        <p className="text-sm text-gray-400 mb-6">Para barbearias em crescimento.</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-bold text-white">R$ 89</span>
                            <span className="text-sm text-gray-400">/mês</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {['Até 3 Profissionais', 'Gestão Financeira Completa', 'Comissões Automáticas', 'Site Personalizado', 'Suporte Prioritário', 'Tudo do plano Autônomo'].map(i => (
                                <li key={i} className="flex items-center gap-3 text-sm text-white">
                                    <Check className="w-5 h-5 text-primary" /> {i}
                                </li>
                            ))}
                        </ul>
                        <Link href="/register">
                            <button className="w-full py-4 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)]">
                                Testar Grátis
                            </button>
                        </Link>
                    </div>

                    {/* Enterprise */}
                    <div className="p-8 rounded-3xl bg-[#09090b] border border-white/5 text-gray-400">
                        <h4 className="text-xl font-bold text-white mb-2">Empire</h4>
                        <p className="text-sm mb-6">Para redes e franquias.</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-4xl font-bold text-white">R$ 149</span>
                            <span className="text-sm">/mês</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {['Profissionais Ilimitados', 'Múltiplas Unidades', 'API de Integração', 'Gerente de Conta', 'Tudo do plano Pro'].map(i => (
                                <li key={i} className="flex items-center gap-3 text-sm">
                                    <Check className="w-5 h-5 text-gray-500" /> {i}
                                </li>
                            ))}
                        </ul>
                        <Link href="/register">
                            <button className="w-full py-3 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-colors">
                                Falar com Vendas
                            </button>
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
