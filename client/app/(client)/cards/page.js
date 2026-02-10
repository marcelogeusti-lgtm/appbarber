'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ChevronLeft, Plus, Trash2, X, Store, Globe, Lock } from 'lucide-react';
import api from '../../../lib/clientApi';
import CardForm from '../../../components/payment/CardForm';
import { toast } from 'sonner';

export default function CardsPage() {
    const router = useRouter();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [barbershopId, setBarbershopId] = useState(null);

    useEffect(() => {
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
                    if (user.preferredBarbershopId) setBarbershopId(user.preferredBarbershopId);
                }
            } catch (e) {
                console.error("Error parsing user", e);
            }
        }
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            // Fetch all cards (Global + Local)
            const res = await api.get('/payments/cards');
            // Note: backend 'listCards' now returns mixed list if we don't pass specific filter, or we can pass filter.
            // But we want user to see all their cards here.
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
            toast.success('Cartão removido com sucesso');
            fetchCards();
        } catch (err) {
            toast.error('Erro ao remover cartão');
        }
    };

    const handleAddCard = async (cardData) => {
        try {
            // If we have a barbershopId context, we *could* link it.
            // BUT, user wants "Global Wallet" behavior.
            // So, unless required, we should save as Global (null).
            // However, CardForm uses a specific Public Key.
            // If CardForm used Shop Key, we MUST save with Shop ID.
            // If CardForm used Platform Key (null ID), we MUST save as Global.

            // To ensure consistency, we will force the CardForm to use specific context based on intention.
            // For now, let's respect the current barbershopId context if present, 
            // BUT allow saving even if it's null (Global).

            await api.post('/payments/cards', {
                token: cardData.token,
                barbershopId: barbershopId || null // Explicitly null if not set
            });

            toast.success('Cartão salvo com sucesso!');
            fetchCards();
            setIsAddModalOpen(false);
        } catch (err) {
            console.error(err);
            toast.error('Erro ao salvar cartão. Verifique os dados.');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 bg-slate-900 rounded-full hover:bg-emerald-500/20 transition">
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-xl font-bold uppercase tracking-tight">Carteira de Pagamentos</h1>
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
                        className="w-full bg-[#111111] border border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition group"
                    >
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition">
                            <Plus className="w-6 h-6 text-slate-400 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-black text-slate-500 uppercase tracking-widest group-hover:text-emerald-500">Adicionar novo cartão</span>
                    </button>

                    <div className="flex items-center gap-2 mb-2 px-2">
                        <Lock className="w-3 h-3 text-slate-600" />
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Seus cartões salvos</p>
                    </div>

                    {/* Card List */}
                    {cards.length === 0 && !loading && (
                        <p className="text-center text-slate-600 text-xs py-10">Você ainda não possui cartões salvos.</p>
                    )}

                    {cards.map(card => (
                        <div key={card.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-xl">
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <CreditCard className="w-6 h-6 text-slate-400" />
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Tag Global vs Local */}
                                    {card.isGlobal ? (
                                        <div className="px-2 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1">
                                            <Globe className="w-3 h-3 text-indigo-400" />
                                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider">Global</span>
                                        </div>
                                    ) : (
                                        <div className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700 flex items-center gap-1">
                                            <Store className="w-3 h-3 text-slate-500" />
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[80px]">
                                                {card.barbershopName}
                                            </span>
                                        </div>
                                    )}

                                    <button onClick={() => handleDelete(card.id)} className="p-2 text-slate-600 hover:text-red-500 transition hover:bg-red-500/10 rounded-lg">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="relative z-10 mt-2">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Número do Cartão</p>
                                <p className="text-2xl font-mono text-white tracking-[0.2em] drop-shadow-lg">•••• •••• •••• {card.last4}</p>
                            </div>

                            <div className="flex justify-between items-end mt-8 relative z-10">
                                <div>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Validade</p>
                                    <p className="text-sm font-bold text-white font-mono">{card.expiry}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                        {card.brand}
                                    </p>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full group-hover:bg-emerald-500/10 transition duration-1000"></div>
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
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

                        <div className="mb-6 text-center">
                            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                                {barbershopId ? <Store className="w-5 h-5 text-emerald-500" /> : <Globe className="w-5 h-5 text-indigo-500" />}
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Adicionar Cartão</h2>
                            <p className="text-xs text-slate-500 mt-2 max-w-[200px] mx-auto">
                                {barbershopId
                                    ? "Este cartão será vinculado preferencialmente a esta barbearia."
                                    : "Este cartão será salvo na sua Carteira Global para uso em qualquer lugar."
                                }
                            </p>
                        </div>

                        <CardForm
                            amount={1}
                            description="Verificação de Cartão"
                            barbershopId={barbershopId || null} // Pass null if explicit global
                            onSubmit={handleAddCard}
                            onCancel={() => setIsAddModalOpen(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
