'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Plus, Search, ShoppingBag, Clock, XCircle, DollarSign, Calendar, ClipboardList, X } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import Link from 'next/link';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, OPEN, PAID

    // For "Quick Create"
    const [isCreating, setIsCreating] = useState(false);
    const [quickData, setQuickData] = useState({ guestName: '', phone: '', professionalId: '', serviceId: '' });

    // Pagination States
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [professionals, setProfessionals] = useState([]);
    const [services, setServices] = useState([]);
    const [creatingLoading, setCreatingLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [page, limit]);

    const fetchData = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            const [ordersRes, prosRes, servicesRes] = await Promise.all([
                api.get(`/orders?barbershopId=${bId}&page=${page}&limit=${limit}`),
                api.get(`/professionals?barbershopId=${bId}`),
                api.get(`/services?barbershopId=${bId}`)
            ]);

            setOrders(Array.isArray(ordersRes.data.data) ? ordersRes.data.data : []);
            setTotalItems(ordersRes.data.total || 0);
            setTotalPages(ordersRes.data.totalPages || 0);
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
        <div className="space-y-6 pb-20">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-primary/10 text-primary rounded-xl sm:rounded-2xl">
                        <ShoppingBag className="w-5 h-5 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-foreground">Comandas & Pedidos</h1>
                        <p className="text-muted-foreground text-xs sm:text-sm font-medium italic hidden sm:block">Gerencie as comandas abertas e os fechamentos do dia.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Nova Comanda
                </button>
            </header>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {['ALL', 'OPEN', 'PAID'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${filter === f
                            ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                            : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                            }`}
                    >
                        {f === 'ALL' ? 'Todas' : f === 'OPEN' ? 'Em Aberto' : 'Finalizadas'}
                    </button>
                ))}
            </div>

            {/* Quick Create Modal Overlay */}
            {isCreating && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-border animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
                        <div className="p-5 sm:p-8 border-b border-border flex justify-between items-center bg-muted/20">
                            <h2 className="text-base sm:text-xl font-black uppercase text-foreground tracking-widest">Nova Comanda Rápida</h2>
                            <button onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleQuickCreate} className="p-5 sm:p-8 space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cliente</label>
                                    <input
                                        value={quickData.guestName}
                                        onChange={e => setQuickData({ ...quickData, guestName: e.target.value })}
                                        className="w-full p-3 sm:p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition text-sm"
                                        required
                                        placeholder="Nome"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Telefone</label>
                                    <input
                                        value={quickData.phone}
                                        onChange={e => setQuickData({ ...quickData, phone: e.target.value })}
                                        className="w-full p-3 sm:p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition text-sm"
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
                                    className="w-full p-3 sm:p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition appearance-none text-sm"
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
                                    className="w-full p-3 sm:p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition appearance-none text-sm"
                                    required
                                >
                                    <option value="">Selecione o serviço</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button
                                    type="submit"
                                    disabled={creatingLoading}
                                    className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {creatingLoading ? 'ABRINDO...' : 'ABRIR COMANDA AGORA'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Orders List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredOrders.map(order => (
                    <Link href={`/dashboard/orders/${order.id}`} key={order.id} className="block group">
                        <div className="bg-card p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-border hover:border-primary/50 transition-all relative group overflow-hidden flex flex-col h-full shadow-sm hover:shadow-xl hover:shadow-primary/5">
                            <div className={`absolute top-0 right-0 px-4 py-2 ${order.status === 'OPEN' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'} font-black text-[8px] uppercase tracking-widest border-l border-b border-border/10`}>
                                {order.status === 'OPEN' ? 'EM ABERTO' : 'LIQUIDADO'}
                            </div>

                            <div className="mb-4 sm:mb-6">
                                <h3 className="font-black text-lg sm:text-xl text-foreground uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">
                                    {order.client?.name || order.guestName || 'Venda Avulsa'}
                                </h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 mt-1.5">
                                    <Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mb-5 sm:mb-8 bg-muted/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-border/50">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-background rounded-xl flex items-center justify-center font-black text-primary border border-border text-base shadow-inner">
                                    {(order.professional?.name || 'P').charAt(0)}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Profissional</p>
                                    <p className="text-xs font-bold text-foreground">{order.professional?.name || 'Não atribuído'}</p>
                                </div>
                            </div>

                            <div className="mt-auto flex justify-between items-end border-t border-border/50 pt-4">
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Comanda</p>
                                    <p className="text-xl sm:text-2xl font-black text-primary uppercase tracking-tighter">R$ {parseFloat(order.total || 0).toFixed(2).replace('.', ',')}</p>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Detalhes</span>
                                    <ClipboardList className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm mt-8">
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={(l) => { setLimit(l); setPage(1); }}
                    label="comandas"
                />
            </div>

            {filteredOrders.length === 0 && (
                <div className="text-center py-20 sm:py-32 bg-card rounded-2xl sm:rounded-[3rem] border-2 border-dashed border-border shadow-inner">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 text-muted-foreground/30">
                        <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                    <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest italic">Nenhuma comanda encontrada no momento.</p>
                </div>
            )}
        </div>
    );
}
