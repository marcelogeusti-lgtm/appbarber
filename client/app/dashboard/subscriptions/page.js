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

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-black uppercase text-xs">Carregando planos...</div>;

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl">
                        <CreditCard className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Planos de Assinatura</h1>
                        <p className="text-slate-500 text-sm font-medium italic">Fidelize clientes com pacotes recorrentes</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition"
                >
                    {isAdding ? 'CANCELAR' : <><Plus className="w-4 h-4" /> CRIAR NOVO PLANO</>}
                </button>
            </header>

            {isAdding && (
                <form onSubmit={handleCreatePlan} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Plano</label>
                            <input
                                required placeholder="Ex: Essencial Mensal"
                                value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 ring-orange-500 outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço (R$)</label>
                            <input
                                type="number" required placeholder="99.90"
                                value={newPlan.price} onChange={e => setNewPlan({ ...newPlan, price: e.target.value })}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 ring-orange-500 outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qtd de Cortes</label>
                            <input
                                type="number" required placeholder="4"
                                value={newPlan.quantityOfCuts} onChange={e => setNewPlan({ ...newPlan, quantityOfCuts: e.target.value })}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 ring-orange-500 outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Validade (Dias)</label>
                            <input
                                type="number" required placeholder="30"
                                value={newPlan.validityDays} onChange={e => setNewPlan({ ...newPlan, validityDays: e.target.value })}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 ring-orange-500 outline-none font-bold"
                            />
                        </div>
                    </div>
                    {error && <p className="mt-4 text-xs font-bold text-red-500 uppercase">{error}</p>}
                    <button type="submit" className="mt-6 w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition">
                        SALVAR PLANO
                    </button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-orange-500 transition-all relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDelete(plan.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors leading-none mb-2">{plan.name}</h3>
                                <p className="text-3xl font-black text-slate-900 dark:text-white italic">R$ {plan.price.toFixed(2)}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Capacidade</p>
                                    <p className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-white uppercase tracking-tighter">
                                        <Target className="w-3.5 h-3.5 text-orange-500" /> {plan.quantityOfCuts} Cortes
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Validade</p>
                                    <p className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-white uppercase tracking-tighter">
                                        <Calendar className="w-3.5 h-3.5 text-orange-500" /> {plan.validityDays} Dias
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                    <ShoppingBag className="w-3.5 h-3.5" /> Produto Pronto para Venda
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {plans.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 text-center space-y-4 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum plano criado. Comece agora!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
