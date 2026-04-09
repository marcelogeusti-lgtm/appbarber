'use client';
import { Zap, Smartphone, Heart, QrCode, MousePointer2, UserCheck } from 'lucide-react';

export default function PremiumExperience() {
    const cards = [
        {
            icon: QrCode,
            category: "SIMPLICIDADE",
            title: "Acesso via QR Code ou Link",
            gradient: "from-blue-500/10 to-transparent"
        },
        {
            icon: MousePointer2,
            category: "AGILIDADE",
            title: "Agendamento em 3 toques",
            gradient: "from-indigo-500/10 to-transparent"
        },
        {
            icon: UserCheck,
            category: "RETENÇÃO",
            title: "Fidelização automática",
            gradient: "from-primary/10 to-transparent"
        }
    ];

    return (
        <section className="py-20 bg-[#09090b] relative overflow-hidden">
            {/* Background elements to match the "Premium" feel */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto mb-16 px-4 md:px-0">
                    <h2 className="text-3xl lg:text-5xl font-black text-white mb-6 tracking-tighter uppercase leading-tight italic">
                        A EXPERIÊNCIA <span className="text-primary not-italic">PREMIUM</span> <br /> 
                        DE AGENDAMENTO.
                    </h2>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                        O NEXT foi desenhado para eliminar fricção. Seu cliente não precisa de apps pesados ou cadastros complexos.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {cards.map((card, idx) => (
                        <div key={idx} className="group relative">
                            {/* Card Background with subtle glow */}
                            <div className={`p-8 rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:bg-white/10 flex flex-col h-full relative overflow-hidden`}>
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                                
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                        <card.icon className="w-6 h-6" />
                                    </div>

                                    <div className="space-y-4">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] opacity-80">{card.category}</span>
                                        <h4 className="text-xl font-bold text-white tracking-tight leading-snug">
                                            {card.title}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
