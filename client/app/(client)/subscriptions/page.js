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
            const res = await api.get('/payments/cards'); // Updated to match the Wallet endpoint
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
            router.push(`/profile?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
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
                gateway: 'velify' 
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
            <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#050505] to-black text-white px-5 pt-8 pb-32 max-w-xl mx-auto">
                <header className="flex items-center gap-4 mb-10 px-1">
                    <button onClick={() => setSelectedPlan(null)} className="w-10 h-10 glass-premium rounded-xl flex items-center justify-center text-slate-400">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white uppercase italic tracking-tight">Checkout</h1>
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">Finalize sua adesão</p>
                    </div>
                </header>

                <div className="space-y-8 px-1">
                    {/* Plan Summary */}
                    <div className="glass-premium rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="flex justify-between items-center relative z-10">
                            <div>
                                <p className="text-[9px] text-primary font-black uppercase tracking-[0.3em] mb-1">Membro Exclusive</p>
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{selectedPlan.name}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-white leading-none tracking-tight">R$ {Number(selectedPlan.price).toFixed(0)}</p>
                                <p className="text-[8px] text-slate-400 font-black uppercase mt-1">por faturamento</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4">Método de Pagamento</p>

                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => setPaymentMethod('PIX')}
                                className={`p-6 rounded-[2.5rem] border transition-all relative overflow-hidden flex items-center gap-4 ${paymentMethod === 'PIX' ? 'glass-premium border-primary shadow-lg shadow-primary/10' : 'glass-premium border-white/5 opacity-40'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'PIX' ? 'bg-primary text-black' : 'bg-slate-900 text-slate-500'}`}>
                                    <Zap size={22} className="fill-current" />
                                </div>
                                <div className="text-left">
                                    <p className={`text-[11px] font-black uppercase tracking-widest ${paymentMethod === 'PIX' ? 'text-white' : 'text-slate-400'}`}>PIX Instantâneo</p>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Ativação imediata</p>
                                </div>
                                {paymentMethod === 'PIX' && <div className="absolute top-4 right-4 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 animate-in zoom-in duration-300"><Check className="w-3 h-3 text-black" strokeWidth={4} /></div>}
                            </button>

                            <button
                                onClick={() => setPaymentMethod('CREDIT_CARD')}
                                className={`p-6 rounded-[2.5rem] border transition-all relative overflow-hidden flex items-center gap-4 ${paymentMethod === 'CREDIT_CARD' ? 'glass-premium border-primary shadow-lg shadow-primary/10' : 'glass-premium border-white/5 opacity-40'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'CREDIT_CARD' ? 'bg-primary text-black' : 'bg-slate-900 text-slate-500'}`}>
                                    <CreditCard size={22} className="fill-current" />
                                </div>
                                <div className="text-left">
                                    <p className={`text-[11px] font-black uppercase tracking-widest ${paymentMethod === 'CREDIT_CARD' ? 'text-white' : 'text-slate-400'}`}>Cartão de Crédito</p>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Recorrência automática</p>
                                </div>
                                {paymentMethod === 'CREDIT_CARD' && <div className="absolute top-4 right-4 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 animate-in zoom-in duration-300"><Check className="w-3 h-3 text-black" strokeWidth={4} /></div>}
                            </button>
                        </div>
                    </div>

                    {paymentMethod === 'CREDIT_CARD' && (
                        <div className="animate-in slide-in-from-top-4 space-y-4">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 text-center">Seus Cartões Salvos</p>

                            {savedCards.length > 0 ? (
                                <div className="space-y-3">
                                    {savedCards.map(card => (
                                        <button
                                            key={card.id}
                                            onClick={() => setSelectedCardId(card.id)}
                                            className={`w-full p-5 rounded-[2rem] border transition-all flex items-center justify-between ${selectedCardId === card.id ? 'glass-premium border-primary/30' : 'glass-premium border-white/5 opacity-50'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <CreditCard className="w-4 h-4 text-primary" />
                                                <p className="text-[10px] font-black text-white tracking-[0.2em] uppercase italic">•••• {card.last4} ({card.brand})</p>
                                            </div>
                                            {selectedCardId === card.id && <Check className="w-4 h-4 text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-10 glass-premium rounded-[2rem] border-white/5 text-center">
                                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mb-6 leading-relaxed">Nenhum cartão digital encontrado em sua carteira.</p>
                                    <button
                                        className="px-8 py-4 glass-premium border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
                                        onClick={() => router.push('/cards')}
                                    >
                                        <Plus className="w-3 h-3 inline mr-1" /> Vincular Novo
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => handleSubscribe(selectedPlan)}
                        disabled={actionLoading || (paymentMethod === 'CREDIT_CARD' && savedCards.length === 0)}
                        className="w-full bg-primary text-black font-black py-5 rounded-[2.5rem] text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 disabled:opacity-30 mt-8 shadow-2xl shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <>Assinar Agora <ArrowRight className="w-4 h-4" strokeWidth={4} /></>}
                    </button>

                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] p-4 rounded-2xl text-center mt-6">{error}</div>}
                </div>
            </div>
        );
    }

    // --- CHECKOUT VIEW (PIX / Payment Info) ---
    if (checkoutData) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#050505] to-black text-white px-5 pt-8 pb-32">
                <header className="flex items-center gap-4 mb-10 px-1">
                    <button onClick={() => setCheckoutData(null)} className="w-10 h-10 glass-premium rounded-xl flex items-center justify-center text-slate-400">
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white uppercase italic tracking-tight">Pagamento</h1>
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">Aguardando confirmação</p>
                    </div>
                </header>

                <div className="max-w-md mx-auto glass-premium border-white/5 rounded-[3rem] p-10 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-[80px] rounded-full -translate-y-1/2 -translate-x-1/2" />
                    
                    <div className="space-y-6 relative z-10">
                        <div className="w-20 h-20 glass-premium rounded-[2rem] flex items-center justify-center mx-auto border-primary/20 shadow-inner">
                            <Zap className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-2">{selectedPlan?.name}</h2>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Premium Active</span>
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,1)]"></span>
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-3xl font-black text-white tracking-tighter italic">R$ {Number(selectedPlan?.price).toFixed(2)}</p>
                            <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.4em] mt-1">Cobrança Mensal</p>
                        </div>
                    </div>

                    {checkoutData.qrCode ? (
                        <div className="space-y-8 mt-10 relative z-10">
                            <div className="bg-white p-3 rounded-[3rem] inline-block shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-8 border-white/5">
                                {checkoutData.qrCodeBase64 ? (
                                    <img src={`data:image/png;base64,${checkoutData.qrCodeBase64}`} alt="PIX" className="w-56 h-56 rounded-2xl" />
                                ) : (
                                    <div className="w-56 h-56 bg-slate-100 flex items-center justify-center text-black text-[8px] font-mono break-all p-8">
                                        {checkoutData.qrCode}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">Escaneie com seu banco ou use a chave copia e cola abaixo.</p>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(checkoutData.qrCode); toast.success('Código copiado!'); }}
                                    className="w-full py-5 glass-premium border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-[2rem] active:scale-95 transition-all shadow-lg shadow-primary/5"
                                >
                                    Copiar Chave Digital
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Validando transação...</p>
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-white/5 flex items-start gap-4 text-left">
                        <div className="w-10 h-10 glass-premium rounded-xl shrink-0 flex items-center justify-center text-primary">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                            Upgrade criptografado. Após pagar, sua experiência premium será liberada imediatamente em todos os dispositivos.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#050505] to-black text-white px-5 pt-8 pb-32 max-w-7xl mx-auto overflow-x-hidden">
            
            {/* Header */}
            <header className="flex items-center gap-4 mb-10 px-1">
                <button onClick={() => router.back()} className="w-10 h-10 glass-premium rounded-xl flex items-center justify-center text-slate-400 active:scale-95 transition-all">
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                    <h1 className="text-xl font-black text-white uppercase italic tracking-tight">Experiência</h1>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">Membro Exclusive</p>
                </div>
            </header>

            {/* MY ACTIVE SUBSCRIPTION */}
            {subscription && (
                <div className="mb-14 px-1">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-5 ml-4">Seu Status Atual</p>
                    <div className="glass-premium border-primary/30 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 bg-primary text-black text-[9px] font-black uppercase tracking-[0.2em] py-2 px-6 rounded-bl-[1.5rem] shadow-xl">MEMBRO VIP</div>
                        
                        {/* Background Glow */}
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="flex items-center gap-6 mb-10 relative z-10 transition-transform active:scale-[0.99]">
                            <div className="w-16 h-16 glass-premium rounded-[1.5rem] flex items-center justify-center border-primary/20 shadow-inner group-hover:scale-110 transition-all">
                                <Repeat className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-2">{subscription.plan?.name}</h2>
                                <p className="text-primary/60 text-[9px] font-black uppercase tracking-[0.2em]">Próxima renovação: {new Date(subscription.endDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-10 relative z-10">
                            {subscription.plan?.benefits?.map((benefit, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="w-6 h-6 rounded-full glass-premium flex items-center justify-center border-primary/20">
                                        <Check className="w-3.5 h-3.5 text-primary" strokeWidth={4} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <button className="w-full glass-premium border-white/10 text-white font-black py-5 rounded-[2rem] text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-xl relative z-10">
                            Gerenciar Minha Assinatura
                        </button>
                    </div>
                </div>
            )}

            {/* EXPLORE PLANS */}
            <div className="px-1">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6 ml-4">
                    {subscription ? 'Explorar Outros Planos' : 'Selecione seu Plano'}
                </p>

                {plans.length > 0 ? (
                    <div className="space-y-8">
                        {plans.filter(p => p.id !== subscription?.planId).map(plan => (
                            <div key={plan.id} className="glass-premium border-white/5 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl transition-all active:scale-[0.99]">
                                {/* Status Badge if applicable or decoration */}
                                <div className="absolute top-8 right-8 text-[8px] font-black uppercase tracking-[0.4em] text-slate-700">Recommended</div>

                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-xl font-black uppercase italic tracking-tight leading-none mb-3">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1.5 p-1">
                                            <span className="text-3xl font-black text-white italic tracking-tighter">R$ {Number(plan.price).toFixed(0)}</span>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">/ mês</span>
                                        </div>
                                    </div>
                                    <div className="w-14 h-14 glass-premium rounded-[1.5rem] flex items-center justify-center border-white/5 shadow-inner">
                                        <Zap className="w-7 h-7 text-primary" />
                                    </div>
                                </div>

                                {plan.benefits?.length > 0 && (
                                    <div className="space-y-4 mb-10 pt-6 border-t border-white/5">
                                        {plan.benefits.slice(0, 3).map((b, idx) => (
                                            <div key={idx} className="flex items-center gap-4">
                                                <div className="w-5 h-5 rounded-full flex items-center justify-center opacity-30 shrink-0">
                                                    <Check className="w-3.5 h-3.5 text-primary" strokeWidth={4} />
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{b}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => handleSubscribe(plan)}
                                    disabled={actionLoading}
                                    className="w-full bg-primary text-black font-black py-5 rounded-[2rem] text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-primary/10 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Upgrade Agora <ArrowRight className="w-4 h-4" strokeWidth={4} /></>}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center glass-premium border-white/5 rounded-[3rem] space-y-8 px-8">
                        <div className="w-24 h-24 glass-premium rounded-full flex items-center justify-center border-white/5 relative overflow-hidden">
                            <SearchIcon className="w-10 h-10 text-slate-800" strokeWidth={1} />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tight italic">Clube em Lançamento</h3>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">Planos exclusivos de assinatura sendo preparados para este local.</p>
                        </div>
                        <button onClick={() => router.push('/search')} className="px-10 py-5 glass-premium border-primary/20 text-primary uppercase text-[10px] font-black tracking-widest rounded-[1.5rem] active:scale-95 transition-all">
                            Explorar Clubes
                        </button>
                    </div>
                )}
            </div>

            {error && <div className="mt-10 p-6 glass-premium border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-[2rem] text-center shadow-xl">{error}</div>}
        </div>
    );
}
