'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function UpdateRolloutManager() {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFlags();
    }, []);

    const fetchFlags = async () => {
        try {
            const res = await api.get('/rollout/flags');
            setFlags(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Erro ao carregar flags:', err);
            setLoading(false);
        }
    };

    const handleRollout = async (key) => {
        const confirm = window.confirm(`Tem certeza que deseja liberar a atualização "${key}" para todas as barbearias? Isso removerá as configurações de teste individuais.`);
        if (!confirm) return;

        try {
            await api.post('/rollout/global-rollout', { key });
            alert('Atualização liberada com sucesso!');
            fetchFlags();
        } catch (err) {
            alert('Erro ao realizar rollout global.');
        }
    };

    const toggleFlag = async (key, enabled, barbershopId) => {
        try {
            await api.post('/rollout/toggle', { key, enabled: !enabled, barbershopId });
            fetchFlags();
        } catch (err) {
            alert('Erro ao alternar flag.');
        }
    };

    if (loading) return null;

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                <h3 className="font-black text-white uppercase tracking-[0.2em] text-sm">Gerenciador Maestro de Atualizações</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {flags.filter(f => f.barbershopId === null).map(globalFlag => {
                    const overrides = flags.filter(f => f.key === globalFlag.key && f.barbershopId !== null);

                    return (
                        <div key={globalFlag.id} className="bg-[#111827] border border-slate-800 rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 items-start justify-between shadow-2xl shadow-emerald-500/5">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                        {globalFlag.key}
                                    </span>
                                    {globalFlag.enabled ? (
                                        <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            Ativo Globalmente
                                        </span>
                                    ) : (
                                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                                            Em Teste / Inativo
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-lg tracking-tight uppercase">{globalFlag.description || 'Sem descrição'}</h4>
                                    <p className="text-slate-500 text-sm font-medium mt-1">Status atual das unidades de teste e rollout global.</p>
                                </div>

                                <div className="pt-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">Unidades em Teste Individual:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {overrides.length > 0 ? overrides.map(o => (
                                            <div key={o.id} className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3">
                                                <span className="text-white text-xs font-bold">{o.barbershop?.name || 'Unidade'}</span>
                                                <button
                                                    onClick={() => toggleFlag(o.key, o.enabled, o.barbershopId)}
                                                    className={`w-8 h-4 rounded-full relative transition-colors ${o.enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${o.enabled ? 'left-4.5' : 'left-0.5'}`}></div>
                                                </button>
                                            </div>
                                        )) : (
                                            <p className="text-[10px] text-slate-700 italic">Nenhuma unidade testando isoladamente.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-auto flex flex-col gap-3">
                                <button
                                    onClick={() => handleRollout(globalFlag.key)}
                                    disabled={globalFlag.enabled}
                                    className={`w-full md:min-w-[240px] px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ${globalFlag.enabled
                                            ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                                            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                                        }`}
                                >
                                    {globalFlag.enabled ? 'ATUALIZAÇÃO JÁ LIBERADA' : 'LIBERAR ATUALIZAÇÃO GLOBAL'}
                                </button>
                                <p className="text-[9px] text-slate-500 text-center italic max-w-[240px]">
                                    Ao liberar, a regra de negócio do código será aplicada a todas as barbearias simultaneamente.
                                </p>
                            </div>
                        </div>
                    );
                })}

                {flags.length === 0 && (
                    <div className="bg-[#111827] border border-dashed border-slate-800 rounded-[2rem] p-20 text-center">
                        <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Nenhuma atualização pendente detectada</p>
                    </div>
                )}
            </div>
        </section>
    );
}
