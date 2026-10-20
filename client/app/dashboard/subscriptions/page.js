'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import { CreditCard, Plus, Trash2, Calendar, Target, ShoppingBag, Package, Repeat } from 'lucide-react';

const getShopId = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        return user?.barbershopId || user?.barbershop?.id || user?.ownedBarbershops?.[0]?.id || null;
    } catch { return null; }
};

// Um "pacote" é um plano não recorrente (isRecurring=false): pagamento único,
// N serviços com validade em dias. "Assinatura" é recorrente (isRecurring=true).
const EMPTY_PLAN = { name: '', price: '', quantityOfCuts: '', validityDays: '', isRecurring: true };

export default function SubscriptionPlansPage() {
    const queryClient = useQueryClient();
    const [newPlan, setNewPlan] = useState(EMPTY_PLAN);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');

    const { data: plans = [], isLoading: loading } = useQuery({
        queryKey: ['subscription-plans'],
        queryFn: async () => {
            const bId = getShopId();
            if (!bId) return [];
            return (await api.get(`/subscriptions?barbershopId=${bId}`)).data;
        }
    });

    const fetchPlans = () => queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });

    const handleCreatePlan = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            await api.post('/subscriptions', { ...newPlan, barbershopId: bId });
            setNewPlan(EMPTY_PLAN);
            setIsAdding(false);
            fetchPlans();
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao criar plano');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Deseja excluir este plano/pacote? Clientes que já contrataram continuarão ativos até o fim da validade.')) return;
        try {
            await api.delete(`/subscriptions/${id}`);
            fetchPlans();
        } catch (err) {
            alert('Erro ao excluir');
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-black uppercase text-xs">Carregando planos...</div>;

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                        <CreditCard className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Planos & Pacotes</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Assinaturas recorrentes e pacotes de serviços pré-pagos</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition"
                >
                    {isAdding ? 'CANCELAR' : <><Plus className="w-4 h-4" /> NOVO PLANO OU PACOTE</>}
                </button>
            </header>

            {isAdding && (
                <form onSubmit={handleCreatePlan} className="bg-card p-8 rounded-xl border border-border shadow-2xl animate-in zoom-in-95 duration-300 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tipo</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { value: true, icon: Repeat, title: 'Assinatura recorrente', desc: 'Cobrança a cada ciclo, créditos renovados' },
                                { value: false, icon: Package, title: 'Pacote (pagamento único)', desc: 'Paga uma vez, usa os serviços dentro da validade' },
                            ].map(opt => {
                                const Icon = opt.icon;
                                const selected = newPlan.isRecurring === opt.value;
                                return (
                                    <button
                                        key={String(opt.value)} type="button"
                                        onClick={() => setNewPlan({ ...newPlan, isRecurring: opt.value })}
                                        className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${selected ? 'border-primary bg-primary/10 ring-2 ring-primary' : 'border-border bg-background hover:border-primary/50'}`}
                                    >
                                        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span>
                                            <span className="block text-xs font-black uppercase tracking-tight text-foreground">{opt.title}</span>
                                            <span className="block text-[10px] font-medium text-muted-foreground">{opt.desc}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{newPlan.isRecurring ? 'Nome do Plano' : 'Nome do Pacote'}</label>
                            <input
                                required placeholder={newPlan.isRecurring ? 'Ex: Essencial Mensal' : 'Ex: Pacote 5 Cortes'}
                                value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition-all text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Preço (R$)</label>
                            <input
                                type="number" step="0.01" required placeholder="99.90"
                                value={newPlan.price} onChange={e => setNewPlan({ ...newPlan, price: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition-all text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Qtd de Serviços</label>
                            <input
                                type="number" min="0" required placeholder={newPlan.isRecurring ? '4' : '5'}
                                value={newPlan.quantityOfCuts} onChange={e => setNewPlan({ ...newPlan, quantityOfCuts: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition-all text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{newPlan.isRecurring ? 'Ciclo (Dias)' : 'Validade (Dias)'}</label>
                            <input
                                type="number" min="1" required placeholder={newPlan.isRecurring ? '30' : '90'}
                                value={newPlan.validityDays} onChange={e => setNewPlan({ ...newPlan, validityDays: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Descrição</label>
                            <textarea
                                placeholder="Uma breve descrição sobre o plano..."
                                value={newPlan.description || ''} onChange={e => setNewPlan({ ...newPlan, description: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition-all h-24 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Benefícios (Separados por vírgula)</label>
                            <textarea
                                placeholder="Corte ilimitado, 10% OFF em produtos, Cerveja grátis..."
                                value={newPlan.benefitsText || ''} onChange={e => setNewPlan({ ...newPlan, benefitsText: e.target.value, benefits: e.target.value.split(',').map(b => b.trim()).filter(b => b) })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition-all h-24 text-sm"
                            />
                        </div>
                    </div>

                    {error && <p className="text-xs font-bold text-destructive uppercase">{error}</p>}
                    <button type="submit" className="w-full bg-primary text-primary-foreground py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-xl shadow-primary/10">
                        {newPlan.isRecurring ? 'PUBLICAR ASSINATURA' : 'PUBLICAR PACOTE'}
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-card p-8 rounded-xl border border-border shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDelete(plan.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <span className={`inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${plan.isRecurring ? 'bg-primary/10 text-primary border-primary/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                                    {plan.isRecurring ? <><Repeat className="w-3 h-3" /> Assinatura</> : <><Package className="w-3 h-3" /> Pacote</>}
                                </span>
                                <h3 className="text-2xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors leading-none mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xs font-black text-primary uppercase">R$</span>
                                    <p className="text-4xl font-black text-foreground tracking-tighter">
                                        {(() => {
                                            const price = Number(plan.price);
                                            return !isNaN(price) ? price.toFixed(2) : '0.00';
                                        })()}
                                    </p>
                                </div>
                            </div>

                            {plan.description && <p className="text-muted-foreground text-xs font-medium leading-relaxed uppercase tracking-tighter line-clamp-2">{plan.description}</p>}

                            <div className="space-y-3 pt-2">
                                {plan.benefits?.map((benefit, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-none stroke-primary stroke-[4]"><path d="M20 6L9 17l-5-5" /></svg>
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/50">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Créditos</p>
                                    <p className="flex items-center gap-2 font-black text-xs text-muted-foreground uppercase tracking-tighter">
                                        <Target className="w-3.5 h-3.5 text-primary" /> {plan.quantityOfCuts || 'Ilimitado'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">{plan.isRecurring ? 'Ciclo' : 'Validade'}</p>
                                    <p className="flex items-center gap-2 font-black text-xs text-muted-foreground uppercase tracking-tighter">
                                        <Calendar className="w-3.5 h-3.5 text-primary" /> {plan.validityDays} Dias
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <span className="bg-primary/5 text-primary/80 border border-primary/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                    <ShoppingBag className="w-3.5 h-3.5" strokeWidth={3} /> Plano Ativo para Vendas
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {plans.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 text-center space-y-4 bg-card rounded-xl border-2 border-dashed border-border">
                        <CreditCard className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em]">Nenhum plano ou pacote disponível para esta unidade.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
