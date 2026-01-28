'use client';
import { useState, useEffect } from 'react';
import { Search, User, Filter, MoreHorizontal, Eye, Mail, Phone, Calendar, Plus, Trash2, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';
import ClientDetailsModal from '../../../components/ClientDetailsModal';
import NewClientModal from '../../../components/NewClientModal';

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                // Ensure we have a barbershopId
                if (parsedUser.barbershop?.id) {
                    fetchClients(parsedUser.barbershop.id);
                } else if (parsedUser.barbershopId) {
                    fetchClients(parsedUser.barbershopId);
                } else {
                    console.warn("No barbershop ID found for user");
                    setLoading(false);
                }
            } catch (e) {
                console.error("Error parsing user data", e);
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const fetchClients = async (barbershopId) => {
        try {
            const res = await api.get(`/clients?barbershopId=${barbershopId}`);
            if (Array.isArray(res.data)) {
                setClients(res.data);
            } else {
                setClients([]);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

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
            const bId = user?.barbershop?.id || user?.barbershopId;
            await api.delete(`/clients/${clientId}?barbershopId=${bId}`);
            fetchClients(bId);
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Erro ao remover cliente.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white italic tracking-tight">Gestão de Clientes</h1>
                    <p className="text-slate-400 text-sm mt-1">Visualize e gerencie a base de clientes da barbearia</p>
                </div>
                <button
                    onClick={() => setIsNewClientModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Novo Cliente
                </button>
            </div>

            {/* Filters */}
            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, telefone ou email..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/50">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contato</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Última Visita</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Gasto</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">
                                        <div className="flex justify-center">
                                            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">
                                        Nenhum cliente encontrado.
                                    </td>
                                </tr>
                            ) : filteredClients.map(client => (
                                <tr key={client.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400 font-bold overflow-hidden">
                                                {client.avatarUrl ? (
                                                    <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover" />
                                                ) : client.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{client.name}</p>
                                                <p className="text-[10px] text-slate-500">Desde {formatDate(client.createdAt)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            {client.phone && (
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <Phone className="w-3 h-3" />
                                                    <span>{client.phone}</span>
                                                </div>
                                            )}
                                            {client.email && (
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <Mail className="w-3 h-3" />
                                                    <span>{client.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-300">
                                            <Calendar className="w-4 h-4 text-slate-600" />
                                            <span>{formatDate(client.lastVisit)}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm font-bold text-emerald-500">
                                            {formatCurrency(client.totalSpent)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedClient(client)}
                                                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                                                title="Ver Detalhes"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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
                    const id = user?.barbershop?.id || user?.barbershopId;
                    if (id) fetchClients(id);
                }}
                barbershopId={user?.barbershop?.id || user?.barbershopId}
            />
        </div>
    );
}
