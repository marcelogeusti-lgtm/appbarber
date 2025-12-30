'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export default function ServicesPage() {
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Meus Serviços</h1>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-orange-600 transition"
                    >
                        <Plus className="w-5 h-5" /> Novo Serviço
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="Nome do Serviço (ex: Corte Degradê)"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                            required
                        />
                        <input
                            placeholder="Preço (ex: 50)"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            className="p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                            required
                        />
                        <input
                            placeholder="Duração em Minutos (ex: 30)"
                            type="number"
                            value={formData.duration}
                            onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            className="p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                            required
                        />
                        <input
                            placeholder="Descrição curta (opcional)"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                        />
                        <div className="md:col-span-2 flex gap-2">
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                                <Check className="w-5 h-5" /> Salvar
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsAdding(false); setEditingId(null); setFormData({ name: '', price: '', duration: '', description: '' }); }}
                                className="bg-slate-200 dark:bg-slate-700 px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                            >
                                <X className="w-5 h-5" /> Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <div key={service.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-xl uppercase">{service.name}</h3>
                                <p className="text-slate-500 text-sm">{service.duration} minutos</p>
                            </div>
                            <div className="text-2xl font-black text-orange-500">R$ {service.price}</div>
                        </div>
                        <p className="text-slate-400 text-sm mb-6 h-10 overflow-hidden">{service.description || 'Sem descrição.'}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(service)}
                                className="flex-1 bg-slate-100 dark:bg-slate-700 p-2 rounded-lg flex justify-center items-center hover:bg-orange-500 hover:text-white transition"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(service.id)}
                                className="flex-1 bg-slate-100 dark:bg-slate-700 p-2 rounded-lg flex justify-center items-center hover:bg-red-500 hover:text-white transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {services.length === 0 && !isAdding && (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500">Nenhum serviço cadastrado ainda.</p>
                    <button onClick={() => setIsAdding(true)} className="text-orange-500 font-bold mt-2">Clique aqui para começar</button>
                </div>
            )}
        </div>
    );
}
