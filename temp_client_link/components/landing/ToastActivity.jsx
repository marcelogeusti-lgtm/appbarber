'use client';
import { useState, useEffect } from 'react';
import { UserPlus, Star } from 'lucide-react';

const MESSAGES = [
    { text: "Lucas acabou de criar uma conta", icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50" },
    { text: "Pedro iniciou teste gratuito", icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
    { text: "Barbearia Kings acabou de se cadastrar", icon: UserPlus, color: "text-green-500", bg: "bg-green-50" },
    { text: "Marcos iniciou teste gratuito", icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
    { text: "Studio VIP acabou de se cadastrar", icon: UserPlus, color: "text-green-500", bg: "bg-green-50" },
];

export default function ToastActivity() {
    const [currentToast, setCurrentToast] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const showRandomToast = () => {
            const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
            setCurrentToast(randomMsg);
            setIsVisible(true);

            // Hide after 4 seconds
            setTimeout(() => {
                setIsVisible(false);
            }, 4000);
        };

        // Initial delay before first toast
        const initialDelay = setTimeout(showRandomToast, 3000);

        // Then repeat every 8-15 seconds
        const interval = setInterval(() => {
            showRandomToast();
        }, Math.floor(Math.random() * 7000) + 8000);

        return () => {
            clearTimeout(initialDelay);
            clearInterval(interval);
        };
    }, []);

    return (
        <div
            className={`fixed bottom-20 md:bottom-6 left-4 md:left-6 z-50 transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
                }`}
        >
            {currentToast && (
                <div className="bg-gray-50 rounded-2xl shadow-2xl p-4 pr-6 flex items-center gap-3 border border-gray-200 cursor-pointer hover:scale-105 transition-transform">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentToast.bg}`}>
                        <currentToast.icon className={`w-5 h-5 ${currentToast.color}`} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">{currentToast.text}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-0.5">Agora mesmo</p>
                    </div>
                </div>
            )}
        </div>
    );
}
