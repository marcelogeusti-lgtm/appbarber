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
            <div className="flex items-center gap-3 mb-12 px-1">
                <button onClick={() => router.back()} className="text-white active:scale-90 transition-transform">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-medium text-white">Meus cartões</h1>
            </div>

            {loading ? (
                <div className="space-y-6 px-1">
                    {[1, 2].map(i => <div key={i} className="h-52 glass-premium rounded-[2.5rem] animate-pulse"></div>)}
                </div>
            ) : (
                <div className="space-y-8 px-1">
                    
                    {/* Empty State */}
                    {cards.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="relative w-64 h-48 mb-16 mt-8 flex justify-center">
                                {/* Back Card (Mastercard) */}
                                <div className="absolute top-0 right-4 w-52 h-32 bg-[#E2E8F0] rounded-xl shadow-xl transform rotate-12 transition-transform duration-500 hover:rotate-6">
                                    <div className="absolute top-4 left-4 flex gap-[-10px]">
                                        <div className="w-8 h-8 rounded-full bg-[#EB001B] opacity-90 z-10"></div>
                                        <div className="w-8 h-8 rounded-full bg-[#F79E1B] opacity-90 -ml-3 z-0"></div>
                                    </div>
                                </div>
                                {/* Front Card (Visa) */}
                                <div className="absolute bottom-0 left-4 w-52 h-32 bg-[#1877F2] rounded-xl shadow-2xl p-5 flex flex-col justify-between transform -rotate-6 transition-transform duration-500 hover:rotate-0 border border-white/10">
                                    <h3 className="text-white font-black text-xl italic tracking-wider text-left">VISA</h3>
                                    <div>
                                        <p className="text-white/80 font-mono tracking-widest text-xs mb-2 text-left opacity-80">•••• •••• •••• ••••</p>
                                        <div className="w-12 h-4 bg-white/20 rounded-md"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="w-full max-w-[280px] py-4 rounded-xl border border-emerald-500 text-emerald-500 text-sm font-medium hover:bg-emerald-500/10 transition-colors active:scale-95"
                            >
                                Adicionar novo cartão
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
                <div className="fixed inset-0 z-[100] flex flex-col bg-[#0A0A0A] animate-in fade-in duration-300 overflow-y-auto pb-safe">
                    <div className="px-5 pt-12 pb-6">
                        <div className="flex items-center gap-3 mb-1">
                            <button onClick={() => setIsAddModalOpen(false)} className="text-white active:scale-90 transition-transform">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <h2 className="text-lg font-medium text-white">Adicionar novo cartão</h2>
                        </div>
                        <p className="text-slate-400 text-sm ml-9">Cadastre um novo cartão de crédito</p>
                    </div>
                    
                    <div className="px-5 pb-10 flex-1">
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
            )}
        </div>
    );
}
