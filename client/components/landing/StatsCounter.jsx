'use client';
import { useState, useEffect } from 'react';
import { Users, Calendar, Scissors, TrendingUp } from 'lucide-react';
import LEDCardWrapper from './LEDCardWrapper';

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

    return <span>{count.toLocaleString('pt-BR')}</span>;
};

export default function StatsCounter() {
    const stats = [
        { label: "Barbearias Conectadas", val: 1284, icon: Users, color: "primary" },
        { label: "Agendamentos Hoje", val: 642, icon: Calendar, color: "green" },
        { label: "Serviços Realizados", val: 18420, icon: Scissors, color: "blue" },
        { label: "Clientes Ativos", val: 89000, icon: TrendingUp, color: "orange" }
    ];

    return (
        <section className="py-20 bg-[#050505] border-y border-white/5 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 blur-[150px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center group">
                            <LEDCardWrapper className="mx-auto mb-6 w-fit">
                                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-500 shadow-xl backdrop-blur-sm">
                                    <stat.icon className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                                </div>
                            </LEDCardWrapper>
                            <h4 className="text-3xl lg:text-5xl font-black text-white tracking-tighter mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                <Counter target={stat.val} />
                                {stat.val > 1000 && "+"}
                            </h4>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.35em]">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
