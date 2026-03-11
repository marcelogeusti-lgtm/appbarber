'use client';
import { useState, useEffect } from 'react';
import { Users, Calendar, Scissors, TrendingUp } from 'lucide-react';

const Counter = ({ target, duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [target, duration]);

    return <span>{count.toLocaleString()}</span>;
};

export default function StatsCounter() {
    const stats = [
        { label: "Barbearias Conectadas", val: 127, icon: Users, color: "primary" },
        { label: "Agendamentos Hoje", val: 842, icon: Calendar, color: "green" },
        { label: "Serviços Realizados", val: 9420, icon: Scissors, color: "blue" },
        { label: "Avaliações 5 Estrelas", val: 2431, icon: TrendingUp, color: "orange" }
    ];

    return (
        <section className="py-20 bg-gray-900 border-y border-white/5 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center group">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-500">
                                <stat.icon className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                            </div>
                            <h4 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-2">
                                <Counter target={stat.val} />
                                {stat.val > 1000 && "+"}
                            </h4>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
