'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../contexts/LanguageContext';

export default function RollingNotificationFeed() {
    const { t } = useTranslation();

    const [notifications, setNotifications] = useState([
        { id: 'initial-1', textIndex: 0 },
        { id: 'initial-2', textIndex: 1 },
        { id: 'initial-3', textIndex: 2 }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = Math.floor(Math.random() * 8);
            const nextNotif = { id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36), textIndex: nextIndex };
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
                            className="absolute top-2 left-2 right-2 p-3 bg-white/95 backdrop-blur-md border border-zinc-200 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl flex items-center gap-3 will-change-transform hover:will-change-auto"
                        >
                            <img
                                src="/logos/logo_icon.png"
                                alt="Logo"
                                className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-black/5 shadow-sm"
                            />
                            <div className="flex flex-col overflow-hidden text-left flex-1">
                                <span className="text-xs font-medium text-zinc-900">
                                    {t('group3.rollingNotifications.appName')}
                                </span>
                                <span className="text-xs text-zinc-600 truncate leading-relaxed">
                                    {t(`group3.rollingNotifications.services.${notif.textIndex}`)}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
