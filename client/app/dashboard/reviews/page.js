'use client';
import { Suspense, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../../lib/api';
import { Star, MessageSquare, Gauge, Link2, Copy, Smile, Meh, Frown } from 'lucide-react';
import { format } from 'date-fns';

const TABS = [
    { id: 'reviews', label: 'Avaliações', icon: Star },
    { id: 'nps', label: 'NPS', icon: Gauge },
];

export default function ReviewsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center animate-pulse uppercase text-xs font-black text-muted-foreground">Carregando...</div>}>
            <ReviewsContent />
        </Suspense>
    );
}

function ReviewsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') === 'nps' ? 'nps' : 'reviews';

    const [user, setUser] = useState(null);
    const [barbershopId, setBarbershopId] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const parsed = JSON.parse(userStr);
                setUser(parsed);
                const bId = parsed.barbershopId || parsed.barbershop?.id || parsed.ownedBarbershops?.[0]?.id;
                setBarbershopId(bId);
            } catch (e) { }
        }
    }, []);

    const setTab = (id) => {
        router.replace(id === 'nps' ? '/dashboard/reviews?tab=nps' : '/dashboard/reviews', { scroll: false });
    };

    const { data: reviews = [], isLoading } = useQuery({
        queryKey: ['reviews', barbershopId],
        queryFn: async () => {
            if (!barbershopId) return [];
            const res = await api.get(`/reviews?barbershopId=${barbershopId}`);
            return res.data;
        },
        enabled: !!barbershopId && tab === 'reviews',
    });

    const isInitialLoading = isLoading && reviews.length === 0;

    const average = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    return (
        <div className="space-y-8 pb-20">
            <div className="flex gap-2 bg-card p-1.5 rounded-xl border border-border shadow-sm w-fit">
                {TABS.map(t => {
                    const Icon = t.icon;
                    const active = tab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${active ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'}`}
                        >
                            <Icon className="w-4 h-4" /> {t.label}
                        </button>
                    );
                })}
            </div>

            {tab === 'nps' ? (
                <NpsTab barbershopId={barbershopId} />
            ) : isInitialLoading ? (
                <div className="p-8 text-center animate-pulse uppercase text-xs font-black text-muted-foreground">Carregando avaliações...</div>
            ) : (
                <>
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
                                <Star className="w-8 h-8 fill-yellow-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Avaliações</h1>
                                <p className="text-muted-foreground text-sm font-medium italic">Veja o que seus clientes estão dizendo.</p>
                            </div>
                        </div>
                        <div className="bg-card border border-border px-6 py-3 rounded-xl flex items-center gap-4">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Média Geral</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-foreground">{average}</span>
                                    <div className="flex text-yellow-500 gap-0.5">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className={`w-3 h-3 ${s <= Math.round(Number(average)) ? 'fill-yellow-500' : 'text-muted/30'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-border mx-2"></div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Total</span>
                                <span className="text-xl font-bold text-foreground">{reviews.length}</span>
                            </div>
                        </div>
                    </header>

                    <div className="grid gap-4">
                        {reviews.length === 0 ? (
                            <div className="text-center py-20 opacity-50">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Nenhuma avaliação ainda.</p>
                            </div>
                        ) : (
                            reviews.map(review => {
                                let dateFormatted = 'Data inválida';
                                try {
                                    if (review.createdAt) {
                                        dateFormatted = format(new Date(review.createdAt), 'dd/MM/yyyy HH:mm');
                                    }
                                } catch (e) { console.error('Date error', e); }

                                return (
                                    <div key={review.id} className="bg-card p-6 rounded-xl border border-border shadow-sm hover:border-primary/30 transition group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                    {review.client?.avatarUrl ? (
                                                        <img src={review.client.avatarUrl} alt={review.client.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-bold text-muted-foreground">{review.client?.name?.[0] || '?'}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-foreground text-sm uppercase">{review.client?.name || 'Cliente'}</h3>
                                                    <p className="text-[10px] text-muted-foreground">{dateFormatted}</p>
                                                </div>
                                            </div>
                                            <div className="flex text-yellow-500 gap-1 bg-yellow-500/5 px-2 py-1 rounded-lg border border-yellow-500/20">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-yellow-500' : 'text-muted/20'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <div className="pl-4 border-l-2 border-primary/20">
                                                <p className="text-sm text-foreground/80 italic">"{review.comment}"</p>
                                            </div>
                                        )}
                                        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                            <span>{review.appointment?.service?.name ? `Serviço: ${review.appointment.service.name}` : 'Serviço não identificado'}</span>
                                            {review.appointment?.professional?.name && <span>Profissional: {review.appointment.professional.name}</span>}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function NpsTab({ barbershopId }) {
    const [origin, setOrigin] = useState('');

    useEffect(() => {
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
        <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl"><Gauge className="w-8 h-8" /></div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Pesquisa NPS</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Meça o NPS: o quanto seus clientes recomendam sua barbearia.</p>
                    </div>
                </div>
                <button onClick={copyLink} disabled={!link} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
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
                            {(data.responses || []).length === 0 && <p className="px-6 py-12 text-center text-muted-foreground italic">Nenhuma resposta ainda. Compartilhe o link com seus clientes.</p>}
                            {(data.responses || []).map(r => (
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
        </>
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
