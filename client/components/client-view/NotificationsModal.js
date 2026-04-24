'use client';
import { useState, useEffect } from 'react';
import { X, Search, Bell, Check, Loader2, Calendar } from 'lucide-react';
import clientApi from '../../lib/clientApi';
import { useRouter } from 'next/navigation';
import AppointmentDetailsModal from '../AppointmentDetailsModal';
import api from '../../lib/api';

export default function NotificationsModal({ isOpen, onClose }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('unread'); // unread, read
    const [search, setSearch] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const [viewingAppointment, setViewingAppointment] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const fetchNotifications = async () => {
        if (!isOpen) return;
        setLoading(true);
        try {
            const response = await clientApi.get('notifications');
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const handleMarkAsRead = async (id, appointmentId) => {
        try {
            await clientApi.patch(`notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

            // If it's an appointment, show details instead of redirecting
            if (appointmentId) {
                try {
                    setIsLoadingDetails(true);
                    const res = await api.get(`/appointments/${appointmentId}`);
                    if (res.data) {
                        setViewingAppointment(res.data);
                        setIsDetailsModalOpen(true);
                    }
                } catch (err) {
                    console.error('Error fetching appointment:', err);
                    alert('Não foi possível carregar os detalhes do agendamento.');
                } finally {
                    setIsLoadingDetails(false);
                }
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        setMarkingAll(true);
        try {
            await clientApi.patch('notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setActiveTab('read');
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setMarkingAll(false);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesTab = activeTab === 'unread' ? !n.isRead : n.isRead;
        const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
            n.message.toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-[#111] border border-white/5 rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Notícias</h2>

                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                        <input
                            type="text"
                            placeholder="Pesquisar"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary transition"
                        />
                    </div>

                    {/* Tabs Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-4 p-1 bg-[#0A0A0A] rounded-xl w-fit">
                            <button
                                onClick={() => setActiveTab('unread')}
                                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'unread' ? 'bg-[#1A1A1A] text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Não lidas
                            </button>
                            <button
                                onClick={() => setActiveTab('read')}
                                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'read' ? 'bg-[#1A1A1A] text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Lidas
                            </button>
                        </div>

                        {activeTab === 'unread' && filteredNotifications.length > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={markingAll}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-blue-400 transition disabled:opacity-50"
                            >
                                {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Marcar todas como lidas
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Carregando Notícias...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        <div className="space-y-4">
                            {filteredNotifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleMarkAsRead(notif.id, notif.appointmentId)}
                                    className="group relative bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition cursor-pointer overflow-hidden"
                                >
                                    <div className="flex gap-4">
                                        <div className={`p-3 rounded-xl ${notif.isRead ? 'bg-white/5 text-slate-600' : 'bg-primary/10 text-primary'}`}>
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className={`text-sm font-bold truncate ${notif.isRead ? 'text-slate-400' : 'text-white'}`}>
                                                    {notif.title}
                                                </h4>
                                                <span className="text-[10px] text-slate-600 font-medium">
                                                    {new Date(notif.createdAt).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                            <p className={`text-xs leading-relaxed ${notif.isRead ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {notif.message}
                                            </p>
                                        </div>
                                    </div>
                                    {!notif.isRead && (
                                        <div className="absolute top-0 right-0 w-1 h-full bg-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                            <div className="w-20 h-20 bg-[#0A0A0A] rounded-full flex items-center justify-center mb-6">
                                <Bell className="w-8 h-8 text-slate-800" />
                            </div>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                                {search ? 'Nenhuma notícia encontrada para sua busca.' : 'Nenhuma notícia encontrada.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {isDetailsModalOpen && (
                <AppointmentDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => {
                        setIsDetailsModalOpen(false);
                        setViewingAppointment(null);
                    }}
                    appointment={viewingAppointment}
                    onRefresh={fetchNotifications}
                />
            )}

            {isLoadingDetails && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-[#111] p-8 rounded-3xl border border-white/5 flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando detalhes...</p>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
