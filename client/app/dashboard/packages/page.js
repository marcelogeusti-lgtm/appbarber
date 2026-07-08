'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Package2, Plus, X, Scissors } from 'lucide-react';
import api from '../../../lib/api';

const money = (v) => `R$ ${Number(v || 0).toFixed(2)}`;

export default function PackagesPage() {
    const queryClient = useQueryClient();
    const [barbershopId, setBarbershopId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) { try { const p = JSON.parse(u); setBarbershopId(p.barbershopId || p.barbershop?.id || p.ownedBarbershops?.[0]?.id); } catch (e) { } }
    }, []);

    const { data: packages = [], isLoading } = useQuery({
        queryKey: ['packages', barbershopId],
        queryFn: async () => (await api.get(`/packages?barbershopId=${barbershopId}`)).data,
        enabled: !!barbershopId,
    });
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['packages', barbershopId] });

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl"><Package2 className="w-8 h-8" /></div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Pacotes de Serviços</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Venda pacotes pré-pagos (ex.: 5 cortes) com saldo abatido a cada uso.</p>
                    </div>
                </div>
                <button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 transition-all active:scale-95">
                    <Plus className="w-5 h-5" /> Novo Pacote
                </button>
            </header>

            {isLoading && <p className="text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest py-8">Carregando...</p>}
            {!isLoading && packages.length === 0 && <div className="bg-card border border-dashed border-border rounded-xl p-14 text-center text-muted-foreground italic">Nenhum pacote criado. Clique em "Novo Pacote".</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map(p => (
                    <div key={p.id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                            <h3 className="font-black text-foreground uppercase tracking-tight">{p.name}</h3>
                            <span className="text-primary font-black">{money(p.price)}</span>
                        </div>
                        {p.description && <p className="text-[12px] text-muted-foreground italic mt-1">{p.description}</p>}
                        <div className="flex gap-4 mt-4 text-[11px] font-bold text-muted-foreground">
                            <span>{p.totalQuantity} usos</span>
                            <span>· vale {p.validityDays} dias</span>
                        </div>
                        {p.services?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                                {p.services.map(s => <span key={s.id} className="text-[9px] font-black uppercase tracking-widest bg-muted px-2 py-1 rounded-full text-muted-foreground flex items-center gap-1"><Scissors className="w-2.5 h-2.5" />{s.name}</span>)}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showForm && <PackageForm barbershopId={barbershopId} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); refresh(); }} />}
        </div>
    );
}

function PackageForm({ barbershopId, onClose, onSaved }) {
    const [form, setForm] = useState({ name: '', description: '', price: '', validityDays: '90', totalQuantity: '5', serviceIds: [] });
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const { data: services = [] } = useQuery({
        queryKey: ['pkg-services', barbershopId],
        queryFn: async () => {
            const res = await api.get(`/services?barbershopId=${barbershopId}&active=true&limit=1000`);
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        },
        enabled: !!barbershopId,
    });

    const toggleService = (id) => set('serviceIds', form.serviceIds.includes(id) ? form.serviceIds.filter(x => x !== id) : [...form.serviceIds, id]);

    const save = async () => {
        if (!form.name.trim() || !form.price) { alert('Preencha nome e preço.'); return; }
        setSaving(true);
        try {
            await api.post('/packages', { ...form, price: Number(form.price), validityDays: Number(form.validityDays), totalQuantity: Number(form.totalQuantity), barbershopId });
            onSaved();
        } catch (e) { alert(e.response?.data?.message || 'Erro ao criar pacote.'); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Novo Pacote</h2>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                </div>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nome do pacote. Ex.: Combo 5 Cortes" className="pkg-i" />
                <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descrição (opcional)" className="pkg-i" />
                <div className="grid grid-cols-3 gap-3">
                    <div><label className="pkg-l">Preço (R$)</label><input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="pkg-i" /></div>
                    <div><label className="pkg-l">Qtd usos</label><input type="number" value={form.totalQuantity} onChange={e => set('totalQuantity', e.target.value)} className="pkg-i" /></div>
                    <div><label className="pkg-l">Validade (dias)</label><input type="number" value={form.validityDays} onChange={e => set('validityDays', e.target.value)} className="pkg-i" /></div>
                </div>
                <div>
                    <label className="pkg-l">Serviços inclusos</label>
                    <div className="max-h-40 overflow-y-auto border border-border rounded-xl divide-y divide-border/50 mt-1">
                        {services.length === 0 && <p className="px-4 py-4 text-xs text-muted-foreground italic">Nenhum serviço cadastrado.</p>}
                        {services.map(s => (
                            <label key={s.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-primary/5">
                                <input type="checkbox" checked={form.serviceIds.includes(s.id)} onChange={() => toggleService(s.id)} />
                                <span className="text-sm font-bold text-foreground flex-1">{s.name}</span>
                                <span className="text-[11px] text-muted-foreground">{money(s.price)}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <button onClick={save} disabled={saving} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50">{saving ? 'Salvando...' : 'Criar Pacote'}</button>
                <style jsx>{`
                    .pkg-l { display:block; font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:0.15em; color:hsl(var(--muted-foreground)); margin-bottom:6px; margin-left:4px; }
                    .pkg-i { width:100%; background:hsl(var(--background)); border:1px solid hsl(var(--border)); border-radius:0.75rem; padding:0.8rem 1rem; font-size:0.85rem; font-weight:700; color:hsl(var(--foreground)); outline:none; }
                    .pkg-i:focus { box-shadow:0 0 0 2px hsl(var(--primary)); }
                `}</style>
            </div>
        </div>
    );
}
