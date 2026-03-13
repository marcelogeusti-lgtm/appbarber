'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSocket } from '../contexts/SocketContext';
import { useClientAuth } from '../contexts/ClientAuthContext';

export default function NotificationCenter() {
    const { user } = useClientAuth();
    const socket = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications?limit=20');
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        if (socket && user?.id) {
            console.log('Joining notification room:', user.id);
            socket.emit('join_room', user.id); // Assuming backend expects join_room for user-specific
            
            socket.on('new_notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });
        }

        return () => {
            if (socket) {
                socket.off('new_notification');
            }
        };
    }, [socket, user?.id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            fetchNotifications(); // Refresh on open
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch(`/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-400 hover:text-white transition-colors relative"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-[#111827]"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                        <h3 className="font-black text-white uppercase tracking-widest text-xs">Notificações</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] text-emerald-500 font-bold hover:underline"
                            >
                                Marcar todas como lidas
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-xs">
                                Nenhuma notificação.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800/50">
                                {notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`p-4 hover:bg-slate-800/20 transition flex gap-3 ${!n.isRead ? 'bg-slate-800/10' : ''}`}
                                    >
                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.isRead ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-xs ${!n.isRead ? 'text-white font-bold' : 'text-slate-400'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                                {n.message}
                                            </p>
                                            <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest">
                                                {format(new Date(n.createdAt), "d 'de' MMM, HH:mm", { locale: ptBR })}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <button
                                                onClick={() => markAsRead(n.id)}
                                                className="text-slate-600 hover:text-emerald-500 self-start"
                                                title="Marcar como lida"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-slate-950/50 text-center border-t border-slate-800">
                        <button className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-white transition-colors">
                            Ver Histórico Completo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
