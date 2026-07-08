'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Repeat, Crown, Users } from 'lucide-react';
import api from '../../../lib/api';

export default function RotationPage() {
    const queryClient = useQueryClient();
    const [barbershopId, setBarbershopId] = useState(null);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) { try { const p = JSON.parse(u); setBarbershopId(p.barbershopId || p.barbershop?.id || p.ownedBarbershops?.[0]?.id); } catch (e) { } }
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ['rotation', barbershopId],
        queryFn: async () => (await api.get(`/rotation?barbershopId=${barbershopId}`)).data,
        enabled: !!barbershopId,
        refetchInterval: 20000,
    });

    const toggle = async () => {
        try { await api.put('/rotation', { barbershopId, enabled: !data?.enabled }); queryClient.invalidateQueries({ queryKey: ['rotation', barbershopId] }); }
        catch (e) { alert('Erro ao alterar o rodízio.'); }
    };

    const pros = data?.pros || [];
    const maxCount = Math.max(1, ...pros.map(p => p.count));

    return (
        <div className="space-y-8 pb-20">
            <header className="flex items-center gap-4 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="p-3 bg-primary/10 text-primary rounded-xl"><Repeat className="w-8 h-8" /></div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Rodízio de Profissionais</h1>
                    <p className="text-muted-foreground text-sm font-medium italic">Distribui os clientes da fila (sem preferência) de forma justa.</p>
                </div>
            </header>

            {/* Toggle */}
            <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between">
                <div>
                    <p className="font-black text-foreground uppercase tracking-tight">Rodízio automático</p>
                    <p className="text-[12px] text-muted-foreground italic mt-1">Quando ligado, quem entra na fila como "qualquer profissional" é atribuído ao barbeiro com menos atendimentos no dia.</p>
                </div>
                <button onClick={toggle} disabled={isLoading} className={`relative w-16 h-9 rounded-full transition-all ${data?.enabled ? 'bg-primary' : 'bg-muted'}`}>
                    <span className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-all ${data?.enabled ? 'left-8' : 'left-1'}`} />
                </button>
            </div>

            {/* Próximo da vez */}
            {data?.enabled && data?.next && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex items-center gap-4">
                    <Crown className="w-8 h-8 text-primary" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Próximo da vez</p>
                        <p className="text-2xl font-black text-foreground uppercase tracking-tight">{data.next.name}</p>
                    </div>
                </div>
            )}

            {/* Distribuição de hoje */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-border bg-muted/20">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.15em]">Distribuição de hoje</h3>
                </div>
                <div className="divide-y divide-border/50">
                    {pros.length === 0 && <p className="px-6 py-10 text-center text-muted-foreground italic">Nenhum profissional ativo.</p>}
                    {pros.map(p => (
                        <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground truncate">{p.name}</p>
                                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(p.count / maxCount) * 100}%` }} />
                                </div>
                            </div>
                            <span className="font-black text-primary tabular-nums text-lg">{p.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
