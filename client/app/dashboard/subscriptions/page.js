'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { CreditCard, Plus, Trash2, Calendar, Target, ShoppingBag } from 'lucide-react';

export default function SubscriptionPlansPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPlan, setNewPlan] = useState({ name: '', price: '', quantityOfCuts: '', validityDays: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            const res = await api.get(`/subscriptions?barbershopId=${bId}`);
            setPlans(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleCreatePlan = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            await api.post('/subscriptions', { ...newPlan, barbershopId: bId });
            setNewPlan({ name: '', price: '', quantityOfCuts: '', validityDays: '' });
            setIsAdding(false);
            fetchPlans();
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao criar plano');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Deseja excluir este plano? Clientes que já assinaram continuarão ativos até o fim da validade.')) return;
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
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Clube de Assinatura</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Gestão de planos recorrentes e fidelização</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition"
                >
                    {isAdding ? 'CANCELAR' : <><Plus className="w-4 h-4" /> CRIAR NOVO PLANO</>}
                </button>
            </header>

            {isAdding && (
                <form onSubmit={handleCreatePlan} className="bg-card p-8 rounded-xl border border-border shadow-2xl animate-in zoom-in-95 duration-300 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nome do Plano</label>
                            <input
                                required placeholder="Ex: Essencial Mensal"
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
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Qtd de Cortes</label>
                            <input
                                type="number" required placeholder="4"
                                value={newPlan.quantityOfCuts} onChange={e => setNewPlan({ ...newPlan, quantityOfCuts: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition-all text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Validade (Dias)</label>
                            <input
                                type="number" required placeholder="30"
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
                        PUBLICAR PLANO NO CLUBE
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
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Ciclo</p>
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
                        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em]">Nenhum plano disponível para esta unidade.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
