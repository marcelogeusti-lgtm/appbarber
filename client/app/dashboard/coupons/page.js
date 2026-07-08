'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ticket, Plus, Trash2, Power, Percent, DollarSign, X } from 'lucide-react';
import api from '../../../lib/api';

export default function CouponsPage() {
    const queryClient = useQueryClient();
    const [barbershopId, setBarbershopId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) {
            try {
                const p = JSON.parse(u);
                setBarbershopId(p.barbershopId || p.barbershop?.id || p.ownedBarbershops?.[0]?.id);
            } catch (e) { /* noop */ }
        }
    }, []);

    const { data: coupons = [], isLoading } = useQuery({
        queryKey: ['coupons', barbershopId],
        queryFn: async () => {
            if (!barbershopId) return [];
            const res = await api.get(`/coupons?barbershopId=${barbershopId}`);
            return res.data;
        },
        enabled: !!barbershopId,
    });

    const refresh = () => queryClient.invalidateQueries({ queryKey: ['coupons', barbershopId] });

    const toggle = async (c) => {
        try { await api.put(`/coupons/${c.id}`, { active: !c.active }); refresh(); }
        catch (e) { alert('Erro ao alterar o cupom.'); }
    };
    const remove = async (c) => {
        if (!confirm(`Remover o cupom ${c.code}?`)) return;
        try { await api.delete(`/coupons/${c.id}`); refresh(); }
        catch (e) { alert('Erro ao remover.'); }
    };

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl"><Ticket className="w-8 h-8" /></div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Cupons de Desconto</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Crie códigos promocionais para atrair e fidelizar clientes.</p>
                    </div>
                </div>
                <button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 transition-all active:scale-95">
                    <Plus className="w-5 h-5" /> Novo Cupom
                </button>
            </header>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-muted/20 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                <th className="px-6 py-5">Código</th>
                                <th className="px-6 py-5">Desconto</th>
                                <th className="px-6 py-5">Regras</th>
                                <th className="px-6 py-5 text-center">Usos</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading && (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Carregando cupons...</td></tr>
                            )}
                            {!isLoading && coupons.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-14 text-center text-muted-foreground font-medium italic">Nenhum cupom criado ainda. Clique em "Novo Cupom" para começar.</td></tr>
                            )}
                            {coupons.map((c) => (
                                <tr key={c.id} className="hover:bg-primary/5 transition-colors">
                                    <td className="px-6 py-5">
                                        <span className="font-black text-foreground tracking-widest uppercase">{c.code}</span>
                                        {c.description && <p className="text-[11px] text-muted-foreground italic mt-1">{c.description}</p>}
                                    </td>
                                    <td className="px-6 py-5 font-black text-primary">
                                        {c.discountType === 'FIXED' ? `R$ ${c.discountValue.toFixed(2)}` : `${c.discountValue}%`}
                                    </td>
                                    <td className="px-6 py-5 text-[11px] text-muted-foreground font-medium">
                                        {c.minValue ? `Mín. R$ ${c.minValue.toFixed(2)}` : 'Sem mínimo'}
                                        {c.validUntil ? ` · até ${new Date(c.validUntil).toLocaleDateString('pt-BR')}` : ''}
                                    </td>
                                    <td className="px-6 py-5 text-center text-xs font-black text-foreground">
                                        {c.usedCount}{c.maxUses != null ? ` / ${c.maxUses}` : ''}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${c.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            {c.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => toggle(c)} title={c.active ? 'Desativar' : 'Ativar'} className="p-2 rounded-lg border border-border hover:border-primary/40 text-muted-foreground hover:text-primary transition-all"><Power className="w-4 h-4" /></button>
                                            <button onClick={() => remove(c)} title="Remover" className="p-2 rounded-lg border border-border hover:border-destructive/40 text-muted-foreground hover:text-destructive transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <CouponFormModal barbershopId={barbershopId} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); refresh(); }} />
            )}
        </div>
    );
}

function CouponFormModal({ barbershopId, onClose, onSaved }) {
    const [form, setForm] = useState({ code: '', description: '', discountType: 'PERCENT', discountValue: '', minValue: '', maxUses: '', perClientLimit: '', validUntil: '' });
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const save = async () => {
        if (!form.code || !form.discountValue) { alert('Preencha o código e o valor do desconto.'); return; }
        setSaving(true);
        try {
            await api.post('/coupons', { ...form, barbershopId });
            onSaved();
        } catch (e) {
            alert(e.response?.data?.message || 'Erro ao criar cupom.');
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">Novo Cupom</h2>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                    <Field label="Código do cupom">
                        <input value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="Ex.: VOLTA10" className="input" />
                    </Field>
                    <Field label="Descrição (opcional)">
                        <input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Ex.: 10% para clientes que voltam" className="input" />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Tipo">
                            <div className="flex gap-2">
                                <button onClick={() => set('discountType', 'PERCENT')} className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 ${form.discountType === 'PERCENT' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}><Percent className="w-3 h-3" /> %</button>
                                <button onClick={() => set('discountType', 'FIXED')} className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 ${form.discountType === 'FIXED' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}><DollarSign className="w-3 h-3" /> R$</button>
                            </div>
                        </Field>
                        <Field label={form.discountType === 'FIXED' ? 'Valor (R$)' : 'Percentual (%)'}>
                            <input type="number" value={form.discountValue} onChange={(e) => set('discountValue', e.target.value)} placeholder={form.discountType === 'FIXED' ? '10' : '15'} className="input" />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Valor mínimo (opcional)">
                            <input type="number" value={form.minValue} onChange={(e) => set('minValue', e.target.value)} placeholder="R$" className="input" />
                        </Field>
                        <Field label="Limite de usos (opcional)">
                            <input type="number" value={form.maxUses} onChange={(e) => set('maxUses', e.target.value)} placeholder="Ilimitado" className="input" />
                        </Field>
                    </div>

                    <Field label="Válido até (opcional)">
                        <input type="date" value={form.validUntil} onChange={(e) => set('validUntil', e.target.value)} className="input" />
                    </Field>
                </div>

                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 py-4 rounded-xl border border-border text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all">Cancelar</button>
                    <button onClick={save} disabled={saving} className="flex-1 py-4 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50">{saving ? 'Salvando...' : 'Criar Cupom'}</button>
                </div>
            </div>

            <style jsx>{`
                .input {
                    width: 100%;
                    background: hsl(var(--background));
                    border: 1px solid hsl(var(--border));
                    border-radius: 0.75rem;
                    padding: 0.85rem 1rem;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: hsl(var(--foreground));
                    outline: none;
                }
                .input:focus { box-shadow: 0 0 0 2px hsl(var(--primary)); }
            `}</style>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
            {children}
        </div>
    );
}
