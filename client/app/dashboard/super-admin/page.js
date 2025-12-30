'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function SuperAdminPage() {
    const [barbershops, setBarbershops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBarbershops();
    }, []);

    const fetchBarbershops = async () => {
        try {
            const res = await api.get('/barbershops');
            setBarbershops(res.data);
            setLoading(false);
        } catch (err) {
            setError('Erro ao carregar barbearias. Verifique se você é um Super Admin.');
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Carregando painel de controle...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

    return (
        <div className="space-y-6 pb-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">👑 Gestão Global</h1>
                    <p className="text-slate-500 text-sm font-medium">Controle de barbearias, planos e faturamento SaaS</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/20">RELATÓRIO GERAL</button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900 p-8 rounded-3xl text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Barbearias</p>
                    <h2 className="text-4xl font-black mt-1">{barbershops.length}</h2>
                    <p className="text-xs mt-4 font-medium text-green-400">+2 esta semana</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Receita SaaS</p>
                    <h2 className="text-3xl font-black mt-1 text-slate-900 dark:text-white">R$ 1.240</h2>
                    <p className="text-xs mt-4 text-slate-400 font-medium">Mensal recorrente</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Planos Pendentes</p>
                    <h2 className="text-3xl font-black mt-1 text-orange-500">3</h2>
                    <p className="text-xs mt-4 text-slate-400 font-medium">Aguardando aprovação</p>
                </div>
                <div className="bg-orange-500 p-8 rounded-3xl text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Bots Ativos</p>
                    <h2 className="text-3xl font-black mt-1">{barbershops.length}</h2>
                    <p className="text-xs mt-4 font-medium italic opacity-80">Conexão WhatsApp</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800">
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Controle de Parceiros</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Negócio / URL</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Proprietário</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Plano</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Controle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {barbershops.map(shop => (
                                <tr key={shop.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="p-6">
                                        <p className="font-bold text-slate-900 dark:text-white uppercase text-sm">{shop.name}</p>
                                        <p className="text-[10px] text-orange-500 font-mono">/agendamento/{shop.slug}</p>
                                    </td>
                                    <td className="p-6">
                                        <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">{shop.owner?.name}</p>
                                        <p className="text-[10px] text-slate-400 italic">{shop.owner?.email}</p>
                                    </td>
                                    <td className="p-6">
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Plano Pro (Ativo)</span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition">Suspender</button>
                                            <button className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:opacity-50 transition">Excluir</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
