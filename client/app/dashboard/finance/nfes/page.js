'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    ScrollText, Search, Filter, Download, AlertCircle, 
    Plus, X, MessageSquare, Mail, Loader2, Info,
    CheckCircle2, Clock, RefreshCcw, ChevronRight
} from 'lucide-react';
import api from '../../../../lib/api';
import { useClientAuth } from '../../../../contexts/ClientAuthContext';
import { toast } from 'sonner';

export default function NfeListingPage() {
    const { currentBarbershop } = useClientAuth();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [activeTab, setActiveTab] = useState('OPERATIONAL'); // 'OPERATIONAL' | 'CONFIG'

    // Fiscal Config State
    const [fiscalConfig, setFiscalConfig] = useState(currentBarbershop?.fiscalConfig || { cnpj: '', im: '', token: '' });
    const isConfigured = !!fiscalConfig?.token;

    // Manual Modal State
    const [showManualModal, setShowManualModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [clientSearch, setClientSearch] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [manualForm, setManualForm] = useState({ 
        amount: '', 
        description: '', 
        date: new Date().toISOString().split('T')[0],
        cpf: '',
        cnpj: ''
    });

    // Queries
    const { data: nfes = [], isLoading: loading } = useQuery({
        queryKey: ['nfes', currentBarbershop?.id, statusFilter],
        queryFn: async () => {
            const params = {};
            if (statusFilter !== 'ALL') params.status = statusFilter;
            const res = await api.get(`/nfes/shop/${currentBarbershop.id}`, { params });
            return res.data;
        },
        enabled: !!currentBarbershop?.id,
    });

    const { data: searchResults = [], isFetching: searchingClient } = useQuery({
        queryKey: ['clients-search', currentBarbershop?.id, clientSearch],
        queryFn: async () => {
            const res = await api.get(`/clients/search?barbershopId=${currentBarbershop.id}&search=${clientSearch}`);
            return res.data.data || [];
        },
        enabled: clientSearch.length >= 3,
    });

    // Mutations
    const manualMutation = useMutation({
        mutationFn: async (payload) => api.post(`/nfes/manual`, payload),
        onSuccess: (nfe, { type }) => {
            queryClient.invalidateQueries({ queryKey: ['nfes'] });
            if (type === 'WA') {
                const msg = `Olá ${selectedClient.name}! Aqui está sua nota fiscal: ${nfe.data.pdfUrl}`;
                window.open(`https://wa.me/${selectedClient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
            } else if (type === 'PDF') {
                window.open(nfe.data.pdfUrl, '_blank');
            }
            setModalStep(3);
            toast.success('Nota Fiscal emitida!');
        },
        onError: (err) => toast.error('Erro na emissão: ' + (err.response?.data?.error || err.message)),
    });

    const saveConfigMutation = useMutation({
        mutationFn: async (config) => api.post(`/barbershops/${currentBarbershop.id}/fiscal-config`, config),
        onSuccess: () => toast.success('Configurações fiscais salvas!'),
        onError: () => toast.error('Erro ao salvar configurações.'),
    });

    const handleSelectClient = (client) => {
        setSelectedClient(client);
        setManualForm(p => ({ ...p, cpf: client.cpf || '', cnpj: client.cnpj || '' }));
    };

    const handleOpenManual = () => {
        setSelectedClient(null);
        setClientSearch('');
        setModalStep(1);
        setManualForm({ amount: '', description: '', date: new Date().toISOString().split('T')[0], cpf: '', cnpj: '' });
        setShowManualModal(true);
    };

    const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'EMITTED': return <span className="flex items-center gap-1.5 px-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 rounded-full"><CheckCircle2 className="w-3 h-3" /> Emitida</span>;
            case 'ERROR': return <span className="flex items-center gap-1.5 px-2 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20 rounded-full"><AlertCircle className="w-3 h-3" /> Erro</span>;
            case 'PROCESSING': return <span className="flex items-center gap-1.5 px-2 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 rounded-full animate-pulse"><Clock className="w-3 h-3" /> Processando</span>;
            default: return <span className="px-2 bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-500/20 rounded-full">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] p-4 md:p-8 space-y-8 selection:bg-primary/20">
            {/* SaaS Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg"><ScrollText className="w-5 h-5" /></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Financeiro SaaS</span>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Fluxo <span className="text-primary italic">Fiscal</span></h1>
                    <p className="text-slate-400 text-sm font-medium">Gestão automatizada de emissões NFS-e.</p>
                </div>
                <button onClick={handleOpenManual} className="bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs transition-all shadow-xl shadow-primary/20 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Emitir Nota Avulsa
                </button>
            </header>

            {/* Status Indicator */}
            <div className={`p-5 rounded-2xl border flex items-center justify-between ${isConfigured ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20 animate-pulse'}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${isConfigured ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                        {isConfigured ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                    </div>
                    <div>
                        <p className={`text-[11px] font-black uppercase tracking-widest ${isConfigured ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {isConfigured ? 'Ambiente Fiscal Ativo' : 'Ação Necessária: Perfil Incompleto'}
                        </p>
                        <p className="text-[12px] text-slate-400">
                            {isConfigured ? 'As emissões estão automatizadas para agendamentos concluídos.' : 'Configure seu Token FocusNFe para habilitar emissões reais.'}
                        </p>
                    </div>
                </div>
                {!isConfigured && activeTab === 'OPERATIONAL' && (
                    <button onClick={() => setActiveTab('CONFIG')} className="text-[10px] font-black uppercase text-amber-500 underline ml-4">Configurar Agora</button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-slate-800/50">
                {['OPERATIONAL', 'CONFIG'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`pb-4 text-[10px] font-black uppercase tracking-widest relative transition-colors ${activeTab === t ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}>
                        {t === 'OPERATIONAL' ? 'Listagem de Notas' : 'Ajustes Fiscais'}
                        {activeTab === t && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />}
                    </button>
                ))}
            </div>

            {activeTab === 'OPERATIONAL' ? (
                <>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input placeholder="Buscar por cliente ou número..." className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 text-sm text-white focus:ring-2 ring-primary/20 outline-none" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-[10px] font-black uppercase text-white outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="ALL">Todos Status</option>
                            <option value="EMITTED">Emitidas</option>
                            <option value="PROCESSING">Processando</option>
                            <option value="ERROR">Erros</option>
                        </select>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950/50 border-b border-slate-800">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data / Doc</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/30">
                                    {loading ? Array(3).fill(0).map((_, i) => <tr key={i} className="animate-pulse opacity-50"><td className="p-8 text-center" colSpan="5">...</td></tr>) : nfes.map(n => (
                                        <tr key={n.id} className="hover:bg-slate-800/20 group transition-all">
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-white">{new Date(n.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-slate-500 font-mono">#{n.number || '---'}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-slate-200 uppercase">{n.client?.name}</p>
                                                <p className="text-[10px] text-slate-500">{n.client?.phone}</p>
                                            </td>
                                            <td className="px-8 py-6 font-black text-white">{formatBRL(n.amount)}</td>
                                            <td className="px-8 py-6">{getStatusBadge(n.status)}</td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {n.pdfUrl && <a href={n.pdfUrl} target="_blank" className="p-2.5 bg-slate-800 hover:bg-primary/20 text-slate-400 hover:text-primary rounded-xl transition-all"><Download className="w-4 h-4" /></a>}
                                                    {n.status === 'ERROR' && <button className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"><RefreshCcw className="w-4 h-4" /></button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-12 text-center animate-in fade-in duration-500">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Perfil Fiscal da Barbearia</h3>
                            <p className="text-slate-400 text-sm">Configure sua integração FocusNFe para emitir notas reais.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/20 pb-2">Empresa</h4>
                                <div className="space-y-4">
                                    <div className="space-y-1.5"><label className="text-[10px] uppercase font-black text-slate-500 ml-1">CNPJ</label><input className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold" value={fiscalConfig.cnpj} onChange={e => setFiscalConfig(p => ({ ...p, cnpj: e.target.value }))} /></div>
                                    <div className="space-y-1.5"><label className="text-[10px] uppercase font-black text-slate-500 ml-1">Inscrição Municipal</label><input className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold" value={fiscalConfig.im} onChange={e => setFiscalConfig(p => ({ ...p, im: e.target.value }))} /></div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/20 pb-2">API FocusNFe</h4>
                                <div className="space-y-1.5"><label className="text-[10px] uppercase font-black text-slate-500 ml-1">Token de Acesso</label><input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold" value={fiscalConfig.token} onChange={e => setFiscalConfig(p => ({ ...p, token: e.target.value }))} /></div>
                                <button onClick={() => saveConfigMutation.mutate(fiscalConfig)} className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest mt-4 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">Salvar Configurações</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Modal SaaS REFACTOR */}
            {showManualModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowManualModal(false)} />
                    <div className="relative bg-[#0d0d0f] border border-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Emissão <span className="text-primary italic">Manual</span></h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Passo {modalStep} de 3</p>
                            </div>
                            <button onClick={() => setShowManualModal(false)} className="p-2 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="flex gap-2 mb-10">
                            {[1, 2, 3].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${modalStep >= s ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' : 'bg-slate-800'}`} />)}
                        </div>

                        <div className="space-y-6">
                            {modalStep === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input autoFocus placeholder="Buscar Cliente (Nome, CPF...)" className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 text-sm text-white outline-none" value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
                                        {searchingClient && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />}
                                        {searchResults.length > 0 && !selectedClient && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden z-20 max-h-40 overflow-y-auto">
                                                {searchResults.map(c => <button key={c.id} onClick={() => handleSelectClient(c)} className="w-full text-left p-4 hover:bg-slate-800 text-sm font-bold text-white border-b border-slate-800/50 last:border-0">{c.name}</button>)}
                                            </div>
                                        )}
                                    </div>
                                    {selectedClient && (
                                        <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl space-y-4">
                                            <div className="flex justify-between items-center"><p className="text-sm font-black text-white uppercase">{selectedClient.name}</p><button onClick={() => setSelectedClient(null)} className="text-[10px] font-black text-slate-500 uppercase underline">Trocar</button></div>
                                            <div className="space-y-1.5"><label className="text-[9px] font-black text-slate-500 uppercase ml-1">CPF (Obrigatório)*</label><input className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold text-xs" value={manualForm.cpf} onChange={e => setManualForm(p => ({ ...p, cpf: e.target.value }))} /></div>
                                            <button onClick={() => setModalStep(2)} className="w-full bg-primary text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest mt-2">Seguir para Detalhes</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {modalStep === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-4">
                                        <input placeholder="Descrição do Serviço" className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white font-bold" value={manualForm.description} onChange={e => setManualForm(p => ({ ...p, description: e.target.value }))} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="number" placeholder="Valor R$" className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white font-black" value={manualForm.amount} onChange={e => setManualForm(p => ({ ...p, amount: e.target.value }))} />
                                            <input type="date" className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white font-bold uppercase text-[10px]" value={manualForm.date} onChange={e => setManualForm(p => ({ ...p, date: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button disabled={manualMutation.isPending} onClick={() => manualMutation.mutate({ ...manualForm, barbershopId: currentBarbershop.id, clientId: selectedClient.id, type: 'EMAIL' })} className="flex flex-col items-center gap-2 p-4 bg-slate-900 border border-slate-800 hover:border-primary/50 rounded-2xl group"><Mail className="w-5 h-5 text-slate-500 group-hover:text-primary" /><span className="text-[8px] font-black uppercase">E-mail</span></button>
                                        <button disabled={manualMutation.isPending} onClick={() => manualMutation.mutate({ ...manualForm, barbershopId: currentBarbershop.id, clientId: selectedClient.id, type: 'WA' })} className="flex flex-col items-center gap-2 p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl group"><MessageSquare className="w-5 h-5 text-slate-500 group-hover:text-emerald-500" /><span className="text-[8px] font-black uppercase">Whats</span></button>
                                        <button disabled={manualMutation.isPending} onClick={() => manualMutation.mutate({ ...manualForm, barbershopId: currentBarbershop.id, clientId: selectedClient.id, type: 'PDF' })} className="flex flex-col items-center gap-2 p-4 bg-slate-900 border border-slate-800 hover:border-white/50 rounded-2xl group"><Download className="w-5 h-5 text-slate-500 group-hover:text-white" /><span className="text-[8px] font-black uppercase">PDF</span></button>
                                    </div>
                                    {manualMutation.isPending && <div className="flex items-center justify-center gap-2 text-primary animate-pulse py-2"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-[9px] font-black uppercase">Emitindo Nota Fiscal...</span></div>}
                                </div>
                            )}

                            {modalStep === 3 && (
                                <div className="text-center space-y-8 py-10 animate-in zoom-in-95 duration-500">
                                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-12 h-12 text-emerald-500" /></div>
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Sucesso Total!</h4>
                                        <p className="text-slate-400 text-sm">Sua nota fiscal foi processada e enviada.</p>
                                    </div>
                                    <button onClick={() => setShowManualModal(false)} className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">Concluir</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
