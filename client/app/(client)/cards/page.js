'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ChevronLeft, Plus, Trash2, X, Store } from 'lucide-react';
import api from '../../../lib/clientApi';
import CardForm from '../../../components/payment/CardForm';

export default function CardsPage() {
    const router = useRouter();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [barbershopId, setBarbershopId] = useState(null);

    useEffect(() => {
        fetchCards();
        // 1. Try last visited
        const storedId = localStorage.getItem('lastBarbershopId');
        if (storedId) {
            setBarbershopId(storedId);
        } else {
            // 2. Try from user object/session
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    // If user is effectively linked to a shop (e.g. explicit client relation)
                    if (user.preferredBarbershopId) setBarbershopId(user.preferredBarbershopId);
                }
            } catch (e) {
                console.error("Error parsing user", e);
            }
        }
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
        if (!confirm('Deseja remover este cartão?')) return;
        try {
            await api.delete(`/payments/cards/${id}`);
            fetchCards();
        } catch (err) {
            alert('Erro ao remover cartão');
        }
    };

    const handleAddCard = async (cardData) => {
        if (!barbershopId) {
            alert('Erro: Nenhuma barbearia identificada para vincular o cartão.');
            return;
        }
        try {
            await api.post('/payments/cards', {
                token: cardData.token,
                barbershopId: barbershopId
            });
            fetchCards();
            setIsAddModalOpen(false);
        } catch (err) {
            alert('Erro ao salvar cartão');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-24">
            {/* Header */}
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
                    {/* Add Trigger */}
                    <button
                        onClick={() => {
                            if (!barbershopId) {
                                // Instead of alert, show modal with specific state or navigate
                                // For now, keep as a soft "block" but with UI feedback below
                                setIsAddModalOpen(true); // Open modal anyway to show the "Select Shop" message nicely
                                return;
                            }
                            setIsAddModalOpen(true);
                        }}
                        className="w-full bg-[#111111] border border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition group"
                    >
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition">
                            <Plus className="w-6 h-6 text-slate-400 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-black text-slate-500 uppercase tracking-widest group-hover:text-emerald-500">Adicionar novo cartão</span>
                    </button>

                    {!barbershopId && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 mb-4">
                            <Store className="w-5 h-5 text-yellow-500 shrink-0" />
                            <p className="text-xs text-yellow-200/80 leading-relaxed">
                                Para adicionar um cartão, você precisa estar vinculado a uma barbearia (ter visitado ou agendado recentemente).
                                Isso é necessário para configurar seu pagamento com segurança na gateway correta.
                            </p>
                        </div>
                    )}

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

                        {barbershopId ? (
                            <CardForm
                                amount={1} // Just for validation
                                description="Verificação de Cartão"
                                barbershopId={barbershopId}
                                onSubmit={handleAddCard}
                                onCancel={() => setIsAddModalOpen(false)}
                            />
                        ) : (
                            <div className="text-center py-10 flex flex-col items-center gap-6">
                                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center">
                                    <Store className="w-10 h-10 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-white font-bold mb-2">Nenhuma Barbearia Selecionada</p>
                                    <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mx-auto">
                                        Para adicionar um cartão, precisamos saber em qual barbearia você pretende usá-lo, pois cada uma possui seu processador de pagamentos.
                                    </p>
                                </div>
                                <div className="flex gap-4 w-full">
                                    <button
                                        onClick={() => router.push('/search')}
                                        className="flex-1 bg-emerald-500 text-white p-4 rounded-xl font-bold hover:bg-emerald-600 transition"
                                    >
                                        Encontrar Barbearia
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
