'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Zap, Shield, CheckCircle, Clock, AlertTriangle, ToggleLeft as ToggleLeftIcon, ToggleRight as ToggleRightIcon } from 'lucide-react';

export default function UpdateRolloutManager() {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFlags();
    }, []);

    const fetchFlags = async () => {
        try {
            const res = await api.get('/rollout/flags');
            setFlags(Array.isArray(res.data) ? res.data : []);
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
        <section className="p-10 space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-10 bg-primary rounded-full shadow-[0_0_15px_var(--primary)]"></div>
                    <h3 className="font-black text-foreground uppercase tracking-[0.2em] text-sm">Gerenciador Maestro de Atualizações</h3>
                </div>
                <div className="bg-primary/5 border border-primary/20 px-4 py-2 rounded-xl">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                        <Shield className="w-3 h-3" /> Camada de Rollout Master
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {flags.filter(f => f.barbershopId === null).map(globalFlag => {
                    const overrides = flags.filter(f => f.key === globalFlag.key && f.barbershopId !== null);

                    return (
                        <div key={globalFlag.id} className="bg-card border border-border rounded-[3rem] p-10 flex flex-col xl:flex-row gap-12 items-start justify-between shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>

                            <div className="flex-1 space-y-8">
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/30 shadow-inner">
                                        {globalFlag.key}
                                    </span>
                                    {globalFlag.enabled ? (
                                        <span className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                                            <CheckCircle className="w-4 h-4" /> Ativo Globalmente
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2 bg-muted px-4 py-2 rounded-xl border border-border">
                                            <Clock className="w-4 h-4" /> Em Teste Controlado
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-foreground font-black text-2xl tracking-tight uppercase group-hover:text-primary transition-colors duration-300">{globalFlag.description || 'Recurso em Rollout'}</h4>
                                    <p className="text-muted-foreground text-sm font-medium italic mt-2 opacity-80">Orquestre o lançamento deste recurso para múltiplos parceiros ou para toda a rede.</p>
                                </div>

                                <div className="pt-6 border-t border-border/50">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-primary" /> Unidades em Ambiente de Teste:
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {overrides.length > 0 ? overrides.map(o => (
                                            <div key={o.id} className="bg-background border border-border px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm hover:border-primary/40 transition-all">
                                                <span className="text-foreground text-xs font-black uppercase tracking-tighter">{o.barbershop?.name || 'Parceiro'}</span>
                                                <button
                                                    onClick={() => toggleFlag(o.key, o.enabled, o.barbershopId)}
                                                    className={`transition-all duration-300 ${o.enabled ? 'text-primary' : 'text-muted-foreground opacity-30 hover:opacity-100'}`}
                                                >
                                                    {o.enabled ? <ToggleRightIcon className="w-8 h-8" /> : <ToggleLeftIcon className="w-8 h-8" />}
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="bg-muted/30 border border-dashed border-border px-6 py-3 rounded-xl">
                                                <p className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest italic leading-none">Nenhuma unidade testando isoladamente.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full xl:w-auto flex flex-col gap-4">
                                <button
                                    onClick={() => handleRollout(globalFlag.key)}
                                    disabled={globalFlag.enabled}
                                    className={`w-full xl:min-w-[280px] px-10 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl active:scale-95 ${globalFlag.enabled
                                        ? 'bg-muted text-muted-foreground/30 border border-border cursor-not-allowed'
                                        : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 hover:scale-105'
                                        }`}
                                >
                                    {globalFlag.enabled ? 'RECURSO LIBERADO GLOBAL' : 'LIBERAR ROLLOUT GLOBAL'}
                                </button>
                                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 max-w-[280px]">
                                    <p className="text-[9px] text-muted-foreground text-center font-bold uppercase tracking-widest leading-relaxed">
                                        <AlertTriangle className="w-3 h-3 inline mr-1 text-primary" />
                                        A liberação global ativa o código fonte para todas as unidades na rede Diamond instantaneamente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {flags.length === 0 && (
                    <div className="bg-card border-2 border-dashed border-border rounded-[3rem] p-24 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] italic">Nenhuma flag de rollout detectada no orquestrador</p>
                    </div>
                )}
            </div>
        </section>
    );
}
