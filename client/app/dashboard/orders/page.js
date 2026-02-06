'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Plus, Search, ShoppingBag, Clock, XCircle, DollarSign, Calendar, ClipboardList, X } from 'lucide-react';
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
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            const [ordersRes, prosRes, servicesRes] = await Promise.all([
                api.get(`/orders?barbershopId=${bId}`),
                api.get(`/professionals?barbershopId=${bId}`),
                api.get(`/services?barbershopId=${bId}`)
            ]);

            setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
            setProfessionals(Array.isArray(prosRes.data) ? prosRes.data : []);
            setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
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
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            await api.post('/orders', {
                professionalId: quickData.professionalId,
                serviceIds: [quickData.serviceId],
                guestName: quickData.guestName,
                guestPhone: quickData.phone,
                isManual: true,
                barbershopId: bId
            });

            setIsCreating(false);
            setQuickData({ guestName: '', phone: '', professionalId: '', serviceId: '' });
            fetchData();
        } catch (err) {
            alert('Erro ao criar comanda manual: ' + (err.response?.data?.message || err.message));
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

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Sincronizando comandas...</div>;

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-3xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Comandas & Pedidos</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Gerencie as comandas abertas e os fechamentos do dia.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition active:scale-95"
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
                        className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${filter === f
                            ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-105'
                            : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                            }`}
                    >
                        {f === 'ALL' ? 'Todas' : f === 'OPEN' ? 'Em Aberto' : 'Finalizadas'}
                    </button>
                ))}
            </div>

            {/* Quick Create Modal Overlay */}
            {isCreating && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-border flex justify-between items-center bg-muted/20">
                            <h2 className="text-xl font-black uppercase text-foreground tracking-widest">Nova Comanda Rápida</h2>
                            <button onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleQuickCreate} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cliente</label>
                                    <input
                                        value={quickData.guestName}
                                        onChange={e => setQuickData({ ...quickData, guestName: e.target.value })}
                                        className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition"
                                        required
                                        placeholder="Nome"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Telefone</label>
                                    <input
                                        value={quickData.phone}
                                        onChange={e => setQuickData({ ...quickData, phone: e.target.value })}
                                        className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition"
                                        required
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Quem vai atender?</label>
                                <select
                                    value={quickData.professionalId}
                                    onChange={e => setQuickData({ ...quickData, professionalId: e.target.value })}
                                    className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition appearance-none"
                                    required
                                >
                                    <option value="">Selecione um profissional</option>
                                    {professionals.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Serviço Realizado</label>
                                <select
                                    value={quickData.serviceId}
                                    onChange={e => setQuickData({ ...quickData, serviceId: e.target.value })}
                                    className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition appearance-none"
                                    required
                                >
                                    <option value="">Selecione o serviço</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={creatingLoading}
                                    className="flex-1 bg-primary text-primary-foreground py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition shadow-xl shadow-primary/20 disabled:opacity-50"
                                >
                                    {creatingLoading ? 'ABRINDO...' : 'ABRIR COMANDA AGORA'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Orders List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredOrders.map(order => (
                    <Link href={`/dashboard/orders/${order.id}`} key={order.id} className="block group">
                        <div className="bg-card p-8 rounded-[2.5rem] border border-border hover:border-primary/50 transition-all relative group overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl hover:shadow-primary/5">
                            <div className={`absolute top-0 right-0 px-6 py-2 ${order.status === 'OPEN' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'} font-black text-[8px] uppercase tracking-widest border-l border-b border-border/10`}>
                                {order.status === 'OPEN' ? 'EM ABERTO' : 'LIQUIDADO'}
                            </div>

                            <div className="mb-6">
                                <h3 className="font-black text-xl text-foreground uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">
                                    {order.client?.name || order.guestName || 'Venda Avulsa'}
                                </h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 mt-2">
                                    <Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mb-8 bg-muted/30 p-4 rounded-2xl border border-border/50">
                                <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center font-black text-primary border border-border text-lg shadow-inner">
                                    {(order.professional?.name || 'P').charAt(0)}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Profissional</p>
                                    <p className="text-xs font-bold text-foreground">{order.professional?.name || 'Não atribuído'}</p>
                                </div>
                            </div>

                            <div className="mt-auto flex justify-between items-end border-t border-border/50 pt-6">
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Comanda</p>
                                    <p className="text-2xl font-black text-primary uppercase tracking-tighter">R$ {parseFloat(order.total || 0).toFixed(2).replace('.', ',')}</p>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Detalhes</span>
                                    <ClipboardList className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredOrders.length === 0 && (
                <div className="text-center py-32 bg-card rounded-[3rem] border-2 border-dashed border-border shadow-inner">
                    <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground/30">
                        <ShoppingBag className="w-10 h-10" />
                    </div>
                    <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest italic">Nenhuma comanda encontrada no momento.</p>
                </div>
            )}
        </div>
    );
}
