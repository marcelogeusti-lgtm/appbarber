'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import { Plus, Search, ShoppingBag, Clock, XCircle, DollarSign, Calendar, ClipboardList, X, Loader2 } from 'lucide-react';
import { ensureArray } from '../../../lib/utils/arrays';
import Pagination from '../../../components/ui/Pagination';
import Link from 'next/link';
import { toast } from 'sonner';

export default function OrdersPage() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('ALL'); // ALL, OPEN, PAID
    const [isCreating, setIsCreating] = useState(false);
    const [quickData, setQuickData] = useState({ guestName: '', phone: '', professionalId: '', serviceId: '' });

    // Pagination States
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);

    // Auth Helper
    const getUser = () => {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    };

    const user = getUser();
    const bId = user?.barbershopId || user?.barbershop?.id || user?.ownedBarbershops?.[0]?.id;

    // Queries
    const { data: ordersData, isLoading: loadingOrders } = useQuery({
        queryKey: ['orders', bId, page, limit],
        queryFn: async () => {
            const res = await api.get(`/orders?barbershopId=${bId}&page=${page}&limit=${limit}`);
            return res.data;
        },
        enabled: !!bId,
    });

    const { data: professionals = [] } = useQuery({
        queryKey: ['professionals', bId],
        queryFn: async () => {
            const res = await api.get(`/professionals?barbershopId=${bId}`);
            return res.data;
        },
        enabled: !!bId,
    });

    const { data: services = [] } = useQuery({
        queryKey: ['services', bId],
        queryFn: async () => {
            const res = await api.get(`/services?barbershopId=${bId}`);
            return res.data;
        },
        enabled: !!bId,
    });

    // Mutation
    const createMutation = useMutation({
        mutationFn: async (payload) => api.post('/orders', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            setIsCreating(false);
            setQuickData({ guestName: '', phone: '', professionalId: '', serviceId: '' });
            toast.success('Comanda aberta com sucesso!');
        },
        onError: (err) => toast.error('Erro ao abrir comanda: ' + (err.response?.data?.message || err.message)),
    });

    const orders = ensureArray(ordersData?.data || ordersData);
    const totalItems = ordersData?.total || 0;
    const totalPages = ordersData?.totalPages || 0;

    const filteredOrders = orders.filter(o => {
        if (filter === 'ALL') return true;
        if (filter === 'OPEN') return o.status === 'OPEN';
        if (filter === 'PAID') return o.status === 'PAID' || o.status === 'CLOSED';
        return true;
    });

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Comandas</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Fluxo de atendimento e vendas presenciais.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    + Nova Comanda
                </button>
            </header>

            {/* Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {['ALL', 'OPEN', 'PAID'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${filter === f
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10'
                            : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                            }`}
                    >
                        {f === 'ALL' ? 'Todas' : f === 'OPEN' ? 'Em Aberto' : 'Finalizadas'}
                    </button>
                ))}
            </div>

            {loadingOrders ? (
                <div className="py-32 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Sincronizando registros...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.map(order => (
                        <Link href={`/dashboard/orders/${order.id}`} key={order.id} className="block group transition-all">
                            <div className="bg-card p-8 rounded-[2.5rem] border border-border group-hover:border-primary/50 relative overflow-hidden flex flex-col h-full shadow-sm hover:shadow-2xl transition-all">
                                <div className={`absolute top-0 right-0 px-4 py-2 font-black text-[8px] uppercase tracking-widest border-l border-b border-border/10 ${order.status === 'OPEN' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                    {order.status === 'OPEN' ? 'EM ABERTO' : 'LIQUIDADO'}
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-black text-xl text-foreground uppercase tracking-tight group-hover:text-primary transition-colors leading-tight truncate">
                                        {order.client?.name || order.guestName || 'Venda Avulsa'}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-8 bg-muted/30 p-4 rounded-2xl border border-border/50">
                                    <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center font-black text-primary border border-border">
                                        {(order.professional?.name || 'P').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Responsável</p>
                                        <p className="text-xs font-bold text-foreground truncate">{order.professional?.name || 'Não atribuído'}</p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-border/50 flex justify-between items-end">
                                    <div>
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Consumo Total</p>
                                        <p className="text-3xl font-black text-primary uppercase tracking-tighter">R$ {parseFloat(order.total || 0).toFixed(2).replace('.', ',')}</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-xl text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                        <ClipboardList className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

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

            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreating(false)} />
                    <div className="relative bg-card w-full max-w-lg rounded-[2.5rem] border border-border shadow-2xl p-10 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black uppercase text-foreground tracking-tighter">Nova <span className="text-primary italic">Comanda</span></h2>
                            <button onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-destructive"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...quickData, serviceIds: [quickData.serviceId], isManual: true, barbershopId: bId }); }} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Cliente</label><input value={quickData.guestName} onChange={e => setQuickData({ ...quickData, guestName: e.target.value })} className="w-full p-4 bg-muted border border-border rounded-xl font-bold outline-none ring-primary/20 focus:ring-2" required placeholder="Nome" /></div>
                                <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Fone</label><input value={quickData.phone} onChange={e => setQuickData({ ...quickData, phone: e.target.value })} className="w-full p-4 bg-muted border border-border rounded-xl font-bold outline-none ring-primary/20 focus:ring-2" required placeholder="(00) 00000-0000" /></div>
                            </div>
                            <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profissional</label>
                                    <select required className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary transition-all" value={quickData.professionalId} onChange={e => setQuickData({ ...quickData, professionalId: e.target.value })}>
                                        <option value="">Selecione</option>
                                        {ensureArray(professionals).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                            </div>
                            <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Serviço</label>
                                    <select required className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary transition-all" value={quickData.serviceId} onChange={e => setQuickData({ ...quickData, serviceId: e.target.value })}>
                                        <option value="">Selecione</option>
                                        {ensureArray(services).map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
                                    </select>
                            </div>
                            <button type="submit" disabled={createMutation.isPending} className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all">ABRIR COMANDA AGORA</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
