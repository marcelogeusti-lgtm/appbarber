'use client';
import { useState, useEffect } from 'react';

const MESSAGES = [
    "Felipe entrou na plataforma",
    "Lucas está explorando o sistema",
    "Rafael iniciou teste grátis",
    "Gabriel criou uma conta"
];

export default function SideSocialProof() {
    const [notif, setNotif] = useState(null);

    useEffect(() => {
        const showRandom = () => {
            const side = Math.random() > 0.5 ? 'left' : 'right';
            const text = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

            setNotif({ text, side });

            setTimeout(() => {
                setNotif(null);
            }, 5000);
        };

        const interval = setInterval(showRandom, 15000);
        const initial = setTimeout(showRandom, 5000);

        return () => {
            clearInterval(interval);
            clearTimeout(initial);
        };
    }, []);

    if (!notif) return null;

    return (
        <div
            className={`
                fixed bottom-10 z-[100] hidden lg:flex
                px-4 py-2 bg-white/80 backdrop-blur-md border border-gray-100 rounded-full shadow-lg
                items-center gap-2 transform transition-all duration-700
                ${notif.side === 'left' ? 'left-6 animate-slide-right' : 'right-6 animate-slide-left'}
            `}
        >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {notif.text}
            </span>

            <style jsx>{`
                @keyframes slide-right {
                    from { transform: translateX(-40px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slide-left {
                    from { transform: translateX(40px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-right { animation: slide-right 0.7s ease-out forwards; }
                .animate-slide-left { animation: slide-left 0.7s ease-out forwards; }
            `}</style>
        </div>
    );
}
