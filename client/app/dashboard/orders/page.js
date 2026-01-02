'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Plus, Search, ShoppingBag, Clock, XCircle, DollarSign, Calendar, ClipboardList } from 'lucide-react';
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
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-8 rounded-3xl border border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                        <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Comandas & Pedidos</h1>
                        <p className="text-slate-500 text-sm font-medium italic">Gerencie as comandas abertas e os fechamentos do dia.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition"
                >
                    <Plus className="w-4 h-4" /> Nova Comanda (Balcão)
                </button>
            </header>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['ALL', 'OPEN', 'PAID'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${filter === f
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                            : 'bg-[#111827] text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                    >
                        {f === 'ALL' ? 'Todas' : f === 'OPEN' ? 'Em Aberto' : 'Finalizadas'}
                    </button>
                ))}
            </div>

            {/* Quick Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#111827] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800 animate-in zoom-in-95">
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-black uppercase text-white tracking-widest">Nova Comanda Rápida</h2>
                            <button onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-white transition">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleQuickCreate} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cliente</label>
                                    <input
                                        value={quickData.guestName}
                                        onChange={e => setQuickData({ ...quickData, guestName: e.target.value })}
                                        className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white transition"
                                        required
                                        placeholder="Nome"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefone</label>
                                    <input
                                        value={quickData.phone}
                                        onChange={e => setQuickData({ ...quickData, phone: e.target.value })}
                                        className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white transition"
                                        required
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Quem vai atender?</label>
                                <select
                                    value={quickData.professionalId}
                                    onChange={e => setQuickData({ ...quickData, professionalId: e.target.value })}
                                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white transition appearance-none"
                                    required
                                >
                                    <option value="">Selecione um profissional</option>
                                    {professionals.map(p => (
                                        <option key={p.id} value={p.id} className="bg-slate-950">{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Serviço Realizado</label>
                                <select
                                    value={quickData.serviceId}
                                    onChange={e => setQuickData({ ...quickData, serviceId: e.target.value })}
                                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white transition appearance-none"
                                    required
                                >
                                    <option value="">Selecione o serviço</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id} className="bg-slate-950">{s.name} - R$ {s.price}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={creatingLoading}
                                    className="flex-1 bg-white text-slate-900 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition shadow-xl"
                                >
                                    {creatingLoading ? 'ABRINDO...' : 'ABRIR COMANDA AGORA'}
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
                        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 hover:border-emerald-500/50 transition-all relative group overflow-hidden">
                            <div className={`absolute top-0 right-0 px-6 py-2 ${order.status === 'OPEN' ? 'bg-orange-500' : 'bg-emerald-500'} text-white font-black text-[8px] uppercase tracking-widest`}>
                                {order.status === 'OPEN' ? 'EM ABERTO' : 'LIQUIDADO'}
                            </div>

                            <div className="mb-6">
                                <h3 className="font-black text-xl text-white uppercase tracking-tight group-hover:text-emerald-500 transition-colors uppercase">
                                    {order.client?.name || 'Venda Avulsa'}
                                </h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                                    <Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mb-8 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-black text-emerald-500 border border-slate-800">
                                    {order.professional?.name?.charAt(0) || 'P'}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Profissional</p>
                                    <p className="text-xs font-bold text-white">{order.professional?.name}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Comanda</p>
                                    <p className="text-2xl font-black text-emerald-500">R$ {parseFloat(order.total).toFixed(2).replace('.', ',')}</p>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 group-hover:text-white transition-colors">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Detalhes</span>
                                    <ClipboardList className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredOrders.length === 0 && (
                <div className="text-center py-32 bg-[#111827] rounded-[3rem] border-2 border-dashed border-slate-800">
                    <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-700">
                        <ShoppingBag className="w-10 h-10" />
                    </div>
                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest italic">Nenhuma comanda encontrada para este filtro.</p>
                </div>
            )}
        </div>
    );
}
