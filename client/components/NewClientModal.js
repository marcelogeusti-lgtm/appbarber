'use client';
import { useState } from 'react';
import { X, Save, User, Phone, Mail, FileText, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function NewClientModal({ isOpen, onClose, onSuccess, barbershopId }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        notes: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/clients', {
                ...formData,
                barbershopId
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating client:', error);
            alert('Erro ao cadastrar cliente. Verifique se o telefone já existe.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#111827] w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-500" />
                        Novo Cliente
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome Completo *</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Ex: João Silva"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Telefone / WhatsApp *</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="tel"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Ex: 11999999999"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email (Opcional)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="email"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Ex: joao@email.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Observações (Opcional)</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <textarea
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px]"
                                placeholder="Ex: Prefere corte na tesoura..."
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Cadastrar</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
