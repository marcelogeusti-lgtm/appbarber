'use client';
import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Scissors, Check, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
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

    // State for multiple services
    const [selectedServiceIds, setSelectedServiceIds] = useState([]);

    const getBarbershopId = () => user?.barbershop?.id || user?.workedBarbershop?.id || user?.ownedBarbershops?.[0]?.id;

    useEffect(() => {
        const shopId = getBarbershopId();
        if (isOpen && shopId) {
            fetchData(shopId);
        }
    }, [isOpen, user]);

    const fetchData = async (shopId) => {
        try {
            const [prosRes, servRes] = await Promise.all([
                api.get(`/professionals?barbershopId=${shopId}`),
                api.get(`/services?barbershopId=${shopId}&active=true&limit=1000`)
            ]);
            setProfessionals(Array.isArray(prosRes.data) ? prosRes.data : (prosRes.data.data || []));
            setServices(Array.isArray(servRes.data) ? servRes.data : (servRes.data.data || []));
        } catch (error) {
            console.error('Error fetching data for modal:', error);
        }
    };

    const toggleService = (id) => {
        setSelectedServiceIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedServiceIds.length === 0) return toast.error('Selecione ao menos um serviço');

        const shopId = getBarbershopId();
        if (!shopId) return toast.error('Erro: Barbearia não identificada.');

        setLoading(true);
        try {
            const res = await api.post('/orders', {
                guestName: formData.guestName,
                guestPhone: formData.guestPhone,
                professionalId: formData.professionalId,
                serviceIds: selectedServiceIds,
                isManual: true,
                barbershopId: shopId
            });

            // Success
            onClose();
            if (res.data?.id) {
                router.push(`/dashboard/orders/${res.data.id}`);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error(error.response?.data?.message || 'Erro ao criar comanda');
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
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Scissors className="w-5 h-5 text-emerald-500" />
                            Nova Comanda de Balcão
                        </h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Não gera agendamento na agenda
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">

                    {/* Client Info */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente (Visitante)</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Nome"
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    value={formData.guestName}
                                    onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                                />
                            </div>
                            <input
                                type="tel"
                                placeholder="Telefone"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                value={formData.guestPhone}
                                onChange={e => setFormData({ ...formData, guestPhone: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Professional Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quem atendeu?</label>
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
                    </div>

                    {/* Services Selection (Multi) */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Serviços Realizados</label>
                        <div className="grid grid-cols-1 gap-2 border border-slate-800 p-3 rounded-xl bg-slate-950/50">
                            {services.map(srv => (
                                <div
                                    key={srv.id}
                                    onClick={() => toggleService(srv.id)}
                                    className={`p-3 rounded-lg border flex justify-between items-center cursor-pointer transition-all ${selectedServiceIds.includes(srv.id)
                                        ? 'border-emerald-500 bg-emerald-500/10'
                                        : 'border-slate-800 bg-slate-900 hover:border-slate-600'
                                        }`}
                                >
                                    <span className="text-sm font-bold text-white uppercase tracking-tight">{srv.name}</span>
                                    <span className="text-xs font-black text-emerald-500">R$ {srv.price}</span>
                                </div>
                            ))}
                            {services.length === 0 && <p className="text-[10px] text-slate-600 text-center py-4">Nenhum serviço disponível.</p>}
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
                            Abrir Comanda
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
