'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Repeat, Check, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';

export default function SubscriptionsPage() {
    const router = useRouter();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch active subscription if exists
        async function fetchSub() {
            try {
                // Using the specific endpoint for subscriptions
                const res = await api.get('/subscription/my-active');
                setSubscription(res.data);
            } catch (error) {
                // Ignore error, just means no sub
            } finally {
                setLoading(false);
            }
        }
        fetchSub();
    }, []);

    if (loading) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 bg-slate-900 rounded-full hover:bg-emerald-500/20 transition">
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-xl font-bold">Assinaturas</h1>
            </div>

            {subscription ? (
                <div className="bg-gradient-to-br from-emerald-900/20 to-black border border-emerald-500/30 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-bl-xl">Ativa</div>

                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                        <Repeat className="w-8 h-8 text-emerald-500" />
                    </div>

                    <h2 className="text-2xl font-black text-white mb-2">{subscription.plan?.name || 'Plano Premium'}</h2>
                    <p className="text-slate-400 text-sm mb-8">Sua assinatura está ativa e renovará automaticamente.</p>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-emerald-500" />
                            </div>
                            <span className="text-sm text-slate-300">Acesso ilimitado a agendamentos</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <Check className="w-3 h-3 text-emerald-500" />
                            </div>
                            <span className="text-sm text-slate-300">Descontos exclusivos em produtos</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-slate-200 transition text-xs uppercase tracking-widest">
                            Gerenciar
                        </button>
                        <button className="flex-1 bg-transparent border border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/5 transition text-xs uppercase tracking-widest">
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-80">
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                        <AlertCircle className="w-10 h-10 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Nenhuma assinatura ativa</h3>
                    <p className="text-slate-500 text-sm max-w-[250px] mx-auto mb-8">Assine um plano e garanta benefícios exclusivos na sua barbearia preferida.</p>

                    <button onClick={() => router.push('/search')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-xl text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition">
                        Encontrar Planos
                    </button>
                </div>
            )}
        </div>
    );
}
