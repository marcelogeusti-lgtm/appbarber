'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function ReviewsPage() {
    const [user, setUser] = useState(null);
    const [barbershopId, setBarbershopId] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const parsed = JSON.parse(userStr);
            setUser(parsed);
            const bId = parsed.barbershopId || parsed.barbershop?.id || parsed.ownedBarbershops?.[0]?.id;
            setBarbershopId(bId);
        }
    }, []);

    const { data: reviews = [], isLoading } = useQuery({
        queryKey: ['reviews', barbershopId],
        queryFn: async () => {
            if (!barbershopId) return [];
            const res = await api.get(`/reviews?barbershopId=${barbershopId}`);
            return res.data;
        },
        enabled: !!barbershopId,
    });

    const isInitialLoading = isLoading && reviews.length === 0;

    if (isInitialLoading) return <div className="p-8 text-center animate-pulse uppercase text-xs font-black text-muted-foreground">Carregando avaliações...</div>;

    const average = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-2xl">
                        <Star className="w-8 h-8 fill-yellow-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Avaliações</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Veja o que seus clientes estão dizendo.</p>
                    </div>
                </div>
                <div className="bg-card border border-border px-6 py-3 rounded-2xl flex items-center gap-4">
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
                            <div key={review.id} className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:border-primary/30 transition group">
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
        </div>
    );
}
