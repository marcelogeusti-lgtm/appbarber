'use client';
import { useState, useEffect } from 'react';
import { Star, User, MessageSquare } from 'lucide-react';
import api from '../../lib/clientApi';

export default function ReviewsTab({ barbershopId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [average, setAverage] = useState(5.0);

    const [unreviewed, setUnreviewed] = useState([]);

    useEffect(() => {
        if (barbershopId && localStorage.getItem('token')) {
            // Fetch unreviewed appointments to allow the user to write a review
            api.get(`/appointments/unreviewed?barbershopId=${barbershopId}`)
                .then(res => setUnreviewed(res.data))
                .catch(err => console.error("Error fetching unreviewed apps", err));
        }
    }, [barbershopId]);

    const handleSubmitReview = async () => {
        if (!comment && rating === 0) return;
        setLoading(true);
        try {
            await api.post('/reviews', {
                appointmentId: unreviewed[0].id,
                rating,
                comment
            });
            toast.success('Avaliação enviada com sucesso!');
            setIsWriting(false);
            // Refresh reviews
            const res = await api.get(`/reviews?barbershopId=${barbershopId}`);
            setReviews(res.data);
            setUnreviewed(prev => prev.slice(1));
        } catch (error) {
            toast.error('Erro ao enviar avaliação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-24">
            {/* Summary */}
            <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="text-5xl font-black text-white tracking-tighter">{average}</h3>
                    <div className="flex text-yellow-500 gap-1 my-2">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(average) ? 'fill-yellow-500' : 'text-slate-800'}`} />)}
                    </div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Baseado em {reviews.length} avaliações</p>
                </div>

                {unreviewed.length > 0 && !isWriting && (
                    <button
                        onClick={() => setIsWriting(true)}
                        className="bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20"
                    >
                        Avaliar Última Visita
                    </button>
                )}
            </div>

            {/* Writing Form */}
            {isWriting && unreviewed.length > 0 && (
                <div className="bg-[#0b0f19] p-6 rounded-[2rem] border border-emerald-500/30 animate-in slide-in-from-top-4">
                    <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Sua avaliação para {unreviewed[0].service?.name}</h4>
                    <div className="flex gap-2 mb-6 justify-center">
                        {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} onClick={() => setRating(s)} className="p-1">
                                <Star className={`w-8 h-8 ${s <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-700'}`} />
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Como foi sua experiência? (Opcional)"
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-emerald-500 transition h-24 mb-4 resize-none"
                    />
                    <div className="flex gap-3">
                        <button onClick={handleSubmitReview} className="flex-1 bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition">Enviar Avaliação</button>
                        <button onClick={() => setIsWriting(false)} className="px-6 py-4 rounded-xl font-black text-[10px] uppercase text-slate-500 hover:text-white transition">Cancelar</button>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            {!Array.isArray(reviews) || reviews.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                    <p className="text-sm font-bold uppercase tracking-widest">Seja o primeiro a avaliar!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-[#111] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden">
                                        {review.client?.avatarUrl ? (
                                            <img src={review.client.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-xs uppercase">{review.client?.name || 'Cliente Anônimo'}</p>
                                        <div className="flex text-yellow-500 gap-0.5 mt-0.5">
                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-2.5 h-2.5 ${s <= review.rating ? 'fill-yellow-500' : 'text-slate-800'}`} />)}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-600 font-bold uppercase">{formatTime(review.createdAt)}</span>
                            </div>
                            {review.comment && (
                                <p className="text-slate-400 text-sm leading-relaxed border-l-2 border-emerald-500/20 pl-3">
                                    "{review.comment}"
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
