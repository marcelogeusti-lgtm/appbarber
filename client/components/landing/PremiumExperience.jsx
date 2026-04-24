'use client';
import { Zap, Smartphone, Heart, QrCode, MousePointer2, UserCheck } from 'lucide-react';
import LEDCardWrapper from './LEDCardWrapper';

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
        <section className="py-24 bg-[#050505] relative overflow-hidden">
            {/* Background elements to match the "Premium" feel */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto mb-20 px-4 md:px-0 text-center md:text-left">
                    <h2 className="text-3xl lg:text-6xl font-black text-white mb-8 tracking-tighter uppercase leading-[1.1] italic">
                        A EXPERIÊNCIA <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent not-italic">PREMIUM</span> <br /> 
                        DE AGENDAMENTO.
                    </h2>
                    <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-3xl">
                        O NEXT foi desenhado para eliminar fricção. Seu cliente não precisa de apps pesados ou cadastros complexos.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {cards.map((card, idx) => (
                        <LEDCardWrapper key={idx} className="h-full">
                            <div className="group relative h-full">
                                {/* Card Background with subtle glow */}
                                <div className={`p-10 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl transition-all duration-700 hover:border-primary/40 hover:bg-white/[0.05] flex flex-col h-full relative overflow-hidden shadow-2xl`}>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
                                    
                                    <div className="relative z-10">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/[0.05] border border-white/10 flex items-center justify-center text-primary mb-10 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-xl">
                                            <card.icon className="w-8 h-8" />
                                        </div>

                                        <div className="space-y-4">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] opacity-80">{card.category}</span>
                                            <h4 className="text-2xl font-black text-white tracking-tight leading-snug">
                                                {card.title}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </LEDCardWrapper>
                    ))}
                </div>
            </div>
        </section>
    );
}
