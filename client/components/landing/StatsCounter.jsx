'use client';
import { useState, useEffect, useRef } from 'react';
import { Users, Calendar, Scissors, TrendingUp } from 'lucide-react';
import LEDCardWrapper from './LEDCardWrapper';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from '../../contexts/LanguageContext';

const Counter = ({ target, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;

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
    }, [target, duration, inView]);

    return <span ref={ref}>{Math.floor(count)}</span>;
};

export default function StatsCounter() {
    const { t } = useTranslation();
    const stats = [
        { label: t('group1.stat1_label'), val: 1284, icon: Users, color: "from-blue-500/20 to-transparent" },
        { label: t('group1.stat2_label'), val: 642, icon: Calendar, color: "from-emerald-500/20 to-transparent" },
        { label: t('group1.stat3_label'), val: 18420, icon: Scissors, color: "from-primary/20 to-transparent" },
        { label: t('group1.stat4_label'), val: 89000, icon: TrendingUp, color: "from-orange-500/20 to-transparent" }
    ];

    return (
        <section className="py-24 bg-[#050505] border-y border-white/[0.06] relative overflow-hidden">
            {/* Background Grain */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="text-center group"
                        >
                            <div className="relative inline-block mb-8">
                                <LEDCardWrapper className="mx-auto w-fit">
                                    <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-700 shadow-xl backdrop-blur-md group-hover:text-white text-slate-400 group-hover:scale-110">
                                        <stat.icon className="w-7 h-7 transition-transform duration-500 group-hover:rotate-12" />
                                    </div>
                                </LEDCardWrapper>
                                {/* Subtle ring ripple */}
                                <div className="absolute inset-0 rounded-2xl border border-primary/0 group-hover:animate-ripple pointer-events-none" />
                            </div>

                            <h4 className="font-display text-3xl lg:text-5xl font-extrabold text-white tracking-[-0.03em] mb-3 tabular-nums">
                                <Counter target={stat.val} />
                                {stat.val > 1000 && "+"}
                            </h4>
                            <p className="font-body text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
