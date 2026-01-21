'use client';
import { useState, useEffect } from 'react';
import { X, User, Calendar, DollarSign, Award, Clock, Phone, Mail, MapPin, Package } from 'lucide-react';
import api from '../lib/api';

export default function ClientDetailsModal({ isOpen, onClose, clientId, user }) {
    const [activeTab, setActiveTab] = useState('details');
    const [clientData, setClientData] = useState(null);
    const [loading, setLoading] = useState(false);

    const barbershopId = user?.barbershop?.id || user?.barbershopId;

    useEffect(() => {
        if (isOpen && clientId && barbershopId) {
            fetchClientDetails();
        }
    }, [isOpen, clientId, barbershopId]);

    const fetchClientDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/clients/${clientId}?barbershopId=${barbershopId}`);
            setClientData(res.data);
        } catch (error) {
            console.error('Error fetching client details:', error);
            // Optional: Set an error state to show a retry button?
            // For now, logging is enough as the UI shows "Erro ao carregar dados"
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    const formatDate = (date) => new Date(date).toLocaleDateString('pt-BR');

    const Tabs = () => (
        <div className="flex border-b border-slate-800 mb-6">
            <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-emerald-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                Detalhes
            </button>
            <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'history' ? 'border-emerald-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                Histórico
            </button>
            <button
                onClick={() => setActiveTab('loyalty')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'loyalty' ? 'border-emerald-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                Fidelidade
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-[#111827] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-[#0f1523] px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                            {clientData?.client?.avatarUrl ? (
                                <img src={clientData.client.avatarUrl} alt={clientData.client.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="text-xl font-bold text-slate-400">{clientData?.client?.name?.[0]}</span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{clientData?.client?.name || 'Carregando...'}</h2>
                            <p className="text-xs text-slate-500">{clientData?.client?.email || 'Sem e-mail'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : clientData ? (
                        <>
                            <Tabs />

                            {activeTab === 'details' && (
                                <div className="space-y-6">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Gasto</p>
                                            <p className="text-lg font-black text-white">{formatCurrency(clientData.stats.totalSpent)}</p>
                                        </div>
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Visitas</p>
                                            <p className="text-lg font-black text-white">{clientData.stats.totalVisits}</p>
                                        </div>
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">No-Shows</p>
                                            <p className={`text-lg font-black ${clientData.stats.noShows > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {clientData.stats.noShows}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Informações de Contato</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                                <Phone className="w-4 h-4 text-emerald-500" />
                                                <span>{clientData.client.phone || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                                <Mail className="w-4 h-4 text-emerald-500" />
                                                <span>{clientData.client.email || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-300">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                <span>Nascimento: {clientData.client.birthday ? formatDate(clientData.client.birthday) : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Últimos Agendamentos</h3>
                                    {clientData.appointments.length > 0 ? (
                                        <div className="space-y-3">
                                            {clientData.appointments.map(apt => (
                                                <div key={apt.id} className="bg-slate-800/30 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                            <Calendar className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{apt.service?.name}</p>
                                                            <p className="text-xs text-slate-500">{formatDate(apt.date)} às {new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${apt.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        apt.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                                                        }`}>
                                                        {apt.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">Nenhum histórico encontrado.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'loyalty' && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Assinaturas e Planos</h3>
                                    {clientData.subscriptions.length > 0 ? (
                                        <div className="space-y-3">
                                            {clientData.subscriptions.map(sub => (
                                                <div key={sub.id} className="bg-gradient-to-r from-emerald-900/20 to-slate-900 p-4 rounded-xl border border-emerald-500/20">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-bold text-white">{sub.subscriptionPlan.name}</h4>
                                                        <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">ATIVO</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400">Expira em: {formatDate(sub.endDate)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                                            <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                            <p className="text-sm text-slate-500">Nenhuma assinatura ativa.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </>
                    ) : (
                        <div className="text-center text-slate-500">Erro ao carregar dados.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
