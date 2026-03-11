'use client';
import { useState, useEffect } from 'react';

const SERVICES = [
    "João – Corte Degradê agendado agora",
    "Lucas – Corte Clássico agendado há 2 minutos",
    "Rafael – Barba completa agendada",
    "Mateus – Low Fade agendado há 5 minutos",
    "Carlos – Mid Fade agendado agora",
    "Felipe – Executivo agendado há 1 minuto",
    "André – Skin Fade agendado agora",
    "Pedro – Corte Social agendado há 3 minutos"
];

export default function RollingNotificationFeed() {
    const [notifications, setNotifications] = useState([
        { id: 'initial-1', text: SERVICES[0] },
        { id: 'initial-2', text: SERVICES[1] },
        { id: 'initial-3', text: SERVICES[2] }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            const nextText = SERVICES[Math.floor(Math.random() * SERVICES.length)];
            const nextNotif = { id: Date.now().toString(), text: nextText };

            // Keep 4 items briefly so the 4th can animate out, then it's removed on next tick
            setNotifications(prev => [nextNotif, ...prev].slice(0, 4));
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col gap-2 relative h-[180px] overflow-hidden px-2 pt-2">
            <div className="flex flex-col w-[240px]">
                {notifications.map((notif, index) => (
                    <div
                        key={notif.id}
                        className={`
                            p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm
                            flex items-center gap-3 w-full
                            ${index === 0 ? 'animate-slide-in-push' : 'transition-all duration-500 ease-out'}
                            ${index === 3 ? 'animate-fade-out-bottom absolute w-full' : 'relative opacity-100'}
                        `}
                        style={{
                            // For the 4th item, position it exactly where it would be to slide down and out
                            top: index === 3 ? '150px' : 'auto',
                            marginBottom: index < 3 ? '8px' : '0'
                        }}
                    >
                        <img
                            src="/logos/logo_icon.png"
                            alt="Logo"
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                        <span className="text-[10px] font-medium text-gray-900 leading-tight">
                            {notif.text}
                        </span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes slide-in-push {
                    0% { 
                        transform: translateY(-20px) scale(0.95); 
                        opacity: 0; 
                        margin-top: -55px; /* Height + gap to push others down */
                    }
                    100% { 
                        transform: translateY(0) scale(1); 
                        opacity: 1; 
                        margin-top: 0;
                    }
                }
                @keyframes fade-out-bottom {
                    0% { 
                        transform: translateY(0) scale(1); 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translateY(30px) scale(0.95); 
                        opacity: 0; 
                    }
                }
                .animate-slide-in-push {
                    animation: slide-in-push 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                .animate-fade-out-bottom {
                    animation: fade-out-bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
            `}</style>
        </div>
    );
}
