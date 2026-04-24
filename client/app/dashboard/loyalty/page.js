'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import { Gift, Save, Info, Crown } from 'lucide-react';

export default function LoyaltyPage() {
    const queryClient = useQueryClient();
    const [user, setUser] = useState(null);
    const [barbershopId, setBarbershopId] = useState(null);
    const [formData, setFormData] = useState({
        active: false,
        pointsPerReal: 1,
        minPointsToRedeem: 100,
        rewardDescription: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const parsed = JSON.parse(userStr);
            setUser(parsed);
            const bId = parsed.barbershopId || parsed.barbershop?.id || parsed.ownedBarbershops?.[0]?.id;
            setBarbershopId(bId);
        }
    }, []);

    // Fetch existing settings
    const { data: loyalty, isLoading } = useQuery({
        queryKey: ['loyalty', barbershopId],
        queryFn: async () => {
            try {
                const res = await api.get(`/loyalty?barbershopId=${barbershopId}`);
                return res.data;
            } catch (err) {
                if (err.response?.status === 404) return null;
                throw err;
            }
        },
        enabled: !!barbershopId,
    });

    useEffect(() => {
        if (loyalty) {
            setFormData({
                active: loyalty.active,
                pointsPerReal: loyalty.pointsPerReal,
                minPointsToRedeem: loyalty.minPointsToRedeem,
                rewardDescription: loyalty.rewardDescription || ''
            });
        }
    }, [loyalty]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await api.put('/loyalty', { ...formData, barbershopId });
            queryClient.invalidateQueries(['loyalty', barbershopId]);
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            console.error(err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    if (isLoading) return <div className="p-8 text-center animate-pulse uppercase text-xs font-black text-muted-foreground">Carregando fidelidade...</div>;

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                        <Crown className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Programa de Fidelidade</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Fidelize seus clientes com pontos e recompensas.</p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="bg-card p-8 rounded-xl border border-border shadow-2xl relative overflow-hidden">
                {status === 'success' && (
                    <div className="absolute top-0 left-0 right-0 bg-primary text-white p-2 text-center text-xs font-black uppercase tracking-widest animate-in slide-in-from-top">
                        Configurações salvas com sucesso!
                    </div>
                )}
                {status === 'error' && (
                    <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center text-xs font-black uppercase tracking-widest animate-in slide-in-from-top">
                        Erro ao salvar configurações.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">

                    {/* Active Toggle */}
                    <div className="md:col-span-2 bg-muted/30 p-6 rounded-xl border border-border/50 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-foreground uppercase tracking-tight text-lg">Ativar Programa</h3>
                            <p className="text-xs text-muted-foreground mt-1">Seus clientes acumularão pontos a cada agendamento concluído.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                            Pontos por Real
                            <Info className="w-3 h-3 text-muted-foreground cursor-help" title="Quantos pontos o cliente ganha a cada 1 Real gasto" />
                        </label>
                        <input
                            type="number" step="0.1" min="0.1"
                            value={formData.pointsPerReal}
                            onChange={e => setFormData({ ...formData, pointsPerReal: parseFloat(e.target.value) })}
                            className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground text-lg"
                        />
                        <p className="text-[10px] text-muted-foreground pl-1">Ex: 1.0 (Gasta R$ 50, ganha 50 pts)</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                            Meta para Resgate
                            <Info className="w-3 h-3 text-muted-foreground cursor-help" title="Quantos pontos são necessários para ganhar o prêmio" />
                        </label>
                        <input
                            type="number" step="1" min="10"
                            value={formData.minPointsToRedeem}
                            onChange={e => setFormData({ ...formData, minPointsToRedeem: parseInt(e.target.value) })}
                            className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground text-lg"
                        />
                        <p className="text-[10px] text-muted-foreground pl-1">Ex: 100 pontos para completar a barra.</p>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Descrição do Prêmio / Regras</label>
                        <textarea
                            rows={3}
                            value={formData.rewardDescription}
                            onChange={e => setFormData({ ...formData, rewardDescription: e.target.value })}
                            placeholder="Ex: Ao atingir 100 pontos, você ganha um corte grátis ou 50% de desconto na barba."
                            className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground text-sm resize-none"
                        />
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border">
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full md:w-auto px-8 bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Salvar Configurações
                    </button>
                </div>
            </form>
        </div>
    );
}
