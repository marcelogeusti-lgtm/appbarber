'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, ShieldX, Plus, X, Search, UserX } from 'lucide-react';
import api from '../../../lib/api';

export default function RestrictionsPage() {
    const queryClient = useQueryClient();
    const [barbershopId, setBarbershopId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) { try { const p = JSON.parse(u); setBarbershopId(p.barbershopId || p.barbershop?.id || p.ownedBarbershops?.[0]?.id); } catch (e) { } }
    }, []);

    const { data: rows = [], isLoading } = useQuery({
        queryKey: ['restrictions', barbershopId],
        queryFn: async () => {
            const res = await api.get(`/restrictions?barbershopId=${barbershopId}`);
            return res.data;
        },
        enabled: !!barbershopId,
    });
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['restrictions', barbershopId] });

    const unblock = async (id) => {
        if (!confirm('Desbloquear este cliente?')) return;
        try { await api.delete(`/restrictions/${id}`); refresh(); }
        catch (e) { alert('Erro ao desbloquear.'); }
    };

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-destructive/10 text-destructive rounded-xl"><ShieldX className="w-8 h-8" /></div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Lista de Restrições</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Clientes bloqueados para novos agendamentos (ex.: muitos no-shows).</p>
                    </div>
                </div>
                <button onClick={() => setShowForm(true)} className="bg-destructive hover:bg-destructive/90 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95">
                    <Ban className="w-5 h-5" /> Bloquear Cliente
                </button>
            </header>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="divide-y divide-border/50">
                    {isLoading && <p className="px-6 py-10 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Carregando...</p>}
                    {!isLoading && rows.length === 0 && (
                        <div className="px-6 py-14 text-center text-muted-foreground font-medium italic">Nenhum cliente bloqueado. 🎉</div>
                    )}
                    {rows.map(r => (
                        <div key={r.id} className="flex items-center gap-4 px-6 py-5">
                            <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center"><UserX className="w-5 h-5 text-destructive" /></div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-foreground uppercase tracking-tight truncate">{r.clientName}</p>
                                <p className="text-[11px] text-muted-foreground">
                                    {r.clientPhone && <span>{r.clientPhone}</span>}
                                    {r.reason && <span className="italic"> · {r.reason}</span>}
                                </p>
                            </div>
                            <button onClick={() => unblock(r.id)} className="px-5 py-2.5 rounded-lg border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">Desbloquear</button>
                        </div>
                    ))}
                </div>
            </div>

            {showForm && <BlockModal barbershopId={barbershopId} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); refresh(); }} />}
        </div>
    );
}

function BlockModal({ barbershopId, onClose, onSaved }) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);

    const { data: results = [] } = useQuery({
        queryKey: ['client-search', barbershopId, search],
        queryFn: async () => {
            if (search.trim().length < 2) return [];
            const res = await api.get(`/clients/search?barbershopId=${barbershopId}&search=${encodeURIComponent(search)}`);
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        },
        enabled: !!barbershopId && search.trim().length >= 2,
    });

    const block = async () => {
        if (!selected) { alert('Selecione um cliente.'); return; }
        setSaving(true);
        try { await api.post('/restrictions', { barbershopId, clientId: selected.id, reason }); onSaved(); }
        catch (e) { alert(e.response?.data?.message || 'Erro ao bloquear.'); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-5" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Bloquear Cliente</h2>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                </div>

                {!selected ? (
                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente por nome ou telefone" className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none focus:ring-2 ring-primary" autoFocus />
                        </div>
                        <div className="max-h-60 overflow-y-auto divide-y divide-border/50 border border-border rounded-xl">
                            {results.length === 0 && <p className="px-4 py-6 text-center text-xs text-muted-foreground italic">Digite ao menos 2 letras para buscar.</p>}
                            {results.map(c => (
                                <button key={c.id} onClick={() => setSelected(c)} className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors">
                                    <p className="font-bold text-foreground text-sm">{c.name}</p>
                                    <p className="text-[11px] text-muted-foreground">{c.phone}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-muted/40 rounded-xl px-4 py-3">
                            <div><p className="font-black text-foreground">{selected.name}</p><p className="text-[11px] text-muted-foreground">{selected.phone}</p></div>
                            <button onClick={() => setSelected(null)} className="text-[10px] font-black uppercase tracking-widest text-primary">Trocar</button>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Motivo (opcional)</label>
                            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Ex.: 3 faltas seguidas sem avisar" className="w-full mt-2 bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 ring-primary resize-none" />
                        </div>
                        <button onClick={block} disabled={saving} className="w-full py-4 rounded-xl bg-destructive text-white font-black text-[10px] uppercase tracking-widest hover:bg-destructive/90 transition-all disabled:opacity-50">{saving ? 'Bloqueando...' : 'Confirmar Bloqueio'}</button>
                    </div>
                )}
            </div>
        </div>
    );
}
