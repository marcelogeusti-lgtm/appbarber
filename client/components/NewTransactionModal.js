'use client';
import { useState, useEffect } from 'react';
import { X, TrendingDown, TrendingUp, Calendar, DollarSign, FileText, Loader2, Check } from 'lucide-react';
import api from '../lib/api';

export default function NewTransactionModal({ isOpen, onClose, user, type = 'EXPENSE', onSuccess }) {
    const [loading, setLoading] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'OUTROS',
        date: new Date().toISOString().split('T')[0],
        type: type // EXPENSE or INCOME
    });

    useEffect(() => {
        setFormData(prev => ({ ...prev, type: type }));
    }, [type, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/transactions', {
                ...formData,
                barbershopId: user.barbershop.id,
                amount: parseFloat(formData.amount)
            });

            if (onSuccess) onSuccess();
            onClose();
            setFormData({
                description: '',
                amount: '',
                category: 'OUTROS',
                date: new Date().toISOString().split('T')[0],
                type: type
            });
        } catch (error) {
            console.error('Error creating transaction:', error);
            alert(error.response?.data?.message || 'Erro ao criar transação');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isExpense = formData.type === 'EXPENSE';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-[#111827] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-[#0f1523] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <h2 className={`text-lg font-bold flex items-center gap-2 ${isExpense ? 'text-red-500' : 'text-emerald-500'}`}>
                        {isExpense ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                        {isExpense ? 'Lançar Despesa' : 'Lançar Receita'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Amount */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valor (R$)</label>
                        <div className="relative">
                            <DollarSign className={`absolute left-3 top-3 w-4 h-4 ${isExpense ? 'text-red-500' : 'text-emerald-500'}`} />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 text-lg font-bold text-white focus:ring-2 focus:ring-opacity-50 outline-none transition-all"
                                style={{ borderColor: isExpense ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)' }}
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Ex: Conta de Luz, Café, Material..."
                                required
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 text-sm text-white focus:ring-2 focus:ring-slate-600 outline-none transition-all"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Category & Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</label>
                            <select
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:ring-2 focus:ring-slate-600 outline-none transition-all"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="OUTROS">Outros</option>
                                <option value="ALUGUEL">Aluguel</option>
                                <option value="ENERGIA">Energia</option>
                                <option value="AGUA">Água</option>
                                <option value="MATERIAL">Material</option>
                                <option value="LIMPEZA">Limpeza</option>
                                <option value="SALARIO">Salário</option>
                                <option value="MARKETING">Marketing</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data</label>
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
                            className={`px-6 py-2.5 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 ${isExpense ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'}`}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {isExpense ? 'Lançar Despesa' : 'Lançar Receita'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
