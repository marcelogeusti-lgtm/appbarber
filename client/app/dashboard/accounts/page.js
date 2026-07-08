'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Search, Banknote, Wallet } from 'lucide-react';
import api from '../../../lib/api';

const money = (v) => `R$ ${Number(v || 0).toFixed(2)}`;

export default function AccountsPage() {
    const queryClient = useQueryClient();
    const [barbershopId, setBarbershopId] = useState(null);
    const [charge, setCharge] = useState(false);
    const [payClient, setPayClient] = useState(null);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) { try { const p = JSON.parse(u); setBarbershopId(p.barbershopId || p.barbershop?.id || p.ownedBarbershops?.[0]?.id); } catch (e) { } }
    }, []);

    const { data = { clients: [], totalOwed: 0 }, isLoading } = useQuery({
        queryKey: ['accounts', barbershopId],
        queryFn: async () => (await api.get(`/accounts?barbershopId=${barbershopId}`)).data,
        enabled: !!barbershopId,
    });
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['accounts', barbershopId] });

    const devedores = (data.clients || []).filter(c => c.balance > 0.001);

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl"><Wallet className="w-8 h-8" /></div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Conta do Cliente (Fiado)</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Controle quem consumiu na conta e receba os pagamentos.</p>
                    </div>
                </div>
                <button onClick={() => setCharge(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 transition-all active:scale-95">
                    <Plus className="w-5 h-5" /> Lançar na Conta
                </button>
            </header>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Total a receber</p>
                    <p className="text-3xl font-black tabular-nums text-destructive">{money(data.totalOwed)}</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Clientes devendo</p>
                    <p className="text-3xl font-black tabular-nums text-foreground">{devedores.length}</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="divide-y divide-border/50">
                    {isLoading && <p className="px-6 py-10 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Carregando...</p>}
                    {!isLoading && devedores.length === 0 && <p className="px-6 py-14 text-center text-muted-foreground font-medium italic">Ninguém devendo no momento. 👍</p>}
                    {devedores.map(c => (
                        <div key={c.clientId} className="flex items-center gap-4 px-6 py-5">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"><Wallet className="w-5 h-5 text-primary" /></div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-foreground uppercase tracking-tight truncate">{c.clientName}</p>
                                <p className="text-[11px] text-muted-foreground">Deve <span className="font-black text-destructive">{money(c.balance)}</span></p>
                            </div>
                            <button onClick={() => setPayClient(c)} className="px-5 py-2.5 rounded-lg bg-primary/10 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2">
                                <Banknote className="w-4 h-4" /> Receber
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {charge && <ChargeModal barbershopId={barbershopId} onClose={() => setCharge(false)} onSaved={() => { setCharge(false); refresh(); }} />}
            {payClient && <PayModal barbershopId={barbershopId} client={payClient} onClose={() => setPayClient(null)} onSaved={() => { setPayClient(null); refresh(); }} />}
        </div>
    );
}

function ChargeModal({ barbershopId, onClose, onSaved }) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    const { data: results = [] } = useQuery({
        queryKey: ['acc-client-search', barbershopId, search],
        queryFn: async () => {
            if (search.trim().length < 2) return [];
            const res = await api.get(`/clients/search?barbershopId=${barbershopId}&search=${encodeURIComponent(search)}`);
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        },
        enabled: !!barbershopId && search.trim().length >= 2,
    });

    const save = async () => {
        if (!selected || !Number(amount)) { alert('Selecione o cliente e informe o valor.'); return; }
        setSaving(true);
        try { await api.post('/accounts', { barbershopId, clientId: selected.id, type: 'CHARGE', amount: Number(amount), description }); onSaved(); }
        catch (e) { alert(e.response?.data?.message || 'Erro ao lançar.'); }
        finally { setSaving(false); }
    };

    return (
        <Modal title="Lançar na Conta" onClose={onClose}>
            {!selected ? (
                <ClientSearch results={results} search={search} setSearch={setSearch} onPick={setSelected} />
            ) : (
                <div className="space-y-4">
                    <PickedClient client={selected} onChange={() => setSelected(null)} />
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Valor (R$)" className="acc-i" autoFocus />
                    <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição (opcional). Ex.: Corte + Barba" className="acc-i" />
                    <button onClick={save} disabled={saving} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50">{saving ? 'Lançando...' : 'Lançar na conta'}</button>
                </div>
            )}
        </Modal>
    );
}

function PayModal({ barbershopId, client, onClose, onSaved }) {
    const [amount, setAmount] = useState(String(client.balance.toFixed(2)));
    const [saving, setSaving] = useState(false);
    const save = async () => {
        if (!Number(amount)) { alert('Informe o valor.'); return; }
        setSaving(true);
        try { await api.post('/accounts', { barbershopId, clientId: client.clientId, type: 'PAYMENT', amount: Number(amount), description: 'Pagamento de conta' }); onSaved(); }
        catch (e) { alert(e.response?.data?.message || 'Erro ao registrar pagamento.'); }
        finally { setSaving(false); }
    };
    return (
        <Modal title={`Receber de ${client.clientName}`} onClose={onClose}>
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Saldo devedor: <span className="font-black text-destructive">{money(client.balance)}</span></p>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Valor recebido (R$)" className="acc-i" autoFocus />
                <p className="text-[11px] text-muted-foreground italic">O valor recebido entra automaticamente no caixa.</p>
                <button onClick={save} disabled={saving} className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50">{saving ? 'Registrando...' : 'Confirmar recebimento'}</button>
            </div>
        </Modal>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-5" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">{title}</h2>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                </div>
                {children}
                <style jsx>{`
                    :global(.acc-i) { width:100%; background:hsl(var(--background)); border:1px solid hsl(var(--border)); border-radius:0.75rem; padding:0.85rem 1rem; font-size:0.85rem; font-weight:700; color:hsl(var(--foreground)); outline:none; }
                    :global(.acc-i:focus) { box-shadow:0 0 0 2px hsl(var(--primary)); }
                `}</style>
            </div>
        </div>
    );
}

function ClientSearch({ results, search, setSearch, onPick }) {
    return (
        <div className="space-y-3">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente" className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none focus:ring-2 ring-primary" autoFocus />
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-border/50 border border-border rounded-xl">
                {results.length === 0 && <p className="px-4 py-6 text-center text-xs text-muted-foreground italic">Digite ao menos 2 letras.</p>}
                {results.map(c => (
                    <button key={c.id} onClick={() => onPick(c)} className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors">
                        <p className="font-bold text-foreground text-sm">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.phone}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}

function PickedClient({ client, onChange }) {
    return (
        <div className="flex items-center justify-between bg-muted/40 rounded-xl px-4 py-3">
            <div><p className="font-black text-foreground">{client.name}</p><p className="text-[11px] text-muted-foreground">{client.phone}</p></div>
            <button onClick={onChange} className="text-[10px] font-black uppercase tracking-widest text-primary">Trocar</button>
        </div>
    );
}
