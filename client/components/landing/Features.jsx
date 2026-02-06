'use client';
import { Calendar, CreditCard, Users, BarChart3, Scissors, Bell, Globe, Shield } from 'lucide-react';

const features = [
    {
        icon: Calendar,
        title: "Agendamento Inteligente",
        description: "Sistema de agenda drag-and-drop com confirmações automáticas via WhatsApp."
    },
    {
        icon: CreditCard,
        title: "Gestão Financeira",
        description: "Controle de caixa, comissões automáticas e relatórios de faturamento em tempo real."
    },
    {
        icon: Users,
        title: "CRM de Clientes",
        description: "Histórico completo de cortes, preferências e ciclo de vida do cliente."
    },
    {
        icon: Globe,
        title: "Site Próprio",
        description: "Seu link personalizado para agendamentos online 24/7 sem taxas extras."
    },
    {
        icon: Bell,
        title: "Lembretes Automáticos",
        description: "Reduza o no-show com lembretes automáticos de agendamento para seus clientes."
    },
    {
        icon: BarChart3,
        title: "Relatórios Avançados",
        description: "Métricas de crescimento, retenção e desempenho da equipe."
    }
];

export default function Features() {
    return (
        <section id="features" className="py-24 bg-black relative">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#050505] to-black z-10" />

            <div className="container mx-auto px-4 relative z-20">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Funcionalidades</h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Tudo que sua barbearia precisa.</h3>
                    <p className="text-gray-400 text-lg">
                        Elimine planilhas e agendas de papel. Centralize toda a operação em um único sistema.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="group p-8 rounded-3xl bg-[#09090b] border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,230,118,0.1)] hover:-translate-y-1">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-black transition-all duration-300 text-primary">
                                <f.icon className="w-7 h-7" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3">{f.title}</h4>
                            <p className="text-gray-400 leading-relaxed">
                                {f.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
