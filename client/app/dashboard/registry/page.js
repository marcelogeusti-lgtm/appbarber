'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Boxes, Truck, Wrench, Tag, Plus, Trash2 } from 'lucide-react';
import api from '../../../lib/api';

const TABS = [
    { key: 'supplier', label: 'Fornecedores', icon: Truck, endpoint: 'supplier' },
    { key: 'equipment', label: 'Equipamentos', icon: Wrench, endpoint: 'equipment' },
    { key: 'category', label: 'Categorias', icon: Tag, endpoint: 'category' },
];

export default function RegistryPage() {
    const [barbershopId, setBarbershopId] = useState(null);
    const [tab, setTab] = useState('supplier');

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) { try { const p = JSON.parse(u); setBarbershopId(p.barbershopId || p.barbershop?.id || p.ownedBarbershops?.[0]?.id); } catch (e) { } }
    }, []);

    const current = TABS.find(t => t.key === tab);

    return (
        <div className="space-y-8 pb-20">
            <header className="flex items-center gap-4 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="p-3 bg-primary/10 text-primary rounded-xl"><Boxes className="w-8 h-8" /></div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Cadastros</h1>
                    <p className="text-muted-foreground text-sm font-medium italic">Fornecedores, equipamentos e categorias da sua barbearia.</p>
                </div>
            </header>

            {/* Abas */}
            <div className="flex gap-2 border-b border-border">
                {TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 -mb-px ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                        <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                ))}
            </div>

            {barbershopId && <RegistrySection key={current.key} barbershopId={barbershopId} entity={current} />}
        </div>
    );
}

function RegistrySection({ barbershopId, entity }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({});
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const { data: rows = [], isLoading } = useQuery({
        queryKey: ['registry', entity.key, barbershopId],
        queryFn: async () => {
            const res = await api.get(`/registry/${entity.endpoint}?barbershopId=${barbershopId}`);
            return res.data;
        },
        enabled: !!barbershopId,
    });
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['registry', entity.key, barbershopId] });

    const add = async () => {
        if (!form.name?.trim()) { alert('Informe o nome.'); return; }
        try { await api.post(`/registry/${entity.endpoint}`, { ...form, barbershopId, type: entity.key === 'category' ? (form.type || 'SERVICE') : undefined }); setForm({}); refresh(); }
        catch (e) { alert(e.response?.data?.message || 'Erro ao criar.'); }
    };
    const remove = async (id) => {
        if (!confirm('Remover este item?')) return;
        try { await api.delete(`/registry/${entity.endpoint}/${id}`); refresh(); }
        catch (e) { alert('Erro ao remover.'); }
    };

    return (
        <div className="space-y-6">
            {/* Formulário de criação */}
            <div className="bg-card border border-border rounded-xl p-6 flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[180px]">
                    <label className="reg-l">Nome</label>
                    <input value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Nome" className="reg-i" />
                </div>
                {entity.key === 'supplier' && <>
                    <div className="w-40"><label className="reg-l">Telefone</label><input value={form.phone || ''} onChange={e => set('phone', e.target.value)} className="reg-i" /></div>
                    <div className="w-52"><label className="reg-l">E-mail</label><input value={form.email || ''} onChange={e => set('email', e.target.value)} className="reg-i" /></div>
                </>}
                {entity.key === 'equipment' && (
                    <div className="w-28"><label className="reg-l">Qtd</label><input type="number" value={form.quantity ?? ''} onChange={e => set('quantity', e.target.value)} placeholder="1" className="reg-i" /></div>
                )}
                {entity.key === 'category' && (
                    <div className="w-44"><label className="reg-l">Tipo</label>
                        <select value={form.type || 'SERVICE'} onChange={e => set('type', e.target.value)} className="reg-i">
                            <option value="SERVICE">Serviço</option>
                            <option value="PRODUCT">Produto</option>
                        </select>
                    </div>
                )}
                <button onClick={add} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2"><Plus className="w-4 h-4" /> Adicionar</button>
            </div>

            {/* Lista */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="divide-y divide-border/50">
                    {isLoading && <p className="px-6 py-8 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Carregando...</p>}
                    {!isLoading && rows.length === 0 && <p className="px-6 py-12 text-center text-muted-foreground italic">Nenhum item cadastrado.</p>}
                    {rows.map(row => (
                        <div key={row.id} className="flex items-center gap-4 px-6 py-4">
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground truncate">{row.name}</p>
                                <p className="text-[11px] text-muted-foreground">
                                    {entity.key === 'supplier' && [row.phone, row.email].filter(Boolean).join(' · ')}
                                    {entity.key === 'equipment' && `Quantidade: ${row.quantity}`}
                                    {entity.key === 'category' && (row.type === 'PRODUCT' ? 'Produto' : 'Serviço')}
                                </p>
                            </div>
                            <button onClick={() => remove(row.id)} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .reg-l { display:block; font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:0.15em; color:hsl(var(--muted-foreground)); margin-bottom:6px; margin-left:4px; }
                .reg-i { width:100%; background:hsl(var(--background)); border:1px solid hsl(var(--border)); border-radius:0.75rem; padding:0.7rem 0.9rem; font-size:0.85rem; font-weight:700; color:hsl(var(--foreground)); outline:none; }
                .reg-i:focus { box-shadow:0 0 0 2px hsl(var(--primary)); }
            `}</style>
        </div>
    );
}
