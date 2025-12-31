'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Plus, Search, ShoppingBag, Clock, CheckCircle, XCircle, DollarSign, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, OPEN, PAID

    // For "Quick Create"
    const [isCreating, setIsCreating] = useState(false);
    const [quickData, setQuickData] = useState({ guestName: '', phone: '', professionalId: '', serviceId: '' });
    const [professionals, setProfessionals] = useState([]);
    const [services, setServices] = useState([]);
    const [creatingLoading, setCreatingLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const barbershopId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            const [ordersRes, prosRes, servicesRes] = await Promise.all([
                api.get(`/orders?barbershopId=${barbershopId}`),
                api.get(`/professionals?barbershopId=${barbershopId}`),
                api.get(`/services?barbershopId=${barbershopId}`)
            ]);

            setOrders(ordersRes.data);
            setProfessionals(prosRes.data);
            setServices(servicesRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleQuickCreate = async (e) => {
        e.preventDefault();
        setCreatingLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);

            // 1. Create walk-in appointment (using current time)
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const timeStr = now.toTimeString().slice(0, 5);

            const appointmentRes = await api.post('/appointments', {
                professionalId: quickData.professionalId,
                serviceId: quickData.serviceId,
                date: dateStr,
                time: timeStr,
                guestName: quickData.guestName,
                guestPhone: quickData.phone
            });

            const appointment = appointmentRes.data.appointment || appointmentRes.data;

            // 2. Create Order
            await api.post('/orders', {
                appointmentId: appointment.id,
                barbershopId: user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id,
                clientId: appointment.clientId,
                professionalId: quickData.professionalId
            });

            // Refresh
            setIsCreating(false);
            setQuickData({ guestName: '', phone: '', professionalId: '', serviceId: '' });
            fetchData();
        } catch (err) {
            alert('Erro ao criar comanda: ' + (err.response?.data?.message || err.message));
        } finally {
            setCreatingLoading(false);
        }
    };

    const filteredOrders = orders.filter(o => {
        if (filter === 'ALL') return true;
        if (filter === 'OPEN') return o.status === 'OPEN';
        if (filter === 'PAID') return o.status === 'PAID' || o.status === 'CLOSED';
        return true;
    });

    if (loading) return <div className="p-8 text-center">Carregando comandas...</div>;

    return (
        <div className="space-y-6 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Comandas & Pedidos</h1>
                    <p className="text-slate-500 text-sm">Gerencie vendas e pagamentos do dia a dia.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
                >
                    <Plus className="w-5 h-5" /> Novo Pedido (Balcão)
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {['ALL', 'OPEN', 'PAID'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition ${filter === f
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                : 'bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                    >
                        {f === 'ALL' ? 'Todos' : f === 'OPEN' ? 'Em Aberto' : 'Pagos/Fechados'}
                    </button>
                ))}
            </div>

            {/* Quick Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 animate-in zoom-in-95">
                        <h2 className="text-xl font-black uppercase mb-6">Novo Pedido Balcão</h2>
                        <form onSubmit={handleQuickCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Nome do Cliente</label>
                                <input
                                    value={quickData.guestName}
                                    onChange={e => setQuickData({ ...quickData, guestName: e.target.value })}
                                    className="w-full p-3 border rounded-xl dark:bg-slate-800"
                                    required
                                    placeholder="Ex: João da Silva"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                                <input
                                    value={quickData.phone}
                                    onChange={e => setQuickData({ ...quickData, phone: e.target.value })}
                                    className="w-full p-3 border rounded-xl dark:bg-slate-800"
                                    required
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Profissional</label>
                                <select
                                    value={quickData.professionalId}
                                    onChange={e => setQuickData({ ...quickData, professionalId: e.target.value })}
                                    className="w-full p-3 border rounded-xl dark:bg-slate-800"
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {professionals.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Serviço Principal</label>
                                <select
                                    value={quickData.serviceId}
                                    onChange={e => setQuickData({ ...quickData, serviceId: e.target.value })}
                                    className="w-full p-3 border rounded-xl dark:bg-slate-800"
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingLoading}
                                    className="flex-1 p-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20"
                                >
                                    {creatingLoading ? 'Criando...' : 'Abrir Comanda'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Orders List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map(order => (
                    <Link href={`/dashboard/orders/${order.id}`} key={order.id} className="block group">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
                            <div className={`absolute top-0 right-0 p-4 ${order.status === 'OPEN' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'} rounded-bl-3xl font-black text-xs uppercase tracking-widest`}>
                                {order.status === 'OPEN' ? 'EM ABERTO' : 'PAGO'}
                            </div>

                            <div className="mb-4">
                                <h3 className="font-black text-lg uppercase">{order.client?.name || 'Cliente'}</h3>
                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                    <User className="w-3 h-3" /> Atendido por {order.professional?.name}
                                </p>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Total</span>
                                    <span className="font-black text-xl">R$ {parseFloat(order.total).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Itens: {order.items?.length || 0}</span>
                                    <span>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>

                            <div className="w-full bg-slate-50 dark:bg-slate-700 py-3 rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-widest group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                Ver Detalhes <FileText className="w-4 h-4 ml-2" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredOrders.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-slate-500">Nenhuma comanda encontrada.</p>
                </div>
            )}
        </div>
    );
}
