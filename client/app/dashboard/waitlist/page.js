'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Hourglass, Clock, X, Scissors } from 'lucide-react';
import api from '../../../lib/api';

export default function WaitlistPage() {
    const queryClient = useQueryClient();
    const [barbershopId, setBarbershopId] = useState(null);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) { try { const p = JSON.parse(u); setBarbershopId(p.barbershopId || p.barbershop?.id || p.ownedBarbershops?.[0]?.id); } catch (e) { } }
    }, []);

    const { data: list = [], isLoading } = useQuery({
        queryKey: ['waitlist', barbershopId],
        queryFn: async () => (await api.get(`/waitlist?barbershopId=${barbershopId}`)).data,
        enabled: !!barbershopId,
        refetchInterval: 20000,
    });
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['waitlist', barbershopId] });

    const remove = async (id) => {
        if (!confirm('Remover da lista de espera?')) return;
        try { await api.delete(`/waitlist/${id}`); refresh(); }
        catch (e) { alert('Erro ao remover.'); }
    };

    const fmtDate = (d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    return (
        <div className="space-y-8 pb-20">
            <header className="flex items-center gap-4 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="p-3 bg-primary/10 text-primary rounded-xl"><Hourglass className="w-8 h-8" /></div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Lista de Espera</h1>
                    <p className="text-muted-foreground text-sm font-medium italic">Clientes aguardando vaga em horários cheios. Avise quando abrir um encaixe.</p>
                </div>
            </header>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="divide-y divide-border/50">
                    {isLoading && <p className="px-6 py-10 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Carregando...</p>}
                    {!isLoading && list.length === 0 && <p className="px-6 py-14 text-center text-muted-foreground font-medium italic">Ninguém na lista de espera.</p>}
                    {list.map(w => (
                        <div key={w.id} className="flex items-center gap-4 px-6 py-5">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"><Clock className="w-5 h-5 text-primary" /></div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-foreground uppercase tracking-tight truncate">{w.clientName}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] text-muted-foreground font-medium">
                                    {w.date && <span>Deseja: {fmtDate(w.date)}</span>}
                                    {w.service?.name && <span className="flex items-center gap-1"><Scissors className="w-3 h-3" /> {w.service.name}</span>}
                                    {w.professional?.name && <span>com {w.professional.name}</span>}
                                    {w.clientPhone && <span>{w.clientPhone}</span>}
                                </div>
                            </div>
                            <button onClick={() => remove(w.id)} title="Remover" className="p-2.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all"><X className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
