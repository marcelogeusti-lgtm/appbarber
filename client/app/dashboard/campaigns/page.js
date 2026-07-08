'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Send, Users, Cake } from 'lucide-react';
import api from '../../../lib/api';

export default function CampaignsPage() {
    const queryClient = useQueryClient();
    const [barbershopId, setBarbershopId] = useState(null);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [audience, setAudience] = useState('ALL');
    const [progress, setProgress] = useState(null); // {sent,total}
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) { try { const p = JSON.parse(u); setBarbershopId(p.barbershopId || p.barbershop?.id || p.ownedBarbershops?.[0]?.id); } catch (e) { } }
    }, []);

    const { data: preview } = useQuery({
        queryKey: ['campaign-preview', barbershopId, audience],
        queryFn: async () => (await api.get(`/campaigns/preview?barbershopId=${barbershopId}&audience=${audience}`)).data,
        enabled: !!barbershopId,
    });

    const { data: history = [] } = useQuery({
        queryKey: ['campaigns', barbershopId],
        queryFn: async () => (await api.get(`/campaigns?barbershopId=${barbershopId}`)).data,
        enabled: !!barbershopId,
    });

    const send = async () => {
        if (!title.trim() || !message.trim()) { alert('Preencha título e mensagem.'); return; }
        if (!confirm(`Enviar "${title}" para ${preview?.total || 0} cliente(s) via WhatsApp?`)) return;
        setSending(true);
        setProgress({ sent: 0, total: preview?.total || 0 });
        try {
            const { data: campaign } = await api.post('/campaigns', { barbershopId, title, message, audience });
            let offset = 0, done = false;
            while (!done) {
                const { data } = await api.post(`/campaigns/${campaign.id}/send-batch`, { offset, limit: 15 });
                offset = data.nextOffset;
                done = data.done;
                setProgress({ sent: data.totalSent, total: data.total });
            }
            alert('Campanha enviada! 🎉');
            setTitle(''); setMessage('');
            queryClient.invalidateQueries({ queryKey: ['campaigns', barbershopId] });
        } catch (e) {
            alert(e.response?.data?.message || 'Erro no envio.');
        } finally { setSending(false); setProgress(null); }
    };

    return (
        <div className="space-y-8 pb-20">
            <header className="flex items-center gap-4 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="p-3 bg-primary/10 text-primary rounded-xl"><Megaphone className="w-8 h-8" /></div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Notícias & Promoções</h1>
                    <p className="text-muted-foreground text-sm font-medium italic">Envie comunicados e promoções para seus clientes por WhatsApp.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Compositor */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-8 space-y-5">
                    <div>
                        <label className="camp-l">Título (interno)</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Promoção de terça" className="camp-i" />
                    </div>
                    <div>
                        <label className="camp-l">Mensagem</label>
                        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Escreva a mensagem que o cliente vai receber no WhatsApp..." className="camp-i resize-none" />
                        <p className="text-[11px] text-muted-foreground italic mt-1">{message.length} caracteres</p>
                    </div>
                    <div>
                        <label className="camp-l">Público</label>
                        <div className="flex gap-3">
                            <button onClick={() => setAudience('ALL')} className={`flex-1 py-4 rounded-xl border text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${audience === 'ALL' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}><Users className="w-4 h-4" /> Todos os clientes</button>
                            <button onClick={() => setAudience('BIRTHDAY_MONTH')} className={`flex-1 py-4 rounded-xl border text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${audience === 'BIRTHDAY_MONTH' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}><Cake className="w-4 h-4" /> Aniversariantes do mês</button>
                        </div>
                    </div>

                    {progress && (
                        <div className="space-y-2">
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress.total ? (progress.sent / progress.total) * 100 : 0}%` }} />
                            </div>
                            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest text-center">Enviando {progress.sent} de {progress.total}...</p>
                        </div>
                    )}

                    <button onClick={send} disabled={sending} className="w-full bg-primary text-primary-foreground py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50">
                        <Send className="w-5 h-5" /> {sending ? 'Enviando...' : `Enviar para ${preview?.total ?? '...'} cliente(s)`}
                    </button>
                </div>

                {/* Histórico */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-border bg-muted/20"><h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.15em]">Enviadas</h3></div>
                    <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
                        {history.length === 0 && <p className="px-6 py-10 text-center text-muted-foreground italic text-sm">Nenhuma campanha ainda.</p>}
                        {history.map(c => (
                            <div key={c.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <p className="font-bold text-foreground text-sm truncate">{c.title}</p>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${c.status === 'DONE' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{c.status === 'DONE' ? 'Enviada' : c.status}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">{c.sentCount}/{c.total} · {new Date(c.createdAt).toLocaleDateString('pt-BR')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .camp-l { display:block; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:0.15em; color:hsl(var(--muted-foreground)); margin-bottom:8px; margin-left:4px; }
                .camp-i { width:100%; background:hsl(var(--background)); border:1px solid hsl(var(--border)); border-radius:0.75rem; padding:0.85rem 1rem; font-size:0.9rem; font-weight:600; color:hsl(var(--foreground)); outline:none; }
                .camp-i:focus { box-shadow:0 0 0 2px hsl(var(--primary)); }
            `}</style>
        </div>
    );
}
