'use client';
import { useState, useEffect } from 'react';
import { Star, User, MessageSquare } from 'lucide-react';
import api from '../../lib/clientApi';

export default function ReviewsTab({ barbershopId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [average, setAverage] = useState(5.0);

    // Create Review State
    const [isWriting, setIsWriting] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [appointmentId, setAppointmentId] = useState(''); // Need to select appointment?
    // Reviewing usually happens linked to an appointment.
    // For now, let's list reviews. Creation might need a specific flow (e.g. from "My Appointments").
    // User requested "Sistema de Avaliação Real".
    // I can list here. Creation might be complex without selecting an appointment.
    // But I can perhaps check if user has unreviewed appointments?
    // Or just let them write and backend validates "last unreviewed appointment"?
    // The backend `createReview` requires `appointmentId`.
    // So usually user clicks "Avaliar" on their appointment history.
    // Here we mainly LIST.

    useEffect(() => {
        if (barbershopId) {
            api.get(`/reviews?barbershopId=${barbershopId}`)
                .then(res => {
                    setReviews(res.data);
                    if (res.data.length > 0) {
                        const sum = res.data.reduce((acc, r) => acc + r.rating, 0);
                        setAverage((sum / res.data.length).toFixed(1));
                    }
                })
                .catch(err => console.error("Error fetching reviews", err))
                .finally(() => setLoading(false));
        }
    }, [barbershopId]);

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return `Há ${diffDays} dias`;
        return date.toLocaleDateString('pt-BR');
    };

    if (loading) return <div className="text-center py-10 text-slate-500 text-xs uppercase tracking-widest animate-pulse">Carregando avaliações...</div>;

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
                {/* 
                <button className="bg-white text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition">
                    Avaliar
                </button>
                */}
                {/* Note: Evaluation should ideally be triggered from "Meus Agendamentos" to link to Appointment */}
            </div>

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
