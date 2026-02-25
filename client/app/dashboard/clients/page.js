'use client';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, User, Filter, MoreHorizontal, Eye, Mail, Phone, Calendar, Plus, Trash2, AlertCircle, Users } from 'lucide-react';
import api from '../../../lib/api';
import ClientDetailsModal from '../../../components/ClientDetailsModal';
import NewClientModal from '../../../components/NewClientModal';

export default function ClientsPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [barbershopId, setBarbershopId] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                const bId = parsedUser.barbershop?.id || parsedUser.barbershopId || parsedUser.ownedBarbershops?.[0]?.id;
                setBarbershopId(bId);
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
    }, []);

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ['clients', barbershopId],
        queryFn: async () => {
            if (!barbershopId) return [];
            const res = await api.get(`/clients?barbershopId=${barbershopId}`);
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: !!barbershopId,
    });

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (date) => {
        if (!date) return 'Nunca';
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const handleDelete = async (clientId) => {
        if (!confirm('Tem certeza que deseja remover este cliente da sua lista?')) return;

        try {
            await api.delete(`/clients/${clientId}?barbershopId=${barbershopId}`);
            queryClient.invalidateQueries(['clients', barbershopId]);
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Erro ao remover cliente.');
        }
    };

    // Checks if there's no data AND the query is running
    const isInitialLoading = isLoading && clients.length === 0;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-3xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Gestão de Clientes</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Acompanhe histórico, gastos e fidelidade da sua base.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsNewClientModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Novo Cliente
                </button>
            </header>

            {/* Filters */}
            <div className="bg-card p-6 rounded-[2rem] border border-border flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, telefone ou email..."
                        className="w-full bg-background border border-border rounded-xl py-4 pl-12 pr-4 text-sm text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border border-border">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{filteredClients.length} Filtrados</span>
                </div>
            </div>

            {/* List */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cliente</th>
                                <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contato</th>
                                <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Última Visita</th>
                                <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gasto Total</th>
                                <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isInitialLoading ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando clientes...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center">
                                        <p className="text-muted-foreground italic font-black uppercase text-[10px] tracking-widest">Nenhum cliente disponível no momento</p>
                                    </td>
                                </tr>
                            ) : filteredClients.map(client => (
                                <tr key={client.id} className="hover:bg-muted/10 transition-colors group border-b border-border/50 last:border-0">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border text-primary font-black overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                                                {client.avatarUrl ? (
                                                    <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover" />
                                                ) : <User className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{client.name}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Desde {formatDate(client.createdAt)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="space-y-1.5">
                                            {client.phone && (
                                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                    <Phone className="w-3 h-3 text-primary" />
                                                    <span>{client.phone}</span>
                                                </div>
                                            )}
                                            {client.email && (
                                                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                    <Mail className="w-3 h-3 text-primary" />
                                                    <span className="truncate max-w-[150px]">{client.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-sm font-black text-foreground/80">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span>{formatDate(client.lastVisit)}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-lg font-black text-primary uppercase tracking-tighter">
                                            {formatCurrency(client.totalSpent)}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => setSelectedClient(client)}
                                                className="p-3 bg-muted text-muted-foreground hover:text-foreground hover:bg-primary/20 hover:border-primary/50 border border-transparent rounded-xl transition-all"
                                                title="Ver Detalhes"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client.id)}
                                                className="p-3 bg-muted text-muted-foreground hover:text-destructive hover:bg-destructive/20 hover:border-destructive/50 border border-transparent rounded-xl transition-all"
                                                title="Remover Cliente"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            <ClientDetailsModal
                isOpen={!!selectedClient}
                onClose={() => setSelectedClient(null)}
                clientId={selectedClient?.id}
                user={user}
            />

            <NewClientModal
                isOpen={isNewClientModalOpen}
                onClose={() => setIsNewClientModalOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries(['clients', barbershopId]);
                }}
                barbershopId={barbershopId}
            />
        </div>
    );
}
