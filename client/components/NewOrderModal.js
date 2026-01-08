'use client';
import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Scissors, Check, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';

export default function NewOrderModal({ isOpen, onClose, user }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Data
    const [professionals, setProfessionals] = useState([]);
    const [services, setServices] = useState([]);

    // Form
    const [formData, setFormData] = useState({
        guestName: '',
        guestPhone: '',
        professionalId: '',
        serviceId: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });

    useEffect(() => {
        if (isOpen && user?.barbershop?.id) {
            fetchData();
        }
    }, [isOpen, user]);

    const fetchData = async () => {
        try {
            const [prosRes, servRes] = await Promise.all([
                api.get(`/dashboard/professionals?barbershopId=${user.barbershop.id}`),
                api.get(`/dashboard/services?barbershopId=${user.barbershop.id}`)
            ]);
            setProfessionals(prosRes.data);
            setServices(servRes.data);
        } catch (error) {
            console.error('Error fetching data for modal:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Using appointment creation (which creates Order)
            const res = await api.post('/appointments', {
                ...formData,
                barbershopId: user.barbershop.id,
                paymentMethod: 'CASH', // Default for quick order
                createAccount: false
            });

            // Success
            onClose();
            // Redirect to Order or just notify?
            // Redirecting to Order Details seems appropriate for processing payment
            if (res.data.order?.id) {
                router.push(`/dashboard/orders/${res.data.order.id}`);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert(error.response?.data?.message || 'Erro ao criar comanda');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-[#111827] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-[#0f1523] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Scissors className="w-5 h-5 text-emerald-500" />
                        Nova Comanda
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Client Info */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente (Guest)</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Nome do Cliente"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    value={formData.guestName}
                                    onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                                />
                            </div>
                            <input
                                type="tel"
                                placeholder="Telefone"
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                value={formData.guestPhone}
                                onChange={e => setFormData({ ...formData, guestPhone: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Professional & Service */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detalhes do Serviço</label>

                        <select
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            value={formData.professionalId}
                            onChange={e => setFormData({ ...formData, professionalId: e.target.value })}
                        >
                            <option value="">Selecione o Profissional</option>
                            {professionals.map(pro => (
                                <option key={pro.id} value={pro.id}>{pro.name}</option>
                            ))}
                        </select>

                        <select
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            value={formData.serviceId}
                            onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                        >
                            <option value="">Selecione o Serviço</option>
                            {services.map(srv => (
                                <option key={srv.id} value={srv.id}>{srv.name} - R$ {srv.price}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date/Time (Defaults to Now but editable) */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Data</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 text-sm text-white outline-none"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Horário</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                <input
                                    type="time"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 text-sm text-white outline-none"
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Criar Comanda
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
