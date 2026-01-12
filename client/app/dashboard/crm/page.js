'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    Users, Search, Filter, MessageCircle, Calendar,
    MoreHorizontal, Star, AlertCircle, CheckCircle, Package
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CrmPage() {
    const { data: session } = useSession();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, NEW, RECURRING, ACTIVE_PACKAGE, INACTIVE, ABSENT
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (session?.user) {
            fetchClients();
        }
    }, [session, filter]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            // Build Query
            const params = new URLSearchParams();
            if (filter !== 'ALL') params.append('status', filter);
            if (searchTerm) params.append('search', searchTerm);

            // Pass Barbershop Context (Assuming Owner/Admin for now)
            // If user has multiple shops, ideally a selector is needed context-wide.
            // Falling back to first owned shop or worked shop.
            const shopId = session.user.barbershopId || session.user.ownedBarbershops?.[0]?.id;
            if (shopId) params.append('barbershopId', shopId);

            const res = await fetch(`/api/crm/clients?${params.toString()}`, {
                headers: { Authorization: `Bearer ${session.accessToken}` } // If needed, or reliance on Cookie
            });

            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } catch (error) {
            console.error('Failed to fetch clients', error);
        } finally {
            setLoading(false);
        }
    };

    const statusConfig = {
        'NEW': { label: 'Novo', color: 'bg-blue-500/10 text-blue-500', icon: Star },
        'RECURRING': { label: 'Recorrente', color: 'bg-green-500/10 text-green-500', icon: CheckCircle },
        'ACTIVE_PACKAGE': { label: 'Pacote Ativo', color: 'bg-purple-500/10 text-purple-500', icon: Package },
        'INACTIVE': { label: 'Inativo', color: 'bg-gray-500/10 text-gray-400', icon: AlertCircle },
        'ABSENT': { label: 'Faltante', color: 'bg-red-500/10 text-red-500', icon: AlertCircle },
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-brand-primary" />
                        Gestão de Relacionamento (CRM)
                    </h1>
                    <p className="text-gray-400 text-sm">Gerencie seus clientes, identifique oportunidades e fidelize.</p>
                </div>
                <button className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                    <Users className="w-4 h-4" />
                    Adicionar Manualmente
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">

                {/* Status Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
                    {[
                        { id: 'ALL', label: 'Todos' },
                        { id: 'Novos', label: 'Novos' },
                        { id: 'Recorrentes', label: 'Recorrentes' },
                        { id: 'Pacote', label: 'Com Pacote' },
                        { id: 'Inativos', label: 'Inativos' },
                        { id: 'Faltantes', label: 'Faltantes' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === tab.id
                                    ? 'bg-brand-primary text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchClients()}
                        className="w-full bg-gray-800 border-none rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-brand-primary"
                    />
                </div>
            </div>

            {/* Client List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Carregando carteira de clientes...</div>
                ) : clients.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
                        <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-400">Nenhum cliente encontrado com este filtro.</p>
                    </div>
                ) : (
                    clients.map(item => {
                        const status = statusConfig[item.status] || statusConfig['NEW'];
                        const StatusIcon = status.icon;

                        return (
                            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-700 transition-colors">

                                {/* Profile Info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                                        {item.client.avatarUrl ? (
                                            <img src={item.client.avatarUrl} alt={item.client.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg">
                                                {item.client.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium text-base">{item.client.name}</h3>
                                        <p className="text-gray-500 text-xs flex items-center gap-2">
                                            {item.client.phone || 'Sem telefone'}
                                            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                            Última visita: {item.lastVisit ? format(new Date(item.lastVisit), "d 'de' MMM", { locale: ptBR }) : 'Nunca'}
                                        </p>
                                    </div>
                                </div>

                                {/* CRM Stats/Badge */}
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Visitas</p>
                                        <p className="text-white font-medium">{item.totalVisits}</p>
                                    </div>

                                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${status.color}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {status.label}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-800 w-full md:w-auto justify-end">
                                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" title="Chat">
                                        <MessageCircle className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" title="Agendar">
                                        <Calendar className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" title="Detalhes">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>

                            </div>
                        );
                    })
                )}
            </div>

        </div>
    );
}
