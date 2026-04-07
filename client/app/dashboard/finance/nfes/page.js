'use client';
import { useState, useEffect } from 'react';
import { 
    ScrollText, Search, Filter, Download, AlertCircle, 
    ArrowLeft, Plus, X, MessageSquare, Mail, Play, Loader2, Info
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

    const [showManualModal, setShowManualModal] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchingClient, setSearchingClient] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    
    const [manualForm, setManualForm] = useState({ 
        amount: '', 
        description: '', 
        date: new Date().toISOString().split('T')[0],
        cpf: '',
        cnpj: ''
    });
    const [manualLoading, setManualLoading] = useState(false);

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

    // Smart Search with Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (clientSearch.length >= 3) {
                handleSearchClients();
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [clientSearch]);

    const handleSearchClients = async () => {
        try {
            setSearchingClient(true);
            const res = await api.get(`/clients/search?barbershopId=${currentBarbershop.id}&search=${clientSearch}`);
            setSearchResults(res.data.data || []);
        } catch (err) {
            console.error('Error searching clients', err);
        } finally {
            setSearchingClient(false);
        }
    };

    const handleSelectClient = (client) => {
        setSelectedClient(client);
        setClientSearch('');
        setSearchResults([]);
        // Pre-fill docs if existing
        setManualForm(prev => ({
            ...prev,
            cpf: client.cpf || '',
            cnpj: client.cnpj || ''
        }));
    };

    const handleOpenManualModal = () => {
        setClientSearch('');
        setSelectedClient(null);
        setManualForm({ 
            amount: '', 
            description: '', 
            date: new Date().toISOString().split('T')[0],
            cpf: '',
            cnpj: ''
        });
        setShowManualModal(true);
    };

    const handleManualSubmit = async (e, type = 'EMAIL') => {
        if (e) e.preventDefault();
        
        if (!selectedClient?.id || !manualForm.amount) {
            return alert('Preencha os campos obrigatórios');
        }

        // Logic B: CPF is required for Nfe
        if (!manualForm.cpf && !manualForm.cnpj) {
            return alert('Informe o CPF ou CNPJ para emitir a nota fiscal.');
        }
        
        setManualLoading(true);
        try {
            const response = await api.post(`/nfes/manual`, {
                barbershopId: currentBarbershop.id,
                clientId: selectedClient.id,
                ...manualForm
            });

            const nfe = response.data;
            
            if (type === 'WA') {
                const message = `Olá ${selectedClient.name}! Aqui está sua nota fiscal da ${currentBarbershop.name}: ${nfe.pdfUrl}`;
                window.open(`https://wa.me/${selectedClient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
            } else if (type === 'PDF') {
                window.open(nfe.pdfUrl, '_blank');
            }

            setShowManualModal(false);
            fetchNfes();
        } catch (error) {
            alert('Erro ao emitir nota: ' + (error.response?.data?.error || error.message));
        } finally {
            setManualLoading(false);
        }
    };

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
                <div>
                    <button 
                        onClick={handleOpenManualModal}
                        className="bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" /> Nova Nota Avulsa
                    </button>
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

            {/* Manual Modal SaaS REFACTOR */}
            {showManualModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowManualModal(false)}></div>
                    <div className="relative bg-[#0d0d0f] border border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Emissão de NFS-e <span className="text-primary italic">Manual</span></h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Foco em serviços e agilidade</p>
                            </div>
                            <button onClick={() => setShowManualModal(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            
                            {/* Step 1: Client Selection */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">1. Buscar Cliente *</label>
                                {!selectedClient ? (
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input 
                                            type="text" 
                                            autoFocus
                                            placeholder="Nome, Telefone ou CPF..."
                                            value={clientSearch}
                                            onChange={(e) => setClientSearch(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        />
                                        {searchingClient && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />}
                                        
                                        {searchResults.length > 0 && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-20">
                                                {searchResults.map(c => (
                                                    <button 
                                                        key={c.id}
                                                        onClick={() => handleSelectClient(c)}
                                                        className="w-full text-left p-4 hover:bg-slate-800 border-b border-slate-800/50 last:border-0 transition-colors flex justify-between items-center"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{c.name}</p>
                                                            <p className="text-[10px] text-slate-500 uppercase font-black">{c.phone || 'Sem telefone'}</p>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-slate-700" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {clientSearch.length >= 3 && !searchingClient && searchResults.length === 0 && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center z-20">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Nenhum cliente encontrado</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase">{selectedClient.name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedClient.phone}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedClient(null)} 
                                            className="text-[10px] text-slate-500 hover:text-red-400 font-black uppercase tracking-widest"
                                        >
                                            Trocar
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Step 2: Documents (Strategy B Capture) */}
                            {selectedClient && (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">CPF (Obrigatório)*</label>
                                            <input 
                                                type="text" 
                                                placeholder="000.000.000-00"
                                                value={manualForm.cpf}
                                                onChange={(e) => setManualForm({...manualForm, cpf: e.target.value})}
                                                className={`w-full bg-slate-900 border ${!selectedClient.cpf ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-slate-800'} rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold`}
                                            />
                                            {!selectedClient.cpf && (
                                                <p className="text-[8px] text-yellow-500 font-black uppercase tracking-widest mt-1.5 ml-1 flex items-center gap-1">
                                                    <Info className="w-2.5 h-2.5" /> Será salvo no cadastro
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">CNPJ (Opcional)</label>
                                            <input 
                                                type="text" 
                                                placeholder="00.000.000/0001-00"
                                                value={manualForm.cnpj}
                                                onChange={(e) => setManualForm({...manualForm, cnpj: e.target.value})}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Descrição do Serviço *</label>
                                            <input 
                                                type="text" 
                                                placeholder="Ex: Corte de Cabelo e Design de Barba"
                                                value={manualForm.description}
                                                onChange={(e) => setManualForm({...manualForm, description: e.target.value})}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Valor (R$) *</label>
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                placeholder="0.00"
                                                value={manualForm.amount}
                                                onChange={(e) => setManualForm({...manualForm, amount: e.target.value})}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-black text-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Data Prestação</label>
                                            <input 
                                                type="date" 
                                                value={manualForm.date}
                                                onChange={(e) => setManualForm({...manualForm, date: e.target.value})}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold uppercase"
                                            />
                                        </div>
                                    </div>

                                    {/* Multi-Channel Execution Section */}
                                    <div className="pt-6 border-t border-slate-800 space-y-3">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest text-center mb-4">Escolha como Despachar:</p>
                                        
                                        <div className="grid grid-cols-3 gap-3">
                                            <button 
                                                onClick={(e) => handleManualSubmit(e, 'EMAIL')}
                                                disabled={manualLoading}
                                                className="flex flex-col items-center gap-2 p-4 bg-slate-900 hover:bg-primary/10 border border-slate-800 hover:border-primary/50 rounded-2xl transition-all group disabled:opacity-50"
                                            >
                                                <Mail className="w-5 h-5 text-slate-500 group-hover:text-primary" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-white">E-mail Auto</span>
                                            </button>
                                            
                                            <button 
                                                onClick={(e) => handleManualSubmit(e, 'WA')}
                                                disabled={manualLoading}
                                                className="flex flex-col items-center gap-2 p-4 bg-slate-900 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition-all group disabled:opacity-50"
                                            >
                                                <MessageSquare className="w-5 h-5 text-slate-500 group-hover:text-emerald-500" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-white">WhatsApp</span>
                                            </button>

                                            <button 
                                                onClick={(e) => handleManualSubmit(e, 'PDF')}
                                                disabled={manualLoading}
                                                className="flex flex-col items-center gap-2 p-4 bg-slate-900 hover:bg-white/10 border border-slate-800 hover:border-white/50 rounded-2xl transition-all group disabled:opacity-50"
                                            >
                                                <Download className="w-5 h-5 text-slate-500 group-hover:text-white" />
                                                <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-white">Baixar PDF</span>
                                            </button>
                                        </div>

                                        {manualLoading && (
                                            <div className="flex items-center justify-center gap-3 py-4 bg-primary/5 border border-primary/20 rounded-2xl animate-pulse">
                                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Processando Emissão Fiscal...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
