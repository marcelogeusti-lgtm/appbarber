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
                            p-2.5 bg-gray-50 border border-gray-100 rounded-xl shadow-sm
                            flex items-center gap-3 w-full transition-all duration-500 ease-out
                            ${index === 0 ? 'animate-slide-up opacity-100' : 'opacity-100'}
                            ${index === 3 ? 'opacity-0 pointer-events-none absolute' : 'relative'}
                        `}
                        style={{
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
        </div>
    );
}
