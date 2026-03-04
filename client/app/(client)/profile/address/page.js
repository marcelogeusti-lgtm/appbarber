'use client';
import { MapPin, Plus, Loader2, Home, Trash2, CheckCircle2, X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../lib/clientApi';
import { toast } from 'sonner';

export default function AddressPage() {
    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchingZip, setSearchingZip] = useState(false);

    const [formData, setFormData] = useState({
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        isDefault: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await api.get('/addresses');
            setAddresses(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar endereços.');
        } finally {
            setLoading(false);
        }
    };

    const handleZipLookup = async () => {
        const zip = formData.zipCode.replace(/\D/g, '');
        if (zip.length !== 8) {
            toast.error('CEP inválido.');
            return;
        }

        setSearchingZip(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
            const data = await res.json();
            if (data.erro) {
                toast.error('CEP não encontrado.');
            } else {
                setFormData(prev => ({
                    ...prev,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf
                }));
            }
        } catch (error) {
            toast.error('Erro ao buscar CEP.');
        } finally {
            setSearchingZip(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/addresses', formData);
            toast.success('Endereço adicionado!');
            setShowForm(false);
            setFormData({
                zipCode: '', street: '', number: '', complement: '',
                neighborhood: '', city: '', state: '', isDefault: false
            });
            fetchAddresses();
        } catch (error) {
            toast.error('Erro ao salvar endereço.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir este endereço?')) return;
        try {
            await api.delete(`/addresses/${id}`);
            toast.success('Endereço removido.');
            fetchAddresses();
        } catch (error) {
            toast.error('Erro ao remover endereço.');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.1, duration: 0.5 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <motion.div
            initial="hidden" animate="visible" variants={containerVariants}
            className="space-y-12 animate-in fade-in duration-500"
        >
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div className="flex flex-col gap-3">
                    <h1 className="text-4xl font-black text-white tracking-tight">Endereço</h1>
                    <p className="text-slate-500 text-sm font-medium max-w-md leading-relaxed">
                        Gerencie seus endereços para agilizar seus agendamentos.
                    </p>
                </div>
                {!showForm && addresses.length > 0 && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Novo
                    </button>
                )}
            </motion.div>

            <AnimatePresence mode="wait">
                {showForm ? (
                    <motion.div
                        key="form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0A0A0B]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden"
                    >
                        <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-10 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Plus className="w-4 h-4 text-primary" />
                            </div>
                            Novo Endereço
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">CEP</label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="text" value={formData.zipCode}
                                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                            onBlur={handleZipLookup}
                                            placeholder="00000-000"
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-primary/50 outline-none"
                                            required
                                        />
                                        {searchingZip && <Loader2 className="w-4 h-4 animate-spin text-primary absolute right-6" />}
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Rua / Logradouro</label>
                                    <input
                                        type="text" value={formData.street}
                                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-primary/50 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Número</label>
                                    <input
                                        type="text" value={formData.number}
                                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-primary/50 outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Complemento</label>
                                    <input
                                        type="text" value={formData.complement}
                                        onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-primary/50 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Bairro</label>
                                    <input
                                        type="text" value={formData.neighborhood}
                                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-primary/50 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Cidade</label>
                                    <input
                                        type="text" value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-primary/50 outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Estado (UF)</label>
                                    <input
                                        type="text" value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-primary/50 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                                <button
                                    type="button" onClick={() => setShowForm(false)}
                                    className="px-8 py-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit" disabled={saving}
                                    className="px-10 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Salvar Endereço'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : addresses.length > 0 ? (
                    <motion.div key="list" variants={containerVariants} className="grid gap-6">
                        {addresses.map((addr) => (
                            <motion.div
                                key={addr.id} variants={itemVariants} whileHover={{ scale: 1.01 }}
                                className="group relative bg-[#0A0A0B]/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 flex items-center justify-between transition-all hover:border-white/10"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                        <Home className="w-6 h-6" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{addr.street}, {addr.number}</h3>
                                        <p className="text-xs text-slate-500 mt-1 italic">
                                            {addr.neighborhood} — {addr.city}, {addr.state}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(addr.id)}
                                    className="p-4 bg-white/5 text-slate-500 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div key="empty" variants={itemVariants} className="grid gap-4">
                        <div className="group bg-[#0A0A0B]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-16 flex flex-col items-center text-center gap-8 transition-all hover:border-white/10 shadow-2xl">
                            <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center text-slate-700 group-hover:text-primary transition-all duration-500">
                                <MapPin className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">Vazio, por enquanto...</h3>
                                <p className="text-sm text-slate-500 mt-2 max-w-[280px] leading-relaxed mx-auto">
                                    Adicione seu primeiro endereço para agilizar seus agendamentos.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowForm(true)}
                                className="px-10 py-5 bg-gradient-to-r from-primary to-blue-600 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-xl flex items-center gap-3"
                            >
                                <Plus className="w-4 h-4" strokeWidth={3} />
                                Adicionar Endereço
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
