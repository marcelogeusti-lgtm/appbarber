'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ChevronLeft, Plus, Trash2, Lock } from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#050505] to-black text-white font-sans px-5 pt-8 pb-32 max-w-7xl mx-auto overflow-x-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-10 px-1">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="w-10 h-10 glass-premium rounded-xl flex items-center justify-center text-slate-400 active:scale-95 transition-all">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white uppercase italic tracking-tight">Carteira</h1>
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">Meus cartões salvos</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-10 h-10 glass-premium rounded-xl flex items-center justify-center text-primary active:scale-95 transition-all shadow-lg shadow-primary/10"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {loading ? (
                <div className="space-y-6 px-1">
                    {[1, 2].map(i => <div key={i} className="h-52 glass-premium rounded-[2.5rem] animate-pulse"></div>)}
                </div>
            ) : (
                <div className="space-y-8 px-1">
                    
                    {/* Empty State */}
                    {cards.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-20 h-20 glass-premium rounded-full flex items-center justify-center mb-6 relative">
                                <CreditCard className="w-8 h-8 text-slate-700" strokeWidth={1} />
                                <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-20"></div>
                            </div>
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-2">Nenhum Cartão</h3>
                            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] max-w-xs mx-auto mb-10 text-center">
                                Adicione um cartão para agendamentos mais rápidos e seguros.
                            </p>
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-10 py-5 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
                            >
                                Adicionar Cartão
                            </button>
                        </div>
                    )}

                    {/* Card List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cards.map(card => (
                            <div key={card.id} className="glass-premium rounded-[2.5rem] p-8 relative overflow-hidden group transition-all active:scale-[0.98] border-white/5">
                                {/* Digital Card Glow */}
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 pointer-events-none" />
                                
                                <div className="flex justify-between items-start mb-10 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 glass-premium rounded-2xl flex items-center justify-center text-primary border-white/10">
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{card.brand}</p>
                                            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Crédito Digital</p>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => handleDelete(card.id)}
                                        disabled={processingId === card.id}
                                        className="w-10 h-10 glass-premium rounded-xl flex items-center justify-center text-slate-600 hover:text-red-500 transition-all active:scale-90"
                                    >
                                        {processingId === card.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>

                                <div className="relative z-10 mb-8 px-1">
                                    <p className="text-2xl font-mono text-white tracking-[0.2em] font-medium leading-none mb-1 shadow-sm">
                                        •••• •••• •••• {card.last4}
                                    </p>
                                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.4em] ml-1">Numeração Protegida</p>
                                </div>

                                <div className="flex justify-between items-end relative z-10 px-1 pt-4 border-t border-white/5">
                                    <div>
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">Expira em</p>
                                        <p className="text-sm font-black text-white italic">{card.expiryMonth}/{card.expiryYear}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="w-12 h-8 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
                                            <div className="w-6 h-6 bg-slate-800 rounded-full opacity-20 -mr-2" />
                                            <div className="w-6 h-6 bg-slate-800 rounded-full opacity-20" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-8 opacity-40">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">
                            Pagamentos 100% seguros • PCI DSS Compliance
                        </p>
                    </div>
                </div>
            )}

            {/* Add Card Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-md relative animate-in zoom-in-95 duration-500">
                        <div className="mb-6 flex justify-between items-center px-4">
                            <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Novo Cartão</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 glass-premium rounded-xl flex items-center justify-center text-slate-400">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <div className="glass-premium rounded-[2.5rem] p-4 border-white/10 shadow-2xl overflow-hidden">
                            <CardForm
                                amount={1}
                                description="Verificação de Cartão"
                                barbershopId={null} 
                                onSubmit={handleAddCard}
                                onCancel={() => setIsAddModalOpen(false)}
                                forceSave={true} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
