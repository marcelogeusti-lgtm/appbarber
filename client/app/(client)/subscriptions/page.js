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
    Search as SearchIcon
} from 'lucide-react';
import api from '../../../lib/clientApi';

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

    useEffect(() => {
        fetchData();
    }, [barbershopIdParam]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Fetch active sub
            const subRes = await api.get('/subscription/my-active');
            setSubscription(subRes.data);

            // 2. If no active sub or specifically looking for a shop, fetch plans
            const bId = barbershopIdParam || subRes.data?.plan?.barbershopId;
            if (bId) {
                const plansRes = await api.get(`/subscription?barbershopId=${bId}`);
                setPlans(plansRes.data);
            }
        } catch (error) {
            console.error('Fetch Data Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (plan) => {
        setActionLoading(true);
        setError('');
        try {
            // Defaulting to PIX for this flow, can be expanded to a method selection step
            const res = await api.post('/subscription/purchase', {
                planId: plan.id,
                paymentMethod: 'PIX', // In the future, show a modal to choose
                gateway: 'mercadopago' // or stripe based on barber config
            });

            setCheckoutData(res.data.payment);
            setSelectedPlan(plan);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao iniciar assinatura.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
    );

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
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-none">R$ {parseFloat(selectedPlan?.price).toFixed(2)} / mês</p>
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
                        <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                            Sua assinatura será ativada instantaneamente após a confirmação do pagamento. Você receberá um e-mail de confirmação.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 bg-slate-900 rounded-full hover:bg-emerald-500/20 transition">
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
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                                <Repeat className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">{subscription.plan?.name}</h2>
                                <p className="text-emerald-500/60 text-xs font-bold uppercase tracking-widest">Renova em: {new Date(subscription.endDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            {subscription.plan?.benefits?.map((benefit, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-emerald-500" />
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
                                            <span className="text-3xl font-black">{parseFloat(plan.price).toFixed(2)}</span>
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
                                                <Check className="w-4 h-4 text-emerald-500" />
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{b}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => handleSubscribe(plan)}
                                    disabled={actionLoading}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
