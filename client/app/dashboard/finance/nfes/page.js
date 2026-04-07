'use client';
import { useState, useEffect } from 'react';
import { 
    ScrollText, Search, Filter, Download, AlertCircle, 
    CheckCircle2, Clock, RefreshCcw, ExternalLink, ChevronRight,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import api from '../../../../lib/api';
import { useClientAuth } from '../../../../contexts/ClientAuthContext';

export default function NfeListingPage() {
    const { user, currentBarbershop } = useClientAuth();
    const [nfes, setNfes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        if (currentBarbershop?.id) {
            fetchNfes();
        }
    }, [currentBarbershop, statusFilter]);

    const fetchNfes = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== 'ALL') params.status = statusFilter;
            
            const response = await api.get(`/nfes/shop/${currentBarbershop.id}`, { params });
            setNfes(response.data);
        } catch (error) {
            console.error('Error fetching NFes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async (id) => {
        if (!confirm('Deseja tentar reemitir esta nota fiscal?')) return;
        try {
            await api.post(`/nfes/${id}/retry`);
            alert('Tentativa de reemissão enviada com sucesso!');
            fetchNfes();
        } catch (error) {
            alert('Erro ao reemitir: ' + (error.response?.data?.error || error.message));
        }
    };

    const filteredNfes = nfes.filter(n => 
        n.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
        n.number?.includes(search)
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'EMITTED':
                return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Emitida</span>;
            case 'ERROR':
                return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20"><AlertCircle className="w-3 h-3" /> Erro</span>;
            case 'PROCESSING':
                return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 animate-pulse"><Clock className="w-3 h-3" /> Processando</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-500/20">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ScrollText className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Financeiro</span>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter sm:text-4xl">
                        Notas <span className="text-primary italic">Fiscais</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">Gestão de emissões automáticas de NFS-e.</p>
                </div>
            </div>

            {/* Stats / Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Emitido (Mês)</p>
                    <p className="text-2xl font-black text-white tracking-tighter">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nfes.filter(n => n.status === 'EMITTED').reduce((acc, n) => acc + Number(n.amount), 0))}
                    </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Aguardando/Processando</p>
                    <p className="text-2xl font-black text-blue-400 tracking-tighter">
                        {nfes.filter(n => n.status === 'PROCESSING').length}
                    </p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Erros de Emissão</p>
                    <p className="text-2xl font-black text-red-500 tracking-tighter">
                        {nfes.filter(n => n.status === 'ERROR').length}
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/50 p-4 rounded-3xl border border-slate-800">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Buscar por cliente ou número..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 md:flex-none bg-slate-950/50 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold uppercase tracking-tighter"
                    >
                        <option value="ALL">Todos Status</option>
                        <option value="EMITTED">Emitidas</option>
                        <option value="PROCESSING">Processando</option>
                        <option value="ERROR">Erro</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/30">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data / N°</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-slate-800 rounded-full w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-slate-800 rounded ml-auto w-24"></div></td>
                                    </tr>
                                ))
                            ) : filteredNfes.length > 0 ? (
                                filteredNfes.map((nfe) => (
                                    <tr key={nfe.id} className="hover:bg-slate-800/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-white">
                                                {new Date(nfe.createdAt).toLocaleDateString('pt-BR')}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-mono">
                                                #{nfe.number || '---'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-200">{nfe.client?.name}</p>
                                            <p className="text-[10px] text-slate-500">{nfe.client?.phone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-white">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nfe.amount)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(nfe.status)}
                                            {nfe.errorMsg && nfe.status === 'ERROR' && (
                                                <p className="text-[9px] text-red-400 mt-1 max-w-[150px] truncate" title={nfe.errorMsg}>
                                                    {nfe.errorMsg}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {nfe.status === 'EMITTED' && nfe.pdfUrl && (
                                                    <a 
                                                        href={nfe.pdfUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-slate-800 hover:bg-primary/20 text-slate-400 hover:text-primary rounded-xl transition-all"
                                                        title="Ver PDF"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {nfe.status === 'ERROR' && (
                                                    <button 
                                                        onClick={() => handleRetry(nfe.id)}
                                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                                                        title="Re-tentar Emissão"
                                                    >
                                                        <RefreshCcw className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button className="p-2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-all">
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-slate-900 rounded-full">
                                                <ScrollText className="w-8 h-8 text-slate-700" />
                                            </div>
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Nenhuma nota fiscal encontrada</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
