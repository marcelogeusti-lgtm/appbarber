'use client';
import { Crown, Check, CreditCard, ChevronRight, X, Loader2 } from 'lucide-react';
import api from '../../lib/clientApi';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CardForm from '../payment/CardForm';
import { toast } from 'sonner';

export default function SubscriptionsTab({ plans = [], barbershopId, savedCards = [], onSubscribeSuccess }) {
    const router = useRouter();
    const [loading, setLoading] = useState(null); // planId being processed
    const [selectedPlan, setSelectedPlan] = useState(null);

    // UI States
    const [showCardSelection, setShowCardSelection] = useState(false);
    const [showNewCardForm, setShowNewCardForm] = useState(false);

    const formatCurrency = (val) => {
        const num = Number(val);
        return !isNaN(num) ? num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
    };

    const handleSubscribeClick = (plan) => {
        setSelectedPlan(plan);
        if (savedCards.length > 0) {
            // User has cards, show selection modal (One-Click flow)
            setShowCardSelection(true);
        } else {
            // No cards, show CardForm directly
            setShowNewCardForm(true);
        }
    };

    const handleOneClickSubscribe = async (cardId) => {
        if (!selectedPlan) return;
        setLoading(selectedPlan.id);

        try {
            await api.post('/subscriptions/subscribe', {
                planId: selectedPlan.id,
                cardId: cardId
            });

            setShowCardSelection(false);
            if (onSubscribeSuccess) onSubscribeSuccess();
            else {
                toast.success('Assinatura realizada com sucesso!');
                router.refresh();
            }

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Erro ao realizar assinatura.');
        } finally {
            setLoading(null);
        }
    };

    const handleNewCardSubmit = async (cardData) => {
        // cardData from Brick: token, issuer_id, payment_method_id, etc.
        if (!selectedPlan) return;
        setLoading(selectedPlan.id);

        try {
            // 1. Save Card First (Force Global/Platform save)
            // We use the same endpoint as the Cards Page
            const saveRes = await api.post('/payments/cards', {
                token: cardData.token, // This is the single-use token
                barbershopId: null
            });

            // 2. The response should contain the saved 'cardId' (internal UUID or token)
            // If the endpoint returns the saved card object, we use its ID.
            const savedCardId = saveRes.data.id;

            // 3. Now Subscribe using the newly saved card
            await api.post('/subscriptions/subscribe', {
                planId: selectedPlan.id,
                cardId: savedCardId
            });

            setShowNewCardForm(false);
            if (onSubscribeSuccess) onSubscribeSuccess();
            else {
                toast.success('Assinatura realizada com sucesso!');
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Erro ao processar pagamento.');
            throw error; // Propaga para o Brick encerrar o loading e mostrar tela vermelha
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6 pb-24 relative animate-in fade-in slide-in-from-bottom-4">

            {/* --- MODAL: SELECT CARD (ONE-CLICK) --- */}
            {showCardSelection && selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-sm bg-[#111] border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-white uppercase tracking-tight">Confirmar Assinatura</h3>
                            <button onClick={() => setShowCardSelection(false)} className="p-2 hover:bg-slate-800 rounded-full transition"><X className="w-4 h-4 text-slate-400" /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="text-center mb-6">
                                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Você está assinando</p>
                                <h2 className="text-2xl font-black text-white uppercase">{selectedPlan.name}</h2>
                                <p className="text-primary font-bold text-lg">{formatCurrency(selectedPlan.price)}<span className="text-sm text-slate-500 font-normal">/mês</span></p>
                            </div>

                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Escolha o cartão para cobrança</p>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {savedCards.map(card => (
                                    <button
                                        key={card.id}
                                        onClick={() => handleOneClickSubscribe(card.id)}
                                        disabled={loading === selectedPlan.id}
                                        className="w-full flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-primary/10 hover:border-primary/50 transition group text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition">
                                                <CreditCard className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-xs uppercase">{card.brand} •••• {card.last4}</p>
                                                <p className="text-[10px] text-slate-500">Expira em {card.expiryMonth}/{card.expiryYear}</p>
                                            </div>
                                        </div>
                                        {loading === selectedPlan.id ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary" />}
                                    </button>
                                ))}

                                <button
                                    onClick={() => { setShowCardSelection(false); setShowNewCardForm(true); }}
                                    className="w-full p-4 border border-dashed border-slate-700 rounded-2xl text-slate-500 text-xs font-bold uppercase hover:text-white hover:border-slate-500 transition"
                                >
                                    Usar outro cartão
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: NEW CARD FORM --- */}
            {showNewCardForm && selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-md bg-[#111] border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative">
                        <button onClick={() => setShowNewCardForm(false)} className="absolute top-4 right-4 p-2 bg-slate-900 rounded-full z-20 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>

                        <div className="p-6 pb-2">
                            <h3 className="font-bold text-white uppercase tracking-tight text-lg">Novo Cartão</h3>
                            <p className="text-xs text-slate-500 mt-1">Para assinar <span className="text-white font-bold">{selectedPlan.name}</span></p>
                        </div>

                        <CardForm
                            amount={selectedPlan.price} // For verification
                            description={`Assinatura ${selectedPlan.name}`}
                            barbershopId={barbershopId}
                            onSubmit={handleNewCardSubmit}
                            onCancel={() => setShowNewCardForm(false)}
                            forceSave={true} // Mandatório salvar para assinatura
                        />
                    </div>
                </div>
            )}

            {/* --- PLANS LIST --- */}
            {plans.length > 0 ? (
                plans.map((plan) => (
                    <div key={plan.id} className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] p-[1px] rounded-[2.5rem] border border-primary/10 hover:border-primary/30 transition group">
                        <div className="bg-[#0A0A0A] rounded-[2.4rem] p-6 relative overflow-hidden h-full flex flex-col">

                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
                                        <Crown className="w-3 h-3 text-primary fill-primary" />
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Premium</span>
                                    </div>
                                    <h3 className="font-black text-white text-2xl uppercase tracking-tight leading-none">{plan.name}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-white">{formatCurrency(plan.price)}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">/ Mês</p>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-slate-300 text-sm font-medium">{plan.quantityOfCuts} Cortes inclusos</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-slate-300 text-sm font-medium">Válido por {plan.validityDays} dias</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-slate-300 text-sm font-medium">Prioridade no agendamento</span>
                                </div>
                            </div>

                            {/* Action */}
                            <button
                                onClick={() => handleSubscribeClick(plan)}
                                disabled={loading === plan.id}
                                className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition shadow-xl hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-[1.02] active:scale-95"
                            >
                                {loading === plan.id ? 'Processando...' : 'Assinar Agora'}
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-20 bg-[#0A0A0A] rounded-[3rem] border border-dashed border-slate-800">
                    <Crown className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nenhuma assinatura disponível.</p>
                </div>
            )}
        </div>
    );
}
