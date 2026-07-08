'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gauge, Link2, Copy, Smile, Meh, Frown } from 'lucide-react';
import api from '../../../lib/api';

export default function SurveysPage() {
    const [barbershopId, setBarbershopId] = useState(null);
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) { try { const p = JSON.parse(u); setBarbershopId(p.barbershopId || p.barbershop?.id || p.ownedBarbershops?.[0]?.id); } catch (e) { } }
        if (typeof window !== 'undefined') setOrigin(window.location.origin);
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ['surveys', barbershopId],
        queryFn: async () => (await api.get(`/surveys?barbershopId=${barbershopId}`)).data,
        enabled: !!barbershopId,
    });

    const link = barbershopId ? `${origin}/pesquisa?b=${barbershopId}` : '';
    const copyLink = () => { navigator.clipboard?.writeText(link); alert('Link copiado! Envie para seus clientes.'); };

    const npsColor = (n) => n >= 50 ? 'text-emerald-500' : n >= 0 ? 'text-amber-500' : 'text-destructive';

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl"><Gauge className="w-8 h-8" /></div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Pesquisa de Satisfação</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Meça o NPS: o quanto seus clientes recomendam sua barbearia.</p>
                    </div>
                </div>
                <button onClick={copyLink} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 transition-all active:scale-95">
                    <Link2 className="w-4 h-4" /> Copiar link da pesquisa
                </button>
            </header>

            {isLoading && <p className="text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest py-10">Carregando...</p>}

            {data && (
                <>
                    {/* NPS grande */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="bg-card p-8 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">NPS</p>
                            <p className={`text-6xl font-black tabular-nums ${npsColor(data.nps)}`}>{data.nps}</p>
                            <p className="text-[10px] text-muted-foreground font-bold mt-2">{data.total} resposta(s)</p>
                        </div>
                        <Stat label="Promotores" value={data.promoters} sub="notas 9-10" icon={Smile} color="text-emerald-500" />
                        <Stat label="Neutros" value={data.passives} sub="notas 7-8" icon={Meh} color="text-amber-500" />
                        <Stat label="Detratores" value={data.detractors} sub="notas 0-6" icon={Frown} color="text-destructive" />
                    </div>

                    {/* Link */}
                    <div className="bg-muted/30 border border-border rounded-xl p-5 flex items-center gap-3">
                        <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <code className="text-xs text-muted-foreground truncate flex-1">{link}</code>
                        <button onClick={copyLink} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"><Copy className="w-4 h-4" /></button>
                    </div>

                    {/* Respostas */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-5 border-b border-border bg-muted/20"><h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.15em]">Respostas recentes</h3></div>
                        <div className="divide-y divide-border/50">
                            {data.responses.length === 0 && <p className="px-6 py-12 text-center text-muted-foreground italic">Nenhuma resposta ainda. Compartilhe o link com seus clientes.</p>}
                            {data.responses.map(r => (
                                <div key={r.id} className="flex items-start gap-4 px-6 py-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${r.score >= 9 ? 'bg-emerald-500/10 text-emerald-500' : r.score >= 7 ? 'bg-amber-500/10 text-amber-500' : 'bg-destructive/10 text-destructive'}`}>{r.score}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-foreground text-sm">{r.clientName || 'Anônimo'}</p>
                                        {r.comment && <p className="text-[13px] text-muted-foreground italic mt-0.5">"{r.comment}"</p>}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function Stat({ label, value, sub, icon: Icon, color }) {
    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2"><Icon className={`w-4 h-4 ${color}`} /><p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">{label}</p></div>
            <p className={`text-3xl font-black tabular-nums ${color}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground font-bold mt-1">{sub}</p>
        </div>
    );
}
