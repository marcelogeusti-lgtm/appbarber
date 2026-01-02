'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Package, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export default function PackagesPage() {
    const [plans, setPlans] = useState([]);
    const [mySubscription, setMySubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            // Assuming barbershopId is available or we fetch "public" plans for this client's associated barbershop
            // For now, let's look for plans related to the user's last visited barbershop or similar.
            // Or assume the user is linked to a workedBarbershopId? No, they are CLIENT.
            // We need a context for "Which Barbershop?". 
            // For this specific single-instance app, we might get away with fetching global plans or linking to a default ID.
            // Let's assume we pass a default ID or the backend figures it out.
            // BETTER: The user probably has `barbershopId` if they registered through a specific link.
            const bId = user.barbershopId || 'default-id-if-needed';

            const [plansRes, subRes] = await Promise.all([
                api.get(`/subscription?barbershopId=${bId}`).catch(() => ({ data: [] })),
                api.get('/subscription/my-active').catch(() => ({ data: null }))
            ]);

            setPlans(plansRes.data);
            setMySubscription(subRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planId) => {
        if (!confirm('Deseja assinar este plano?')) return;
        try {
            await api.post('/subscription/subscribe', { planId });
            alert('Assinatura realizada com sucesso!');
            fetchData();
        } catch (error) {
            alert('Erro ao assinar: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans pb-20">
            {/* Header */}
            <header className="p-6 sticky top-0 bg-slate-950/80 backdrop-blur-md z-10 flex items-center gap-4 border-b border-slate-900">
                <Link href="/home" className="p-2 -ml-2 hover:bg-slate-900 rounded-full transition">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </Link>
                <h1 className="text-xl font-black uppercase tracking-tight">Clube de Assinatura</h1>
            </header>

            <div className="p-6">
                {mySubscription && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl shadow-xl shadow-emerald-900/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-2">Assinatura Ativa</p>
                            <h2 className="text-2xl font-black text-white mb-4">{mySubscription.plan.name}</h2>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex justify-between items-center border border-white/10">
                                <div>
                                    <p className="text-3xl font-black text-white">{mySubscription.remainingCuts}</p>
                                    <p className="text-[10px] text-emerald-100 uppercase font-bold">Cortes Restantes</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-emerald-100">Válido até</p>
                                    <p className="font-bold text-white text-sm">{new Date(mySubscription.endDate).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Escolha seu Plano</h3>

                <div className="space-y-4">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 hover:border-orange-500/50 transition duration-300 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                                <Package className="w-24 h-24 text-orange-500" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-xl font-black text-white uppercase">{plan.name}</h4>
                                        <p className="text-slate-500 text-xs font-medium">{plan.quantityOfCuts} cortes válidos por {plan.validityDays} dias</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-orange-500">R$ {plan.price}</p>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-slate-800 my-4"></div>

                                <button
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={!!mySubscription}
                                    className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 ${mySubscription
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        : 'bg-white text-slate-900 hover:bg-orange-500 hover:text-white'}`}
                                >
                                    {mySubscription ? 'Você já tem um plano' : 'Assinar Agora'}
                                </button>
                            </div>
                        </div>
                    ))}

                    {plans.length === 0 && (
                        <div className="text-center py-10 text-slate-500 text-sm">
                            Nenhum plano disponível no momento.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
