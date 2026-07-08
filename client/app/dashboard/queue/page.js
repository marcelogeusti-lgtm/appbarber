'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ListOrdered, Plus, PhoneCall, Check, X, Clock, UserPlus, Scissors } from 'lucide-react';
import api from '../../../lib/api';

export default function QueuePage() {
    const queryClient = useQueryClient();
    const [barbershopId, setBarbershopId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) { try { const p = JSON.parse(u); setBarbershopId(p.barbershopId || p.barbershop?.id || p.ownedBarbershops?.[0]?.id); } catch (e) { } }
    }, []);

    const { data = { waiting: [], history: [] }, isLoading } = useQuery({
        queryKey: ['queue', barbershopId],
        queryFn: async () => {
            if (!barbershopId) return { waiting: [], history: [] };
            const res = await api.get(`/queue?barbershopId=${barbershopId}`);
            return res.data;
        },
        enabled: !!barbershopId,
        refetchInterval: 15000, // atualiza a fila sozinho
    });

    const refresh = () => queryClient.invalidateQueries({ queryKey: ['queue', barbershopId] });

    const setStatus = async (id, status) => {
        try { await api.put(`/queue/${id}/status`, { status }); refresh(); }
        catch (e) { alert('Erro ao atualizar a fila.'); }
    };
    const callNext = async () => {
        try { await api.post('/queue/call-next', { barbershopId }); refresh(); }
        catch (e) { alert(e.response?.data?.message || 'Não há ninguém aguardando.'); }
    };

    const waiting = data.waiting || [];
    const fmtTime = (d) => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl"><ListOrdered className="w-8 h-8" /></div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Ordem de Chegada</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Fila do dia para quem chega sem agendar.</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={callNext} disabled={waiting.filter(w => w.status === 'WAITING').length === 0} className="bg-primary text-primary-foreground px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-40">
                        <PhoneCall className="w-4 h-4" /> Chamar Próximo
                    </button>
                    <button onClick={() => setShowForm(true)} className="bg-background border border-border text-foreground px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-primary/40 transition-all flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Adicionar
                    </button>
                </div>
            </header>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-6">
                <Kpi label="Aguardando" value={waiting.filter(w => w.status === 'WAITING').length} />
                <Kpi label="Chamados" value={waiting.filter(w => w.status === 'CALLED').length} />
                <Kpi label="Atendidos hoje" value={(data.history || []).filter(h => h.status === 'ATTENDED').length} />
            </div>

            {/* Fila */}
            <div className="space-y-3">
                {isLoading && <p className="text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest py-8">Carregando fila...</p>}
                {!isLoading && waiting.length === 0 && (
                    <div className="bg-card border border-dashed border-border rounded-xl p-14 text-center text-muted-foreground font-medium italic">
                        Fila vazia. Clique em "Adicionar" quando um cliente chegar.
                    </div>
                )}
                {waiting.map((e, idx) => (
                    <div key={e.id} className={`bg-card border rounded-xl p-5 flex items-center gap-5 shadow-sm transition-all ${e.status === 'CALLED' ? 'border-primary ring-1 ring-primary/30' : 'border-border'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${e.status === 'CALLED' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>{idx + 1}</div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-foreground uppercase tracking-tight truncate">{e.clientName}
                                {e.status === 'CALLED' && <span className="ml-2 text-[9px] font-black text-primary uppercase tracking-widest animate-pulse">chamado</span>}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] text-muted-foreground font-medium">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Chegou {fmtTime(e.arrivedAt)}</span>
                                {e.serviceName && <span className="flex items-center gap-1"><Scissors className="w-3 h-3" /> {e.serviceName}</span>}
                                {e.professionalName && <span>com {e.professionalName}</span>}
                                {e.clientPhone && <span>{e.clientPhone}</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {e.status === 'WAITING' && (
                                <button onClick={() => setStatus(e.id, 'CALLED')} title="Chamar" className="px-4 py-2.5 rounded-lg border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all">Chamar</button>
                            )}
                            <button onClick={() => setStatus(e.id, 'ATTENDED')} title="Marcar como atendido" className="p-2.5 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setStatus(e.id, 'CANCELLED')} title="Remover da fila" className="p-2.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all"><X className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Histórico do dia */}
            {(data.history || []).length > 0 && (
                <div>
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 border-l-4 border-border pl-3">Histórico de hoje</h3>
                    <div className="bg-card border border-border rounded-xl divide-y divide-border/50">
                        {data.history.map((h) => (
                            <div key={h.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${h.status === 'ATTENDED' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{h.status === 'ATTENDED' ? 'Atendido' : 'Cancelado'}</span>
                                <span className="font-bold text-foreground flex-1 truncate">{h.clientName}</span>
                                <span className="text-[11px] text-muted-foreground">{fmtTime(h.arrivedAt)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showForm && <AddModal barbershopId={barbershopId} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); refresh(); }} />}
        </div>
    );
}

function Kpi({ label, value }) {
    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</p>
            <p className="text-3xl font-black tabular-nums text-primary">{value}</p>
        </div>
    );
}

function AddModal({ barbershopId, onClose, onSaved }) {
    const [form, setForm] = useState({ clientName: '', clientPhone: '', professionalId: 'all', serviceName: '' });
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const { data: pros = [] } = useQuery({
        queryKey: ['queue-pros', barbershopId],
        queryFn: async () => {
            const res = await api.get(`/professionals?barbershopId=${barbershopId}`);
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        },
        enabled: !!barbershopId,
    });

    const save = async () => {
        if (!form.clientName.trim()) { alert('Informe o nome.'); return; }
        setSaving(true);
        try { await api.post('/queue', { ...form, barbershopId }); onSaved(); }
        catch (e) { alert(e.response?.data?.message || 'Erro ao adicionar.'); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-5" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Adicionar à Fila</h2>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                    <input value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="Nome do cliente" className="qinput" autoFocus />
                    <input value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} placeholder="Telefone (opcional)" className="qinput" />
                    <input value={form.serviceName} onChange={e => set('serviceName', e.target.value)} placeholder="Serviço (opcional). Ex.: Corte + Barba" className="qinput" />
                    <select value={form.professionalId} onChange={e => set('professionalId', e.target.value)} className="qinput">
                        <option value="all">Qualquer profissional</option>
                        {pros.map(p => <option key={p.id} value={p.userId || p.id}>{p.name || p.user?.name}</option>)}
                    </select>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-4 rounded-xl border border-border text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all">Cancelar</button>
                    <button onClick={save} disabled={saving} className="flex-1 py-4 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50">{saving ? 'Adicionando...' : 'Adicionar'}</button>
                </div>
                <style jsx>{`
                    .qinput { width:100%; background:hsl(var(--background)); border:1px solid hsl(var(--border)); border-radius:0.75rem; padding:0.85rem 1rem; font-size:0.85rem; font-weight:700; color:hsl(var(--foreground)); outline:none; }
                    .qinput:focus { box-shadow:0 0 0 2px hsl(var(--primary)); }
                `}</style>
            </div>
        </div>
    );
}
