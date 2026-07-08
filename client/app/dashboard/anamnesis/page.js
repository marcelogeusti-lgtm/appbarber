'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Search, Save, X, User } from 'lucide-react';
import api from '../../../lib/api';

const FIELDS = [
    { key: 'allergies', label: 'Alergias / restrições', placeholder: 'Ex.: alergia a tintura, pele sensível' },
    { key: 'hairType', label: 'Tipo de cabelo / pele', placeholder: 'Ex.: cabelo cacheado, couro oleoso' },
    { key: 'chemicalHistory', label: 'Histórico de química / procedimentos', placeholder: 'Ex.: fez progressiva há 2 meses' },
    { key: 'preferences', label: 'Preferências', placeholder: 'Ex.: máquina 2 nas laterais, não gosta de navalha' },
    { key: 'notes', label: 'Observações gerais', placeholder: 'Qualquer detalhe importante' },
];

export default function AnamnesisPage() {
    const queryClient = useQueryClient();
    const [barbershopId, setBarbershopId] = useState(null);
    const [selected, setSelected] = useState(null); // {id, name, phone}
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) { try { const p = JSON.parse(u); setBarbershopId(p.barbershopId || p.barbershop?.id || p.ownedBarbershops?.[0]?.id); } catch (e) { } }
    }, []);

    const { data: recent = [] } = useQuery({
        queryKey: ['anamnesis-list', barbershopId],
        queryFn: async () => (await api.get(`/anamnesis?barbershopId=${barbershopId}`)).data,
        enabled: !!barbershopId,
    });

    const { data: results = [] } = useQuery({
        queryKey: ['anamnesis-search', barbershopId, search],
        queryFn: async () => {
            if (search.trim().length < 2) return [];
            const res = await api.get(`/clients/search?barbershopId=${barbershopId}&search=${encodeURIComponent(search)}`);
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        },
        enabled: !!barbershopId && search.trim().length >= 2,
    });

    const pick = async (c) => {
        setSelected(c); setSearch('');
        try {
            const res = await api.get(`/anamnesis/${c.id}?barbershopId=${barbershopId}`);
            const r = res.data || {};
            setForm({ allergies: r.allergies || '', hairType: r.hairType || '', chemicalHistory: r.chemicalHistory || '', preferences: r.preferences || '', notes: r.notes || '' });
        } catch (e) { setForm({}); }
    };

    const save = async () => {
        setSaving(true);
        try {
            await api.post('/anamnesis', { barbershopId, clientId: selected.id, ...form });
            alert('Ficha salva!');
            queryClient.invalidateQueries({ queryKey: ['anamnesis-list', barbershopId] });
        } catch (e) { alert(e.response?.data?.message || 'Erro ao salvar.'); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-8 pb-20">
            <header className="flex items-center gap-4 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="p-3 bg-primary/10 text-primary rounded-xl"><ClipboardList className="w-8 h-8" /></div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Anamnese / Ficha Técnica</h1>
                    <p className="text-muted-foreground text-sm font-medium italic">Registre alergias, preferências e histórico de cada cliente.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Busca + recentes */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente" className="w-full bg-card border border-border rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none focus:ring-2 ring-primary" />
                    </div>
                    {search.trim().length >= 2 && (
                        <div className="bg-card border border-border rounded-xl divide-y divide-border/50 max-h-72 overflow-y-auto">
                            {results.map(c => (
                                <button key={c.id} onClick={() => pick(c)} className="w-full text-left px-4 py-3 hover:bg-primary/5"><p className="font-bold text-foreground text-sm">{c.name}</p><p className="text-[11px] text-muted-foreground">{c.phone}</p></button>
                            ))}
                            {results.length === 0 && <p className="px-4 py-6 text-center text-xs text-muted-foreground italic">Nenhum cliente.</p>}
                        </div>
                    )}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-border bg-muted/20"><h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Fichas recentes</h3></div>
                        <div className="divide-y divide-border/50 max-h-72 overflow-y-auto">
                            {recent.length === 0 && <p className="px-4 py-6 text-center text-xs text-muted-foreground italic">Nenhuma ficha ainda.</p>}
                            {recent.map(r => (
                                <button key={r.id} onClick={() => pick({ id: r.clientId, name: r.clientName })} className="w-full text-left px-4 py-3 hover:bg-primary/5 flex items-center gap-3">
                                    <User className="w-4 h-4 text-muted-foreground" /><span className="font-bold text-foreground text-sm truncate">{r.clientName}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Ficha */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-8">
                    {!selected ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                            <ClipboardList className="w-12 h-12 mb-4 opacity-30" />
                            <p className="font-medium italic">Busque um cliente para ver ou preencher a ficha.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
                                    <div><p className="font-black text-foreground uppercase tracking-tight">{selected.name}</p><p className="text-[11px] text-muted-foreground">Ficha técnica</p></div>
                                </div>
                                <button onClick={() => setSelected(null)} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                            </div>
                            {FIELDS.map(f => (
                                <div key={f.key}>
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{f.label}</label>
                                    <textarea value={form[f.key] || ''} onChange={e => setForm(s => ({ ...s, [f.key]: e.target.value }))} rows={2} placeholder={f.placeholder}
                                        className="w-full mt-2 bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 ring-primary resize-none" />
                                </div>
                            ))}
                            <button onClick={save} disabled={saving} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar Ficha'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
