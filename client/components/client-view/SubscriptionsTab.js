'use client';
import { Crown, Check } from 'lucide-react';
import api from '../../lib/clientApi';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CardForm from '../payment/CardForm';

export default function SubscriptionsTab({ plans = [], barbershopId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showCardModal, setShowCardModal] = useState(false);

    const formatCurrency = (val) => {
        const num = Number(val);
        return !isNaN(num) ? num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
    };

    const handleSubscribeClick = (plan) => {
        setSelectedPlan(plan);
        setShowCardModal(true);
    };

    const handleCardSubmit = async (cardData) => {
        if (!selectedPlan) return;
        setLoading(selectedPlan.id);

        try {
            // cardData contains token, issuerId, paymentMethodId, payer
            await api.post('/subscriptions/purchase', {
                planId: selectedPlan.id,
                paymentMethod: 'CREDIT_CARD',
                gateway: 'mercadopago',
                ...cardData
            });
            alert('Assinatura realizada com sucesso! Bem-vindo ao clube.');
            setShowCardModal(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Erro ao realizar assinatura.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6 pb-24 relative">
            {/* Modal de Pagamento */}
            {showCardModal && selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                        {/* Header do Modal */}
                        <div className="bg-slate-900/50 p-4 border-b border-slate-800 text-center">
                            <h3 className="font-bold text-lg text-emerald-500">Assinar {selectedPlan.name}</h3>
                            <p className="text-sm text-slate-400">{formatCurrency(selectedPlan.price)} / mês</p>
                        </div>

                        {/* Form */}
                        <div className="p-4">
                            <CardForm
                                amount={selectedPlan.price}
                                description={`Assinatura ${selectedPlan.name}`}
                                barbershopId={barbershopId || selectedPlan.barbershopId}
                                onSubmit={handleCardSubmit}
                                onCancel={() => setShowCardModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {plans.length > 0 ? (
                plans.map((plan) => (
                    <div key={plan.id} className="bg-gradient-to-b from-[#1e293b] to-[#111] p-1 rounded-[2.5rem] border border-emerald-500/30">
                        <div className="bg-[#111] rounded-[2.3rem] p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                            </div>

                            <h3 className="font-black text-white text-2xl uppercase tracking-tight mb-2">{plan.name}</h3>
                            <p className="text-slate-400 text-sm mb-6 max-w-[80%]">Assinatura exclusiva para quem busca o melhor custo-benefício.</p>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-emerald-500" />
                                    </div>
                                    <span className="text-slate-300 text-sm font-medium">{plan.quantityOfCuts} Cortes inclusos</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-emerald-500" />
                                    </div>
                                    <span className="text-slate-300 text-sm font-medium">Válido por {plan.validityDays} dias</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-emerald-500" />
                                    </div>
                                    <span className="text-slate-300 text-sm font-medium">Agendamento Prioritário</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Valor do Plano</p>
                                    <p className="text-2xl font-black text-white">{formatCurrency(plan.price)}</p>
                                </div>
                                <button
                                    onClick={() => handleSubscribeClick(plan)}
                                    disabled={loading === plan.id}
                                    className={`bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading === plan.id ? 'Carregando...' : 'Assinar Agora'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-10">
                    <Crown className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Nenhuma assinatura disponível no momento.</p>
                </div>
            )}
        </div>
    );
}
