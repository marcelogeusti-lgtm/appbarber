'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/clientApi';
import { Package, Calendar, Scissors, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyPackagesPage() {
    const router = useRouter();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSub() {
            try {
                const res = await api.get('/subscription/my-active');
                setSubscription(res.data);
            } catch (error) {
                console.error('Erro ao buscar assinatura:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchSub();
    }, []);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-xl font-bold uppercase">Meus Pacotes e Assinaturas</h1>
            </header>

            {subscription ? (
                <div className="bg-gradient-to-br from-zinc-900 to-black border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase">{subscription.plan.name}</h2>
                                <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Ativo</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-black/50 p-4 rounded-2xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                                    <Scissors className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase">Cortes Restantes</p>
                                    <p className="text-xl font-bold text-white">{subscription.remainingCuts}</p>
                                </div>
                            </div>

                            <div className="bg-black/50 p-4 rounded-2xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase">Válido Até</p>
                                    <p className="text-sm font-bold text-white">
                                        {new Date(subscription.endDate).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                        <Package className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-zinc-400 font-bold uppercase">Nenhum plano ativo</h3>
                    <p className="text-zinc-600 text-xs mt-2 max-w-[200px]">Adquira um pacote ou assinatura na página da sua barbearia favorita.</p>
                </div>
            )}
        </div>
    );
}
