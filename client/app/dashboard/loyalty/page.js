'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import { Gift, Save, Info, Crown, Sparkles, Target, Zap, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';

export default function LoyaltyPage() {
    const queryClient = useQueryClient();
    const [barbershopId, setBarbershopId] = useState(null);
    const [formData, setFormData] = useState({
        active: false,
        pointsPerReal: 1,
        minPointsToRedeem: 100,
        rewardDescription: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const parsed = JSON.parse(userStr);
                const bId = parsed.barbershopId || parsed.barbershop?.id || parsed.ownedBarbershops?.[0]?.id;
                setBarbershopId(bId);
            } catch (e) {
                console.error("Error parsing user from localStorage", e);
            }
        }
    }, []);

    // Fetch existing settings
    const { data: loyalty, isLoading } = useQuery({
        queryKey: ['loyalty', barbershopId],
        queryFn: async () => {
            if (!barbershopId) return null;
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
                active: loyalty.active || false,
                pointsPerReal: loyalty.pointsPerReal || 1,
                minPointsToRedeem: loyalty.minPointsToRedeem || 100,
                rewardDescription: loyalty.rewardDescription || ''
            });
        }
    }, [loyalty]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!barbershopId) {
            toast.error("ID da Barbearia não encontrado. Tente fazer login novamente.");
            return;
        }

        // Final validation before sending
        const payload = {
            ...formData,
            barbershopId,
            pointsPerReal: parseFloat(formData.pointsPerReal) || 1,
            minPointsToRedeem: parseInt(formData.minPointsToRedeem) || 100
        };

        setIsSaving(true);
        try {
            await api.put('/loyalty', payload);
            queryClient.invalidateQueries(['loyalty', barbershopId]);
            toast.success("Configurações salvas com sucesso!");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Erro ao salvar configurações.");
        } finally {
            setIsSaving(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-muted-foreground font-medium animate-pulse uppercase tracking-[0.2em] text-xs">Sincronizando dados...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8 pb-20 max-w-5xl mx-auto"
        >
            {/* Header Section */}
            <header className="relative p-8 rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-2xl shadow-primary/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-primary/10 text-primary rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                            <Crown className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-none mb-2">Programa de Fidelidade</h1>
                            <p className="text-muted-foreground text-sm font-medium italic opacity-80 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" /> 
                                Fidelize seus clientes com pontos e recompensas exclusivas.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Settings Card */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div variants={itemVariants} className="p-8 rounded-3xl border border-white/5 bg-card/60 backdrop-blur-md shadow-xl relative overflow-hidden">
                        
                        {/* Status Toggle */}
                        <div className="mb-10 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between group hover:bg-primary/10 transition-colors">
                            <div>
                                <h3 className="font-bold text-foreground uppercase tracking-tight text-xl flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-primary" />
                                    Ativar Programa
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1 font-medium">Os clientes acumulam pontos automaticamente após cada serviço.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-16 h-8 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Points Per Real */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                                    Pontos por Real
                                    <Info className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number" step="0.1" min="0.1"
                                        value={formData.pointsPerReal}
                                        onChange={e => setFormData({ ...formData, pointsPerReal: parseFloat(e.target.value) })}
                                        className="w-full p-5 bg-background/50 border border-white/10 rounded-2xl focus:ring-4 ring-primary/20 outline-none font-black text-foreground text-2xl transition-all group-hover:border-primary/30"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-sm opacity-30">PTS</div>
                                </div>
                                <p className="text-[10px] text-muted-foreground/70 pl-2 font-medium">Ex: 1.0 (Gasta R$ 50, ganha 50 pts)</p>
                            </div>

                            {/* Meta */}
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                                    Meta de Resgate
                                    <Target className="w-3.5 h-3.5 text-muted-foreground/50" />
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number" step="1" min="10"
                                        value={formData.minPointsToRedeem}
                                        onChange={e => setFormData({ ...formData, minPointsToRedeem: parseInt(e.target.value) })}
                                        className="w-full p-5 bg-background/50 border border-white/10 rounded-2xl focus:ring-4 ring-primary/20 outline-none font-black text-foreground text-2xl transition-all group-hover:border-primary/30"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-sm opacity-30">GOAL</div>
                                </div>
                                <p className="text-[10px] text-muted-foreground/70 pl-2 font-medium">Pontos necessários para o prêmio.</p>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-primary/60" />
                                    Descrição do Prêmio / Regras
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.rewardDescription}
                                    onChange={e => setFormData({ ...formData, rewardDescription: e.target.value })}
                                    placeholder="Ex: Ao atingir 100 pontos, você ganha um corte grátis ou 50% de desconto na barba."
                                    className="w-full p-6 bg-background/50 border border-white/10 rounded-2xl focus:ring-4 ring-primary/20 outline-none font-bold text-foreground text-sm resize-none transition-all hover:border-primary/30 placeholder:opacity-30"
                                />
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-white/5">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                size="lg"
                                className="w-full md:w-auto h-16 px-12 rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        Salvar Configurações
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>

                {/* Preview Section */}
                <div className="space-y-6">
                    <motion.div variants={itemVariants} className="p-8 rounded-3xl border border-white/5 bg-gradient-to-b from-primary/10 to-transparent backdrop-blur-md relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <LayoutDashboard className="w-5 h-5 text-primary" />
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Visualização do Cliente</h3>
                        </div>

                        {/* Mockup Card */}
                        <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 p-6 space-y-6 shadow-2xl scale-100 origin-top transition-transform hover:scale-[1.03]">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Seus Pontos</p>
                                    <div className="text-4xl font-black text-white leading-none">80</div>
                                </div>
                                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                                    <Gift className="w-6 h-6 text-primary" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                    <span className="text-white/60">Progresso</span>
                                    <span className="text-primary">{Math.round((80 / (formData.minPointsToRedeem || 100)) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)] transition-all duration-700" 
                                        style={{ width: `${Math.min((80 / (formData.minPointsToRedeem || 100)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-2">
                                <p className="text-xs text-white font-bold uppercase tracking-tight flex items-center gap-2">
                                    <Info className="w-3 h-3 text-white/40" />
                                    Regras
                                </p>
                                <p className="text-[11px] text-white/50 leading-relaxed italic">
                                    "{formData.rewardDescription || 'Junte pontos e troque por serviços exclusivos.'}"
                                </p>
                                <div className="bg-primary/10 p-2 rounded-lg inline-block border border-primary/20">
                                    <p className="text-[10px] text-primary font-black uppercase tracking-tighter">
                                        R$ 1.00 = {formData.pointsPerReal} PTS
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10">
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Esta é uma visualização aproximada de como o cliente verá o programa no aplicativo deles.
                            </p>
                        </div>
                    </motion.div>

                    {/* Quick Tips */}
                    <motion.div variants={itemVariants} className="p-6 rounded-3xl border border-white/5 bg-card/40 backdrop-blur-sm">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Dicas de Sucesso</h4>
                        <ul className="space-y-3">
                            {[
                                "Defina metas alcançáveis (ex: 50 ou 100 pts)",
                                "O prêmio deve ser algo que o cliente valoriza",
                                "Use frases curtas e diretas nas regras",
                                "Ative o programa para começar a acumular"
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-3 text-[11px] text-muted-foreground">
                                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </form>
        </motion.div>
    );
}
