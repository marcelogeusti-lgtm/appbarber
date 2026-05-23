'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
            const nextNotif = { id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36), text: nextText };
            setNotifications(prev => {
                return [nextNotif, ...prev].slice(0, 4);
            });
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-[200px] w-[280px] overflow-visible perspective-[1200px] pointer-events-none px-2 pt-2">
            <AnimatePresence>
                {notifications.map((notif, index) => {
                    return (
                        <motion.div
                            key={notif.id}
                            style={{ zIndex: 20 - index }}
                            initial={{
                                opacity: 0,
                                y: -20,
                                scale: 0.92
                            }}
                            animate={{
                                opacity: index >= 3 ? 0 : 1 - (index * 0.15),
                                y: index * 58, // espaço entre os cards
                                scale: index >= 3 ? 0.9 : 1 - (index * 0.05)
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.9,
                                transition: { duration: 0.2 }
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 350,
                                damping: 30,
                                mass: 0.9
                            }}
                            className="absolute top-2 left-2 right-2 p-3 bg-[#0A0A0B]/80 backdrop-blur-md border border-white/[0.10] shadow-[0_4px_24px_rgba(0,0,0,0.3)] rounded-2xl flex items-center gap-3 will-change-transform hover:will-change-auto"
                        >
                            <img
                                src="/logos/logo_icon.png"
                                alt="Logo"
                                className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-white/10 shadow-md"
                            />
                            <div className="flex flex-col overflow-hidden text-left flex-1">
                                <span className="text-[11px] font-semibold text-white/90 tracking-wide">
                                    NEXT APP
                                </span>
                                <span className="text-[11px] font-medium text-white/60 truncate leading-snug truncate">
                                    {notif.text}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
