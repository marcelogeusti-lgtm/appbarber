'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ChevronLeft,
    Repeat,
    Check,
    AlertCircle,
    CreditCard,
    Smartphone,
    Zap,
    Loader2,
    ArrowRight,
    Plus,
    Search as SearchIcon
} from 'lucide-react';
import api from '../../../lib/clientApi';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../../../lib/storage';

export default function SubscriptionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const barbershopIdParam = searchParams.get('barbershopId');

    const [subscription, setSubscription] = useState(null);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [checkoutData, setCheckoutData] = useState(null); // For PIX QR Code or Stripe
    const [error, setError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('PIX'); // PIX | CREDIT_CARD
    const [savedCards, setSavedCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState('');
    const [loadingCards, setLoadingCards] = useState(false);

    useEffect(() => {
        fetchData();
        // Check if returning from login to complete a subscription
        const pendingPlanStr = safeGetItem('pending_subscription');
        if (pendingPlanStr) {
            try {
                const plan = JSON.parse(pendingPlanStr);
                safeRemoveItem('pending_subscription');
                handleSubscribe(plan);
            } catch (e) {
                console.error('Error parsing pending subscription', e);
                safeRemoveItem('pending_subscription');
            }
        }
    }, [barbershopIdParam]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = safeGetItem('clientToken');
            if (!token) {
                // Not logged in: we can skip my-active check
                setLoading(false);
                return;
            }

            // 1. Fetch active sub
            const subRes = await api.get('/subscriptions/my-active');
            setSubscription(subRes.data);

            // 2. Fetch cards if logged in
            fetchCards();

            // 3. If no active sub or specifically looking for a shop, fetch plans
            const bId = barbershopIdParam || subRes.data?.plan?.barbershopId;
            if (bId) {
                const plansRes = await api.get(`/subscriptions?barbershopId=${bId}`);
                setPlans(plansRes.data);
            }
        } catch (error) {
            console.error('Fetch Data Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCards = async () => {
        try {
            setLoadingCards(true);
            const res = await api.get('/cards');
            setSavedCards(res.data);
            if (res.data.length > 0) {
                setSelectedCardId(res.data[0].id);
                setPaymentMethod('CREDIT_CARD');
            }
        } catch (e) {
            console.error('Error fetching cards:', e);
        } finally {
            setLoadingCards(false);
        }
    };

    const handleSubscribe = async (plan) => {
        const token = safeGetItem('clientToken');
        if (!token) {
            // Unauthenticated: save context and redirect
            safeSetItem('pending_subscription', JSON.stringify(plan));
            router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
            return;
        }

        if (!selectedPlan) {
            setSelectedPlan(plan);
            return; // Show selection UI first
        }

        setActionLoading(true);
        setError('');
        try {
            const res = await api.post('/subscriptions/purchase', {
                planId: plan.id,
                paymentMethod,
                cardId: paymentMethod === 'CREDIT_CARD' ? selectedCardId : null,
                gateway: 'velify' // Orchestrator will auto-detect if not provided, but keeping for safety
            });

            setCheckoutData(res.data.payment);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao iniciar assinatura.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    // --- PAYMENT SELECTION VIEW ---
    if (selectedPlan && !checkoutData) {
        return (
            <div className="min-h-screen bg-[#050505] text-white p-6 pb-24">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setSelectedPlan(null)} className="p-2 bg-slate-900 rounded-full">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-xl font-bold uppercase tracking-tighter">Escolha o Pagamento</h1>
                </div>

                <div className="max-w-md mx-auto space-y-6">
                    {/* Plan Summary */}
                    <div className="bg-[#111111] border border-white/5 rounded-[2.5rem] p-6 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Plano Selecionado</p>
                            <h3 className="font-black text-white uppercase">{selectedPlan.name}</h3>
                        </div>
                        <p className="font-black text-primary">R$ {Number(selectedPlan.price).toFixed(2)}</p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Método de Pagamento</p>

                        <div
                            onClick={() => setPaymentMethod('PIX')}
                            className={`p-5 rounded-[2rem] border cursor-pointer transition-all ${paymentMethod === 'PIX' ? 'bg-primary/10 border-primary' : 'bg-[#111111] border-white/5 opacity-60'}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'PIX' ? 'bg-primary text-white' : 'bg-slate-900'}`}>
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <p className="font-black text-xs uppercase">PIX (Instantâneo)</p>
                                        <p className="text-[10px] text-slate-500">Aprovação em segundos</p>
                                    </div>
                                </div>
                                {paymentMethod === 'PIX' && <div className="w-4 h-4 bg-primary rounded-full"></div>}
                            </div>
                        </div>

                        <div
                            onClick={() => setPaymentMethod('CREDIT_CARD')}
                            className={`p-5 rounded-[2rem] border cursor-pointer transition-all ${paymentMethod === 'CREDIT_CARD' ? 'bg-primary/10 border-primary' : 'bg-[#111111] border-white/5 opacity-60'}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === 'CREDIT_CARD' ? 'bg-primary text-white' : 'bg-slate-900'}`}>
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <p className="font-black text-xs uppercase">Cartão de Crédito</p>
                                        <p className="text-[10px] text-slate-500">Pague com cartões salvos ou novo</p>
                                    </div>
                                </div>
                                {paymentMethod === 'CREDIT_CARD' && <div className="w-4 h-4 bg-primary rounded-full"></div>}
                            </div>
                        </div>
                    </div>

                    {paymentMethod === 'CREDIT_CARD' && (
                        <div className="animate-in slide-in-from-top-4 space-y-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Meus Cartões</p>

                            {savedCards.length > 0 ? (
                                <div className="space-y-3">
                                    {savedCards.map(card => (
                                        <div
                                            key={card.id}
                                            onClick={() => setSelectedCardId(card.id)}
                                            className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${selectedCardId === card.id ? 'bg-white/5 border-white/20' : 'bg-transparent border-white/5 opacity-50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="w-4 h-4 text-slate-400" />
                                                <p className="text-xs font-bold uppercase">•••• {card.last4} ({card.brand})</p>
                                            </div>
                                            {selectedCardId === card.id && <Check className="w-4 h-4 text-primary" />}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[10px] text-slate-600 text-center italic py-2">Nenhum cartão salvo encontrado.</p>
                            )}

                            <button
                                className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-[10px] font-bold text-slate-500 uppercase hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2"
                                onClick={() => alert('Integração de checkout do cartão está sendo finalizada no gateway.')}
                            >
                                <Plus className="w-3 h-3" /> Adicionar Novo Cartão
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => handleSubscribe(selectedPlan)}
                        disabled={actionLoading || (paymentMethod === 'CREDIT_CARD' && savedCards.length === 0)}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-[2rem] text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 disabled:opacity-30 mt-8 shadow-2xl shadow-primary/20"
                    >
                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirmar e Pagar <ArrowRight className="w-4 h-4" /></>}
                    </button>

                    {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center mt-4">{error}</p>}
                </div>
            </div>
        );
    }

    // --- CHECKOUT VIEW (PIX / Payment Info) ---
    if (checkoutData) {
        return (
            <div className="min-h-screen bg-[#050505] text-white p-6 pb-24">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setCheckoutData(null)} className="p-2 bg-slate-900 rounded-full">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-xl font-bold uppercase tracking-tighter">Pagamento da Assinatura</h1>
                </div>

                <div className="max-w-md mx-auto bg-[#111111] border border-white/5 rounded-[2.5rem] p-8 text-center space-y-8">
                    <div className="space-y-2">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto">
                            <Zap className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-black uppercase">{selectedPlan?.name}</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-none">
                            R$ {(() => {
                                const price = Number(selectedPlan?.price);
                                return !isNaN(price) ? price.toFixed(2) : '0.00';
                            })()} / mês
                        </p>
                    </div>

                    {checkoutData.qrCode ? (
                        <div className="space-y-6">
                            <div className="bg-white p-4 rounded-3xl inline-block shadow-2xl">
                                {/* Normally use a QRCode component, here using placeholder or img if available */}
                                {checkoutData.qrCodeBase64 ? (
                                    <img src={`data:image/png;base64,${checkoutData.qrCodeBase64}`} alt="PIX" className="w-48 h-48" />
                                ) : (
                                    <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-black text-[8px] font-mono break-all p-4">
                                        {checkoutData.qrCode}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <p className="text-xs text-slate-400 font-medium">Escaneie o QR Code acima ou copie a chave abaixo:</p>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(checkoutData.qrCode); alert('Copiado!'); }}
                                    className="w-full py-4 bg-slate-900 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition truncate px-4"
                                >
                                    Copiar Código PIX
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12">
                            <p className="text-sm text-slate-400">Processando checkout...</p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-white/5 flex items-start gap-3 text-left">
                        <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                            Sua assinatura será ativada instantaneamente após a confirmação do pagamento. Você receberá um e-mail de confirmação.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-24 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 bg-slate-900 rounded-full hover:bg-primary/20 transition">
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-xl font-black uppercase tracking-tighter">Clube de Assinatura</h1>
            </div>

            {/* MY ACTIVE SUBSCRIPTION */}
            {subscription && (
                <div className="mb-12">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Sua Assinatura Atual</p>
                    <div className="bg-gradient-to-br from-emerald-900/20 to-black border border-emerald-500/30 rounded-[2.5rem] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest py-1.5 px-4 rounded-bl-2xl shadow-xl">ATIVA</div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <Repeat className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">{subscription.plan?.name}</h2>
                                <p className="text-primary/60 text-xs font-bold uppercase tracking-widest">Renova em: {new Date(subscription.endDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            {subscription.plan?.benefits?.map((benefit, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-300">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 bg-white text-black font-black py-4 rounded-2xl hover:bg-slate-200 transition text-[10px] uppercase tracking-widest">
                                Gerenciar Plano
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EXPLORE PLANS */}
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                    {subscription ? 'Outros Planos Disponíveis' : 'Planos para você'}
                </p>

                {plans.length > 0 ? (
                    <div className="space-y-6">
                        {plans.filter(p => p.id !== subscription?.planId).map(plan => (
                            <div key={plan.id} className="bg-[#111111] border border-white/5 rounded-[2.5rem] p-8 space-y-6 hover:border-emerald-500/30 transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-2">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xs font-black text-emerald-500 uppercase tracking-tighter">R$</span>
                                            <span className="text-3xl font-black">
                                                {(() => {
                                                    const price = Number(plan.price);
                                                    return !isNaN(price) ? price.toFixed(2) : '0.00';
                                                })()}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">/mês</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500">
                                        <Smartphone size={24} />
                                    </div>
                                </div>

                                {plan.benefits?.length > 0 && (
                                    <div className="space-y-3 pt-2 border-t border-white/5">
                                        {plan.benefits.map((b, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <Check className="w-4 h-4 text-primary" />
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => handleSubscribe(plan)}
                                    disabled={actionLoading}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Assinar Agora <ArrowRight className="w-4 h-4" /></>}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-[#111111] border border-dashed border-white/10 rounded-[2.5rem] space-y-6">
                        <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center border border-white/5">
                            <SearchIcon className="w-10 h-10 text-slate-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Nenhum plano disponível</h3>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Sua barbearia ainda não publicou ofertas no clube.</p>
                        </div>
                        <button onClick={() => router.push('/search')} className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl text-[10px] uppercase tracking-widest border border-white/5">
                            Explorar Barbearias
                        </button>
                    </div>
                )}
            </div>

            {error && <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">{error}</div>}
        </div>
    );
}
