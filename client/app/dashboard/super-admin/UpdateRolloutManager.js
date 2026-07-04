'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Zap, Shield, CheckCircle, Clock, AlertTriangle, ToggleLeft as ToggleLeftIcon, ToggleRight as ToggleRightIcon, Plus, Flag, Trash2 } from 'lucide-react';

export default function UpdateRolloutManager() {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newFlagKey, setNewFlagKey] = useState('');
    const [newFlagDescription, setNewFlagDescription] = useState('');
    const [newFlagAllowedPlans, setNewFlagAllowedPlans] = useState('');
    const [newFlagAllowedUsers, setNewFlagAllowedUsers] = useState('');
    const [isCreating, setIsCreating] = useState(false);

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

    const handleCreateFlag = async (e) => {
        e.preventDefault();
        try {
            await api.post('/rollout/toggle', {
                key: newFlagKey,
                enabled: false,
                barbershopId: null,
                description: newFlagDescription,
                allowedPlans: newFlagAllowedPlans ? newFlagAllowedPlans.split(',').map(p => p.trim()) : [],
                allowedUsers: newFlagAllowedUsers ? newFlagAllowedUsers.split(',').map(u => u.trim()) : []
            });
            alert('Flag criada com sucesso! Agora você pode ativar para testes.');
            setNewFlagKey('');
            setNewFlagDescription('');
            setNewFlagAllowedPlans('');
            setNewFlagAllowedUsers('');
            setIsCreating(false);
            fetchFlags();
        } catch (err) {
            alert('Erro ao criar flag.');
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

    const deleteFlag = async (key) => {
        if (!confirm(`Tem certeza que deseja EXCLUIR a flag ${key} e todas as suas configurações?`)) return;
        // Currently no endpoint for delete in controller, but toggle to enabled=false is effective for removal from UI usage 
        // Real delete would need a new endpoint. For now, let's just warn or skip if backend doesn't support.
        // Assuming current backend doesn't have delete, we'll skip for now or implement if needed.
        // Let's implement a logical disable for now.
        alert('Funcionalidade de exclusão total ainda não implementada no backend. Desative a flag.');
    };

    if (loading) return null;

    // Group flags by KEY
    const uniqueKeys = [...new Set(flags.map(f => f.key))];

    return (
        <section className="p-10 space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-10 bg-primary rounded-full shadow-[0_0_15px_var(--primary)]"></div>
                    <h3 className="font-black text-foreground uppercase tracking-[0.2em] text-sm">Gerenciador Maestro de Atualizações</h3>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Nova Feature Flag
                    </button>
                    <div className="bg-primary/5 border border-primary/20 px-4 py-2 rounded-xl">
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <Shield className="w-3 h-3" /> Camada de Rollout Master
                        </p>
                    </div>
                </div>
            </div>

            {isCreating && (
                <div className="bg-card border border-border p-8 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-4">
                    <h4 className="font-black text-lg uppercase tracking-tight mb-6">Criar Nova Flag de Recurso</h4>
                    <form onSubmit={handleCreateFlag} className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="flex-1 space-y-2 w-full">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Chave da Flag (Código)</label>
                            <input
                                value={newFlagKey}
                                onChange={e => setNewFlagKey(e.target.value.replace(/\s+/g, '_').toUpperCase())}
                                placeholder="EX: NOVO_CHECKOUT_V2"
                                className="w-full p-4 bg-background border border-border rounded-xl font-bold text-foreground outline-none focus:ring-2 ring-primary uppercase"
                                required
                            />
                        </div>
                        <div className="flex-[2] space-y-2 w-full">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Descrição</label>
                            <input
                                value={newFlagDescription}
                                onChange={e => setNewFlagDescription(e.target.value)}
                                placeholder="Descrição do que essa feature faz..."
                                className="w-full p-4 bg-background border border-border rounded-xl font-bold text-foreground outline-none focus:ring-2 ring-primary"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Planos Permitidos (Separados por vírgula)</label>
                                <input
                                    value={newFlagAllowedPlans}
                                    onChange={e => setNewFlagAllowedPlans(e.target.value)}
                                    placeholder="SOLO, PRO, ENTERPRISE"
                                    className="w-full p-4 bg-background border border-border rounded-xl font-bold text-foreground outline-none focus:ring-2 ring-primary uppercase"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Unidades Permitidas (IDs)</label>
                                <input
                                    value={newFlagAllowedUsers}
                                    onChange={e => setNewFlagAllowedUsers(e.target.value)}
                                    placeholder="UUID-1, UUID-2"
                                    className="w-full p-4 bg-background border border-border rounded-xl font-bold text-foreground outline-none focus:ring-2 ring-primary"
                                />
                            </div>
                        </div>
                        <button type="submit" className="bg-primary text-primary-foreground p-4 px-10 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition shadow-lg shadow-primary/20 whitespace-nowrap">
                            Criar Flag
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                {uniqueKeys.map(key => {
                    const globalFlag = flags.find(f => f.key === key && f.barbershopId === null);
                    const overrides = flags.filter(f => f.key === key && f.barbershopId !== null);

                    const isGlobalActive = globalFlag?.enabled;

                    return (
                        <div key={key} className="bg-card border border-border rounded-xl p-10 flex flex-col xl:flex-row gap-12 items-start justify-between shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>

                            <div className="flex-1 space-y-8">
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/30 shadow-inner flex items-center gap-2">
                                        <Flag className="w-3 h-3" /> {key}
                                    </span>
                                    {isGlobalActive ? (
                                        <span className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                                            <CheckCircle className="w-4 h-4" /> Ativo Globalmente
                                        </span>
                                    ) : (
                                        <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-500/20">
                                            <Clock className="w-4 h-4" /> Em Teste Controlado
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-foreground font-black text-2xl tracking-tight uppercase group-hover:text-primary transition-colors duration-300">{globalFlag?.description || 'Recurso sem descrição'}</h4>
                                    <p className="text-muted-foreground text-sm font-medium italic mt-2 opacity-80">Orquestre o lançamento deste recurso para múltiplos parceiros ou para toda a rede.</p>
                                </div>

                                <div className="pt-6 border-t border-border/50">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-primary" /> Unidades em Ambiente de Teste:
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        {overrides.length > 0 ? overrides.map(o => (
                                            <div key={o.id} className="bg-background border border-border px-5 py-3 rounded-xl flex items-center justify-between gap-4 shadow-sm hover:border-primary/40 transition-all max-w-md">
                                                <span className="text-foreground text-xs font-black uppercase tracking-tighter">{o.barbershop?.name || 'ID: ' + o.barbershopId}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black uppercase ${o.enabled ? 'text-primary' : 'text-red-500'}`}>{o.enabled ? 'ATIVO' : 'INATIVO'}</span>
                                                    <button
                                                        onClick={() => toggleFlag(o.key, o.enabled, o.barbershopId)}
                                                        className={`transition-all duration-300 ${o.enabled ? 'text-primary' : 'text-muted-foreground opacity-50 hover:opacity-100 hover:text-primary'}`}
                                                    >
                                                        {o.enabled ? <ToggleRightIcon className="w-8 h-8" /> : <ToggleLeftIcon className="w-8 h-8" />}
                                                    </button>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="bg-muted/30 border border-dashed border-border px-6 py-3 rounded-xl max-w-md mb-2">
                                                <p className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest italic leading-none">Nenhuma unidade testando isoladamente.</p>
                                            </div>
                                        )}

                                        {!isGlobalActive && (
                                            <button
                                                onClick={() => {
                                                    const userStr = localStorage.getItem('user');
                                                    if (!userStr) return alert('Usuário não encontrado');
                                                    const user = JSON.parse(userStr);
                                                    const bId = user.barbershopId || user.barbershop?.id;
                                                    if (!bId) return alert('ID da Barbearia não encontrado');
                                                    // Create override (default to OFF effectively, but entry created, user can then toggle ON)
                                                    // Actually better to toggle TRUE immediately for "Testing"
                                                    toggleFlag(key, false, bId); // Pass false as current state, so it toggles to true
                                                }}
                                                className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition flex items-center justify-center gap-2 max-w-md"
                                            >
                                                <Zap className="w-3 h-3" /> Testar na Minha Unidade (Master)
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full xl:w-auto flex flex-col gap-4">
                                <button
                                    onClick={() => handleRollout(key)}
                                    disabled={isGlobalActive}
                                    className={`w-full xl:min-w-[280px] px-10 py-6 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl active:scale-95 ${isGlobalActive
                                        ? 'bg-muted text-muted-foreground/30 border border-border cursor-not-allowed'
                                        : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20 hover:scale-105'
                                        }`}
                                >
                                    {isGlobalActive ? 'RECURSO LIBERADO GLOBAL' : 'LIBERAR ROLLOUT GLOBAL'}
                                </button>

                                {!isGlobalActive && (
                                    <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/20 max-w-[280px]">
                                        <p className="text-[9px] text-orange-600 text-center font-bold uppercase tracking-widest leading-relaxed">
                                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                                            Rollout pendente. Ative individualmente para validar antes da liberação geral.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {uniqueKeys.length === 0 && (
                    <div className="bg-card border-2 border-dashed border-border rounded-xl p-24 text-center">
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
