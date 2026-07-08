'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Cake, Send, Gift, CalendarDays } from 'lucide-react';
import api from '../../../lib/api';

export default function BirthdaysPage() {
    const queryClient = useQueryClient();
    const [barbershopId, setBarbershopId] = useState(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) { try { const p = JSON.parse(u); setBarbershopId(p.barbershopId || p.barbershop?.id || p.ownedBarbershops?.[0]?.id); } catch (e) { } }
    }, []);

    const { data = { today: [], month: [] }, isLoading } = useQuery({
        queryKey: ['birthdays', barbershopId],
        queryFn: async () => (await api.get(`/birthdays?barbershopId=${barbershopId}`)).data,
        enabled: !!barbershopId,
    });

    const sendOne = async (clientId) => {
        try { await api.post('/birthdays/send', { barbershopId, clientId }); alert('Parabéns enviado! 🎉'); }
        catch (e) { alert(e.response?.data?.message || 'Erro ao enviar.'); }
    };
    const sendAllToday = async () => {
        if (!confirm(`Enviar parabéns para os ${data.today.length} aniversariante(s) de hoje?`)) return;
        setSending(true);
        try { const { data: r } = await api.post('/birthdays/send', { barbershopId }); alert(`${r.sent} mensagem(ns) enviada(s)!`); }
        catch (e) { alert('Erro ao enviar.'); }
        finally { setSending(false); }
    };

    const bd = (d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl"><Cake className="w-8 h-8" /></div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Aniversariantes</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Parabenize seus clientes e traga eles de volta.</p>
                    </div>
                </div>
                {data.today.length > 0 && (
                    <button onClick={sendAllToday} disabled={sending} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                        <Send className="w-4 h-4" /> Parabenizar todos de hoje
                    </button>
                )}
            </header>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-start gap-3">
                <Gift className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-muted-foreground font-medium">
                    <span className="font-black text-foreground">Automático:</span> todo dia às 9h da manhã o sistema envia uma mensagem de parabéns automática por WhatsApp para quem faz aniversário. Você também pode enviar manualmente aqui.
                </p>
            </div>

            {isLoading && <p className="text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest py-10">Carregando...</p>}

            {/* Hoje */}
            <section>
                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 border-l-4 border-primary pl-3 flex items-center gap-2"><Cake className="w-4 h-4" /> Aniversariantes de hoje ({data.today.length})</h3>
                <div className="bg-card border border-border rounded-xl divide-y divide-border/50">
                    {data.today.length === 0 && <p className="px-6 py-10 text-center text-muted-foreground italic">Ninguém faz aniversário hoje.</p>}
                    {data.today.map(c => (
                        <div key={c.id} className="flex items-center gap-4 px-6 py-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">🎂</div>
                            <div className="flex-1 min-w-0"><p className="font-black text-foreground uppercase tracking-tight truncate">{c.name}</p><p className="text-[11px] text-muted-foreground">{c.phone}</p></div>
                            <button onClick={() => sendOne(c.id)} className="px-5 py-2.5 rounded-lg border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all">Parabenizar</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mês */}
            <section>
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 border-l-4 border-border pl-3 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Aniversariantes do mês ({data.month.length})</h3>
                <div className="bg-card border border-border rounded-xl divide-y divide-border/50">
                    {data.month.length === 0 && <p className="px-6 py-10 text-center text-muted-foreground italic">Nenhum aniversariante neste mês.</p>}
                    {data.month.map(c => (
                        <div key={c.id} className="flex items-center gap-4 px-6 py-3">
                            <span className="w-12 text-center font-black text-primary tabular-nums text-sm">{bd(c.birthDate)}</span>
                            <div className="flex-1 min-w-0"><p className="font-bold text-foreground truncate">{c.name}</p></div>
                            <span className="text-[11px] text-muted-foreground">{c.phone}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
