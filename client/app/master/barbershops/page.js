'use client';
import { useState, useEffect } from 'react';
import { Store, MoreVertical, Search, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../../../lib/api';

export default function MasterBarbershops() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            const res = await api.get('/barbershops');
            setShops(res.data);
        } catch (error) {
            console.error('Error fetching barbershops:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async (id, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        if (!confirm(`Tem certeza que deseja mudar o status desta barbearia para ${newStatus}?`)) return;
        
        // This endpoint doesn't exist yet, but let's mock it
        try {
            // await api.put(`/barbershops/${id}/status`, { status: newStatus });
            // Mocking update:
            setShops(shops.map(s => s.id === id ? { ...s, subscriptionStatus: newStatus } : s));
            alert('Apenas simulação visual. O endpoint de suspensão precisa ser criado no backend.');
        } catch (error) {
            console.error(error);
        }
    };

    const filteredShops = shops.filter(shop => 
        shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        shop.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusConfig = (status) => {
        switch(status) {
            case 'ACTIVE': return { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, label: 'Ativo' };
            case 'TRIAL': return { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: CheckCircle2, label: 'Trial' };
            case 'OVERDUE': return { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: AlertCircle, label: 'Atrasado' };
            case 'BLOCKED': return { color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: ShieldAlert, label: 'Bloqueado' };
            default: return { color: 'text-white/40 bg-white/5 border-white/10', icon: Store, label: status };
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Barbearias</h1>
                    <p className="text-white/40 text-sm font-medium mt-1">Gerencie seus inquilinos e assinaturas.</p>
                </div>
                
                <div className="relative w-full md:w-72">
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou dono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                    <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            {/* List */}
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#1A1A1A] text-white/40 font-bold text-[10px] uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-2xl">Barbearia</th>
                                <th className="px-6 py-4">Dono</th>
                                <th className="px-6 py-4">Plano</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Vencimento</th>
                                <th className="px-6 py-4 rounded-tr-2xl text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-white/40">Carregando...</td>
                                </tr>
                            ) : filteredShops.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-white/40">Nenhuma barbearia encontrada.</td>
                                </tr>
                            ) : (
                                filteredShops.map(shop => {
                                    const st = getStatusConfig(shop.subscriptionStatus);
                                    const StatusIcon = st.icon;
                                    return (
                                        <tr key={shop.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/20">
                                                        <Store className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{shop.name}</p>
                                                        <p className="text-[10px] text-white/40 font-mono">/{shop.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-white">{shop.owner?.name}</p>
                                                <p className="text-[10px] text-white/40">{shop.owner?.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                                                    {shop.saasPlan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-widest ${st.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white/60 text-xs font-mono">
                                                {shop.nextBillingDate ? new Date(shop.nextBillingDate).toLocaleDateString('pt-BR') : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleSuspend(shop.id, shop.subscriptionStatus)}
                                                    className="px-3 py-1 bg-[#1A1A1A] border border-white/10 hover:bg-white/10 text-white rounded text-[10px] font-bold uppercase transition-all"
                                                >
                                                    {shop.subscriptionStatus === 'ACTIVE' ? 'Suspender' : 'Ativar'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
