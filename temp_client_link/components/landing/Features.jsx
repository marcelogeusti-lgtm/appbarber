'use client';
import {
    Users,
    Calendar,
    TrendingUp,
    Zap,
    Smartphone,
    ShieldCheck,
    MessageSquare,
    DollarSign,
    Heart
} from 'lucide-react';

const features = [
    {
        icon: Calendar,
        title: "Agenda Inteligente",
        desc: "Gestão completa de horários com notificações automáticas via WhatsApp."
    },
    {
        icon: TrendingUp,
        title: "Financeiro Pro",
        desc: "Controle de fluxo de caixa, comissões de barbeiros e relatórios de lucro."
    },
    {
        icon: MessageSquare,
        title: "WhatsApp Bot",
        desc: "Agendamento automático 24h por dia sem precisar baixar apps."
    },
    {
        icon: Heart,
        title: "Fidelização de Elite",
        desc: "Sistema de pontos e promoções para manter sua cadeira sempre cheia."
    },
    {
        icon: Users,
        title: "Gestão de Equipe",
        desc: "Controle de permissões e performance individual de cada profissional."
    },
    {
        icon: Smartphone,
        title: "Site Próprio",
        desc: "Página de agendamento personalizada com a cara da sua barbearia."
    }
];

export default function Features() {
    return (
        <section className="py-24 bg-white" id="features">
            <div className="container mx-auto px-4">

                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Tudo que você precisa <br />
                        <span className="text-primary">em um só lugar.</span>
                    </h2>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed">
                        Esqueça as planilhas e o caderno. O NEXT consolida cada aspecto do seu negócio em uma interface limpa e intuitiva.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all mb-8 shadow-sm border border-gray-100">
                                <feature.icon className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tighter">{feature.title}</h4>
                            <p className="text-gray-500 text-sm leading-relaxed font-semibold opacity-80">{feature.desc}</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
