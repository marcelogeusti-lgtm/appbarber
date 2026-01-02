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
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-8 rounded-3xl border border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center text-3xl shadow-2xl shadow-emerald-500/10">
                        👑
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Gestão Global SaaS</h1>
                        <p className="text-slate-500 text-sm font-medium italic mt-1 leading-none">Controle operacional e financeiro da rede Barbe-On</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all">RELATÓRIO DE TRÁFEGO</button>
                    <button className="bg-slate-950 border border-slate-800 text-slate-400 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-emerald-500/30 transition-all">LOGS DO SISTEMA</button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 text-emerald-500">Unidades Ativas</p>
                        <h2 className="text-4xl font-black text-white tracking-tighter">{barbershops.length}</h2>
                        <p className="text-[10px] mt-4 font-black uppercase text-emerald-500/80 bg-emerald-500/5 px-3 py-1 rounded-full w-fit">Crescimento de 15%</p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-500 opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity"></div>
                </div>

                <div className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Receita SaaS (MRR)</p>
                        <h2 className="text-4xl font-black text-white tracking-tighter">R$ 1.240</h2>
                        <p className="text-[10px] mt-4 font-black uppercase text-slate-500 tracking-widest italic opacity-60">Valor Recorrente</p>
                    </div>
                </div>

                <div className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Provisionamento</p>
                        <h2 className="text-4xl font-black text-emerald-500 tracking-tighter">3</h2>
                        <p className="text-[10px] mt-4 font-black uppercase text-slate-500 tracking-widest italic opacity-60">Aguardando Aprovação</p>
                    </div>
                </div>

                <div className="bg-emerald-500 p-8 rounded-[2rem] shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-3">Taxa de Conversão</p>
                        <h2 className="text-4xl font-black text-white tracking-tighter">94%</h2>
                        <p className="text-[10px] mt-4 font-black uppercase text-white tracking-widest italic opacity-80">Retenção Mensal</p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity"></div>
                </div>
            </div>

            <div className="bg-[#111827] rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden relative">
                <div className="p-8 border-b border-slate-800/50 flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-white uppercase tracking-[0.2em] text-xs">Controle Maestro de Parceiros</h3>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#0a0f1a]">
                            <tr>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Entidade / Identidade Digital</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Owner</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Tier de Assinatura</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 text-right">Governança</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {barbershops.map(shop => (
                                <tr key={shop.id} className="hover:bg-emerald-500/5 transition group">
                                    <td className="p-8">
                                        <p className="font-black text-white uppercase text-sm tracking-tight">{shop.name}</p>
                                        <p className="text-[10px] text-emerald-500/80 font-mono mt-1 group-hover:translate-x-1 transition-transform italic inline-block bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">/{shop.slug}</p>
                                    </td>
                                    <td className="p-6">
                                        <p className="font-black text-slate-300 text-xs">{shop.owner?.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{shop.owner?.email}</p>
                                    </td>
                                    <td className="p-6">
                                        <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Enterprise Pro (Ativo)</span>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button className="bg-slate-950 border border-slate-800 text-slate-500 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-emerald-500/30 hover:text-emerald-500 transition-all">Gerenciar</button>
                                            <button className="bg-red-500/5 border border-red-500/10 text-red-500/50 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Cessar</button>
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
