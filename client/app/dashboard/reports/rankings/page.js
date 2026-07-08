'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Crown, Scissors, Users, Calendar } from 'lucide-react';
import api from '../../../../lib/api';

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2)}`;

export default function RankingsPage() {
    const [barbershopId, setBarbershopId] = useState(null);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) { try { const p = JSON.parse(u); setBarbershopId(p.barbershopId || p.barbershop?.id || p.ownedBarbershops?.[0]?.id); } catch (e) { } }
    }, []);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['rankings', barbershopId, startDate, endDate],
        queryFn: async () => {
            const res = await api.get(`/rankings?barbershopId=${barbershopId}&startDate=${startDate}&endDate=${endDate}`);
            return res.data;
        },
        enabled: !!barbershopId,
    });

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl"><Trophy className="w-8 h-8" /></div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Rankings</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Seus melhores clientes, serviços e profissionais.</p>
                    </div>
                </div>
                <div className="flex items-end gap-3">
                    <div>
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">De</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="block bg-background border border-border rounded-xl px-3 py-3 text-sm font-bold text-foreground outline-none" />
                    </div>
                    <div>
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Até</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="block bg-background border border-border rounded-xl px-3 py-3 text-sm font-bold text-foreground outline-none" />
                    </div>
                    <button onClick={() => refetch()} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all">Filtrar</button>
                </div>
            </header>

            {isLoading && <p className="text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest py-10">Calculando rankings...</p>}

            {data && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RankCard title="Top Clientes (por valor)" icon={Crown} items={data.topClientsByValue} render={(c) => ({ label: c.name, sub: `${c.visits} visita(s)`, value: fmt(c.total) })} />
                    <RankCard title="Top Clientes (por visitas)" icon={Users} items={data.topClientsByVisits} render={(c) => ({ label: c.name, sub: fmt(c.total), value: `${c.visits}` })} />
                    <RankCard title="Top Profissionais" icon={Trophy} items={data.topProfessionals} render={(p) => ({ label: p.name, sub: `${p.count} atendimento(s)`, value: fmt(p.total) })} />
                    <RankCard title="Serviços mais feitos" icon={Scissors} items={data.topServices} render={(s) => ({ label: s.name, sub: fmt(s.total), value: `${s.count}x` })} />
                </div>
            )}
        </div>
    );
}

function RankCard({ title, icon: Icon, items = [], render }) {
    return (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-border bg-muted/20">
                <Icon className="w-5 h-5 text-primary" />
                <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.15em]">{title}</h3>
            </div>
            <div className="divide-y divide-border/50">
                {items.length === 0 && <p className="px-6 py-10 text-center text-muted-foreground text-sm italic">Sem dados no período.</p>}
                {items.map((it, idx) => {
                    const r = render(it);
                    const medal = ['bg-amber-400/20 text-amber-500', 'bg-slate-300/20 text-slate-400', 'bg-orange-400/20 text-orange-500'][idx] || 'bg-muted text-muted-foreground';
                    return (
                        <div key={idx} className="flex items-center gap-4 px-6 py-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${medal}`}>{idx + 1}</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground text-sm truncate">{r.label}</p>
                                <p className="text-[11px] text-muted-foreground">{r.sub}</p>
                            </div>
                            <span className="font-black text-primary tabular-nums">{r.value}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
