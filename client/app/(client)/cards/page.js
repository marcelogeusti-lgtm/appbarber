'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ChevronLeft, Plus, Trash2, X } from 'lucide-react';
import api from '../../lib/clientApi';
import CardForm from '../../components/payment/CardForm';

export default function CardsPage() {
    const router = useRouter();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const res = await api.get('/payments/cards');
            setCards(res.data);
        } catch (error) {
            console.error('Failed to fetch cards', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Remover este cartão?')) {
            try {
                // Assuming we have a DELETE route, or we need to add one. 
                // For now, let's just use the cards endpoint if supported, 
                // but usually, it's DELETE /api/payments/cards/:id
                await api.delete(`/payments/cards/${id}`);
                setCards(cards.filter(c => c.id !== id));
            } catch (err) {
                alert('Erro ao remover cartão');
            }
        }
    };

    const handleAddCard = async (cardData) => {
        try {
            await api.post('/payments/cards', {
                token: cardData.token,
                // barbershopId is tricky here if general, but let's assume we can pass null or a global one
                // Usually cards are linked to a shop in this app's architecture
                barbershopId: localStorage.getItem('lastBarbershopId') // We need a way to context this
            });
            fetchCards();
            setIsAddModalOpen(false);
        } catch (err) {
            alert('Erro ao salvar cartão');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 bg-slate-900 rounded-full hover:bg-emerald-500/20 transition">
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-xl font-bold uppercase tracking-tight">Meus Cartões</h1>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-40 bg-slate-900/50 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Add New Card Button */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full bg-[#111111] border border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition group"
                    >
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition">
                            <Plus className="w-6 h-6 text-slate-400 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-black text-slate-500 uppercase tracking-widest group-hover:text-emerald-500">Adicionar novo cartão</span>
                    </button>

                    {/* Card List */}
                    {cards.length === 0 && !loading && (
                        <p className="text-center text-slate-600 text-xs py-10">Você ainda não possui cartões salvos.</p>
                    )}

                    {cards.map(card => (
                        <div key={card.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-xl">
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <CreditCard className="w-6 h-6 text-slate-400" />
                                </div>
                                <button onClick={() => handleDelete(card.id)} className="p-2 text-slate-600 hover:text-red-500 transition hover:bg-red-500/10 rounded-lg">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="relative z-10">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Número do Cartão</p>
                                <p className="text-2xl font-mono text-white tracking-[0.2em]">•••• •••• •••• {card.last4}</p>
                            </div>

                            <div className="flex justify-between items-end mt-8 relative z-10">
                                <div>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Validade</p>
                                    <p className="text-sm font-bold text-white font-mono">{card.expiry}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">{card.brand}</p>
                                </div>
                            </div>

                            {/* Decorative blur */}
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/5 blur-[80px] rounded-full"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Card Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-md bg-[#0A0A0A] border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-900 rounded-full text-slate-500 hover:text-white transition"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8">Novo Cartão</h2>

                        <CardForm
                            amount={1} // Just for validation
                            description="Verificação de Cartão"
                            onSubmit={handleAddCard}
                            onCancel={() => setIsAddModalOpen(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
