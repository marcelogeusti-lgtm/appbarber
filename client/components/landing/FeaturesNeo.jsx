'use client';
import { Scissors, Calendar, Users, Zap, TrendingUp, Shield } from 'lucide-react';

const features = [
    { title: 'Agendamento Pro', desc: 'Interface intuitiva para clientes agendarem em segundos.', icon: Calendar },
    { title: 'Gestão Completa', desc: 'Controle de profissionais, serviços e horários.', icon: Scissors },
    { title: 'Marketing Inteligente', desc: 'Campanhas automatizadas para atrair novos clientes.', icon: Zap },
    { title: 'Financeiro Real-time', desc: 'Relatórios detalhados de faturamento e comissões.', icon: TrendingUp },
    { title: 'Fidelização', desc: 'Sistema de pontos e cashback integrado.', icon: Users },
    { title: 'Segurança Total', desc: 'Seus dados protegidos com criptografia de ponta.', icon: Shield },
];

export default function FeaturesNeo() {
    return (
        <section id="recursos" className="py-24 bg-[#ffe17c] border-y-2 border-black">
            <div className="container mx-auto px-6">
                <h2 className="font-cabinet font-extrabold text-5xl lg:text-7xl mb-16 text-center uppercase tracking-tighter">
                    Tudo que você <br /> precisa para <span className="text-[#3b82f6]">BRILHAR</span>.
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white neo-border neo-shadow-sm p-8 group hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-16 h-16 bg-[#b7c6c2] group-hover:bg-[#ffe17c] neo-border flex items-center justify-center mb-6 transition-colors">
                                <f.icon className="w-8 h-8 text-black" />
                            </div>
                            <h3 className="font-cabinet font-extrabold text-2xl mb-4 uppercase">{f.title}</h3>
                            <p className="font-satoshi font-medium text-gray-700">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
