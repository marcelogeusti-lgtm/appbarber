'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Plus, Trash2, Edit2, X, Scissors, Clock } from 'lucide-react';

export default function ServicesPageJS() {
    console.log('Services Version JS - Restore');
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', price: '', duration: '', description: '' });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const barbershopId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            if (!barbershopId) {
                setLoading(false);
                return;
            }

            const res = await api.get(`/services?barbershopId=${barbershopId}`);
            setServices(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) throw new Error('Usuário não autenticado');
            const user = JSON.parse(userStr);
            const barbershopId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            if (!barbershopId) {
                alert('Erro: Sua conta não está vinculada a uma barbearia.');
                return;
            }

            // Ensure numeric types and clean data
            const payload = {
                name: formData.name.trim(),
                price: parseFloat(formData.price),
                duration: parseInt(formData.duration),
                description: formData.description.trim(),
                barbershopId
            };

            if (editingId) {
                await api.put(`/services/${editingId}`, payload);
            } else {
                await api.post('/services', payload);
            }

            setFormData({ name: '', price: '', duration: '', description: '' });
            setIsAdding(false);
            setEditingId(null);
            fetchServices();
        } catch (err) {
            console.error('Submit Service Error:', err);
            alert('Erro ao salvar serviço: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleEdit = (service) => {
        setFormData({
            name: service.name,
            price: service.price,
            duration: service.duration,
            description: service.description || ''
        });
        setEditingId(service.id);
        setIsAdding(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
        try {
            await api.delete(`/services/${id}`);
            fetchServices();
        } catch (err) {
            alert('Erro ao excluir serviço');
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando serviços...</div>;

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-8 rounded-3xl border border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                        <Scissors className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Meus Serviços</h1>
                        <p className="text-slate-500 text-sm font-medium italic">Configure os serviços e preços que aparecem para seus clientes.</p>
                    </div>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition"
                    >
                        <Plus className="w-4 h-4" /> Novo Serviço
                    </button>
                )}
            </header>

            {isAdding && (
                <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold uppercase tracking-wider text-white">
                            {editingId ? 'Editar Serviço' : 'Novo Serviço'}
                        </h2>
                        <button onClick={() => { setIsAdding(false); setEditingId(null); setFormData({ name: '', price: '', duration: '', description: '' }); }} className="text-slate-400 hover:text-red-500 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome do Serviço</label>
                            <input
                                placeholder="Ex: Corte Degradê"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white transition"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Preço Atual (R$)</label>
                            <input
                                placeholder="50.00"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white transition"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Duração (Minutos)</label>
                            <input
                                placeholder="30"
                                type="number"
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white transition"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Breve Descrição</label>
                            <input
                                placeholder="Detalhes para o cliente..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white transition"
                            />
                        </div>
                        <div className="md:col-span-2 pt-4">
                            <button type="submit" className="w-full bg-white text-slate-900 p-4 rounded-xl font-black uppercase tracking-widest transition hover:bg-slate-200 shadow-lg">
                                {editingId ? 'ATUALIZAR SERVIÇO' : 'CADASTRAR SERVIÇO'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <div key={service.id} className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 hover:border-emerald-500/50 transition-all group relative">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-black text-xl text-white uppercase tracking-tight group-hover:text-emerald-500 transition-colors">{service.name}</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" /> {service.duration} MINUTOS
                                </p>
                            </div>
                            <div className="text-xl font-black text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20">
                                R$ {service.price}
                            </div>
                        </div>

                        <p className="text-slate-400 text-xs font-medium italic mb-8 h-8 overflow-hidden line-clamp-2">
                            {service.description || 'Sem descrição adicional para este serviço.'}
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(service)}
                                className="flex-1 border border-slate-700 bg-slate-900 p-3 rounded-xl flex justify-center items-center text-slate-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(service.id)}
                                className="flex-1 border border-slate-700 bg-slate-900 p-3 rounded-xl flex justify-center items-center text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {services.length === 0 && !isAdding && (
                <div className="text-center py-32 bg-[#111827] rounded-[3rem] border-2 border-dashed border-slate-800">
                    <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-700">
                        <Scissors className="w-10 h-10" />
                    </div>
                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Nenhum serviço disponível</p>
                    <button onClick={() => setIsAdding(true)} className="text-emerald-500 font-black uppercase text-xs mt-3 tracking-widest hover:underline">
                        Clique aqui para começar
                    </button>
                </div>
            )}
        </div>
    );
}
