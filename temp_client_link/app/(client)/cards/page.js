'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ChevronLeft, Plus, Trash2, X, Lock } from 'lucide-react';
import api from '../../../lib/clientApi';
import CardForm from '../../../components/payment/CardForm';
import { toast } from 'sonner';

export default function CardsPage() {
    const router = useRouter();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [processingId, setProcessingId] = useState(null); // To track individual card actions

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            // Fetch all cards
            const res = await api.get('/payments/cards');
            setCards(res.data);
        } catch (error) {
            console.error('Failed to fetch cards', error);
            toast.error('Erro ao carregar cartões.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Deseja remover este cartão?')) return;
        setProcessingId(id);
        try {
            await api.delete(`/payments/cards/${id}`);
            toast.success('Cartão removido com sucesso');
            // Optimistic update or refetch
            setCards(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            toast.error('Erro ao remover cartão');
        } finally {
            setProcessingId(null);
        }
    };

    const handleAddCard = async (cardData) => {
        // cardData comes from CardForm (Mercado Pago Brick)
        // It should contain token, issuer_id, payment_method_id, etc.
        try {
            const toastId = toast.loading('Salvando cartão...');

            // Force Global save (barbershopId: null) to ensure portability as requested.
            await api.post('/payments/cards', {
                token: cardData.token,
                barbershopId: null
            });

            toast.dismiss(toastId);
            toast.success('Cartão salvo com sucesso!');

            fetchCards();
            setIsAddModalOpen(false);
        } catch (err) {
            console.error(err);
            toast.dismiss();
            toast.error('Erro ao salvar cartão. Verifique os dados.');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-24 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 bg-slate-900 rounded-full hover:bg-primary/20 transition">
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
                    {/* Add Trigger */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full bg-[#111111] border border-dashed border-slate-800 rounded-2xl p-6 flex items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition group"
                    >
                        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest group-hover:text-primary">Adicionar novo cartão</span>
                    </button>

                    <div className="flex items-center gap-2 mb-2 px-2 mt-6">
                        <Lock className="w-3 h-3 text-primary" />
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Seus cartões salvos para pagamentos rápidos</p>
                    </div>

                    {/* Card List */}
                    {cards.length === 0 && !loading && (
                        <p className="text-center text-slate-600 text-xs py-10">Nenhum cartão salvo.</p>
                    )}

                    {cards.map(card => (
                        <div key={card.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-lg">
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <CreditCard className="w-6 h-6 text-slate-400" />
                                </div>
                                <button
                                    onClick={() => handleDelete(card.id)}
                                    disabled={processingId === card.id}
                                    className="p-2 text-slate-600 hover:text-red-500 transition hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                                >
                                    {processingId === card.id ? (
                                        <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            <div className="relative z-10 mt-2">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Cartão Final</p>
                                <p className="text-2xl font-mono text-white tracking-[0.2em] drop-shadow-lg">•••• {card.last4}</p>
                            </div>

                            <div className="flex justify-between items-end mt-8 relative z-10">
                                <div>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Validade</p>
                                    <p className="text-sm font-bold text-white font-mono">{card.expiryMonth}/{card.expiryYear}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shadow-[0_0_10px_rgba(37,99,235,0.2)]">
                                        {card.brand}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Card Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#0A0A0A] border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-900 rounded-full text-slate-500 hover:text-white transition z-20"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Novo Cartão</h2>
                            <p className="text-xs text-slate-500 mt-2">
                                Adicione os dados do seu cartão para pagamentos e assinaturas.
                            </p>
                        </div>

                        <CardForm
                            amount={1}
                            description="Verificação"
                            barbershopId={null} // Force Global/Platform
                            onSubmit={handleAddCard}
                            onCancel={() => setIsAddModalOpen(false)}
                            forceSave={true} // Force save without asking user
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
