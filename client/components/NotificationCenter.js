'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSocket } from '../contexts/SocketContext';
import { useClientAuth } from '../contexts/ClientAuthContext';
import { useRouter } from 'next/navigation';
import AppointmentDetailsModal from './AppointmentDetailsModal';
import { Loader2 } from 'lucide-react';

export default function NotificationCenter({ user: propUser }) {
    const { user: clientAuthUser } = useClientAuth();
    const user = propUser || clientAuthUser;
    const router = useRouter();
    const socket = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [viewingAppointment, setViewingAppointment] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
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
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        setIsOpen(false);

        // STRIKE Context Isolation: Identify if we are in Dashboard or Client Site
        const isInDashboard = typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard');
        const isProfessional = (propUser?.role && propUser.role !== 'CLIENT') || (isInDashboard);

        // 1. Appointment Notifications -> Expansion (Priority)
        if (notification.appointmentId) {
            try {
                setIsLoadingDetails(true);
                const res = await api.get(`/appointments/${notification.appointmentId}`);
                if (res.data) {
                    setViewingAppointment(res.data);
                    setIsDetailsModalOpen(true);
                }
                return; // STOP: We handle appointments via modal only
            } catch (err) {
                console.error('Error fetching appointment details:', err);
                // Fallback: If it's a Pro and fetch fails, maybe attempt redirect if really needed, 
                // but user said NO redirect, so just alert.
                alert('Não foi possível carregar os detalhes do agendamento.');
                return;
            } finally {
                setIsLoadingDetails(false);
            }
        } 
        
        // 2. Payment/Order Notifications -> Context-aware Redirection
        if (notification.type === 'payment_confirmed' || notification.type === 'order_confirmed') {
            if (isProfessional) {
                router.push('/dashboard/finance');
            } else {
                router.push('/agenda');
            }
            return;
        }

        // 3. Fallback for other types
        if (!isProfessional && notification.type === 'system') {
            router.push('/inicio');
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
                                className="text-[10px] text-primary font-bold hover:underline"
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
                                        onClick={() => handleNotificationClick(n)}
                                        className={`p-4 hover:bg-slate-800/40 transition flex gap-3 cursor-pointer group ${!n.isRead ? 'bg-slate-800/20 border-l-2 border-primary' : ''}`}
                                    >
                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-transparent'}`}></div>
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-xs ${!n.isRead ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-[10px] text-slate-500 leading-relaxed group-hover:text-slate-400">
                                                {n.message}
                                            </p>
                                            <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest">
                                                {format(new Date(n.createdAt), "d 'de' MMM, HH:mm", { locale: ptBR })}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(n.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-primary transition-all self-start"
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
            {isDetailsModalOpen && (
                <AppointmentDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => {
                        setIsDetailsModalOpen(false);
                        setViewingAppointment(null);
                    }}
                    appointment={viewingAppointment}
                    onEdit={() => {
                        setIsDetailsModalOpen(false);
                        router.push(`/dashboard/appointments?id=${viewingAppointment.id}`);
                    }}
                    onComplete={async (id, method) => {
                        try {
                            await api.patch(`/appointments/${id}/status`, { 
                                status: 'COMPLETED',
                                paymentMethod: method
                            });
                            setIsDetailsModalOpen(false);
                            fetchNotifications();
                            alert('Atendimento finalizado com sucesso!');
                        } catch (err) {
                            alert('Erro ao finalizar atendimento');
                        }
                    }}
                    onRefresh={fetchNotifications}
                />
            )}

            {isLoadingDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-[#111827] p-8 rounded-3xl border border-slate-800 flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando detalhes...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
