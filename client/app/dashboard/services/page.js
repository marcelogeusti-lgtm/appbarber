'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import { Plus, Trash2, Edit2, X, Scissors, Clock } from 'lucide-react';
import Pagination from '../../../components/ui/Pagination';

export default function ServicesPage() {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', price: '', duration: '', description: '', commissionType: 'PERCENTAGE', commissionValue: '', overrides: [] });
    // User state for query dependency
    const [user, setUser] = useState(null);
    const [barbershopId, setBarbershopId] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const parsed = JSON.parse(userStr);
            setUser(parsed);
            const bId = parsed.barbershopId || parsed.barbershop?.id || parsed.ownedBarbershops?.[0]?.id;
            setBarbershopId(bId);
        }
    }, []);

    // Queries
    const { data: servicesRes = { data: [], total: 0, totalPages: 0 }, isLoading: loadingServices } = useQuery({
        queryKey: ['services', barbershopId, page, limit],
        queryFn: async () => {
            const res = await api.get(`/services?barbershopId=${barbershopId}&page=${page}&limit=${limit}`);
            return res.data;
        },
        enabled: !!barbershopId,
    });

    const services = Array.isArray(servicesRes.data) ? servicesRes.data : [];

    const { data: professionals = [] } = useQuery({
        queryKey: ['professionals', barbershopId],
        queryFn: async () => {
            const res = await api.get(`/professionals?barbershopId=${barbershopId}`);
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: !!barbershopId,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!barbershopId) {
                alert('⚠️ Atenção: Sua conta ainda não possui uma barbearia vinculada. Por favor, registre sua barbearia primeiro no menu de configurações.');
                return;
            }

            // Ensure numeric types and clean data
            const payload = {
                name: formData.name.trim(),
                price: parseFloat(formData.price),
                duration: parseInt(formData.duration),
                description: formData.description.trim(),
                commissionType: formData.commissionType,
                commissionValue: formData.commissionValue ? parseFloat(formData.commissionValue) : 0,
                isFeatured: formData.isFeatured,
                overrides: formData.overrides,
                barbershopId
            };

            if (editingId) {
                await api.put(`/services/${editingId}`, payload);
            } else {
                await api.post('/services', payload);
            }

            setFormData({ name: '', price: '', duration: '', description: '', commissionType: 'PERCENTAGE', commissionValue: '', isFeatured: false, overrides: [] });
            setIsAdding(false);
            setEditingId(null);

            // Invalidate to refetch
            queryClient.invalidateQueries(['services', barbershopId]);
        } catch (err) {
            console.error('Submit Service Error:', err);
            alert('Erro ao salvar serviço: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleEdit = (service) => {
        const overrides = service.commissionOverrides?.map(o => ({
            professionalId: o.professionalId,
            type: o.type,
            value: o.value
        })) || [];

        setFormData({
            name: service.name,
            price: service.price,
            duration: service.duration,
            description: service.description || '',
            commissionType: service.commissionType || 'PERCENTAGE',
            commissionValue: service.commissionValue || '',
            isFeatured: service.isFeatured || false,
            overrides
        });
        setEditingId(service.id);
        setIsAdding(true);
    };

    const toggleOverride = (proId) => {
        const current = formData.overrides || [];
        const exists = current.find(o => o.professionalId === proId);
        if (exists) {
            setFormData({ ...formData, overrides: current.filter(o => o.professionalId !== proId) });
        } else {
            setFormData({ ...formData, overrides: [...current, { professionalId: proId, type: formData.commissionType, value: formData.commissionValue }] });
        }
    };

    const updateOverride = (proId, field, value) => {
        const current = formData.overrides || [];
        setFormData({
            ...formData,
            overrides: current.map(o => o.professionalId === proId ? { ...o, [field]: value } : o)
        });
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
        try {
            await api.delete(`/services/${id}`);
            queryClient.invalidateQueries(['services', barbershopId]);
        } catch (err) {
            alert('Erro ao excluir serviço');
        }
    };

    // isPending checks if there's absolutely NO data yet.
    // If we have cached data, it won't show the skeleton/spinner.
    const isInitialLoading = loadingServices && services.length === 0;

    if (isInitialLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-black uppercase text-xs">Carregando serviços...</div>;

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-3xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <Scissors className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Meus Serviços</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Configure os serviços e preços que aparecem para seus clientes.</p>
                    </div>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition"
                    >
                        <Plus className="w-4 h-4" /> Novo Serviço
                    </button>
                )}
            </header>

            {isAdding && (
                <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-2xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold uppercase tracking-wider text-foreground">
                            {editingId ? 'Editar Serviço' : 'Novo Serviço'}
                        </h2>
                        <button onClick={() => { setIsAdding(false); setEditingId(null); setFormData({ name: '', price: '', duration: '', description: '', commissionType: 'PERCENTAGE', commissionValue: '', overrides: [] }); }} className="text-muted-foreground hover:text-destructive transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome do Serviço</label>
                            <input
                                placeholder="Ex: Corte Degradê"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Preço Atual (R$)</label>
                            <input
                                placeholder="50.00"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Duração (Minutos)</label>
                            <input
                                placeholder="30"
                                type="number"
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Breve Descrição</label>
                            <input
                                placeholder="Detalhes para o cliente..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition"
                            />
                        </div>

                        {/* Featured Toggle */}
                        <div className="flex items-center gap-3 md:col-span-2 bg-muted/30 p-4 rounded-xl border border-border/50">
                            <input
                                type="checkbox"
                                id="isFeaturedSvc"
                                checked={formData.isFeatured || false}
                                onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                                className="w-5 h-5 rounded border-border bg-background text-primary accent-primary cursor-pointer"
                            />
                            <div>
                                <label htmlFor="isFeaturedSvc" className="text-xs font-black text-foreground uppercase tracking-widest cursor-pointer select-none">Destaque / Sugestão</label>
                                <p className="text-[10px] text-muted-foreground font-medium">Aparecerá como sugestão popular no agendamento</p>
                            </div>
                        </div>

                        {/* Commission Section */}
                        <div className="md:col-span-2 border-t border-border pt-6 mt-2">
                            <h3 className="text-foreground font-bold text-lg mb-4">Comissão do Serviço</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tipo de Comissão</label>
                                    <select
                                        value={formData.commissionType}
                                        onChange={e => setFormData({ ...formData, commissionType: e.target.value })}
                                        className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition"
                                    >
                                        <option value="PERCENTAGE">Porcentagem (%)</option>
                                        <option value="FIXED">Valor Fixo (R$)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Valor</label>
                                    <input
                                        type="number"
                                        placeholder={formData.commissionType === 'PERCENTAGE' ? 'Ex: 40' : 'Ex: 20.00'}
                                        value={formData.commissionValue}
                                        onChange={e => setFormData({ ...formData, commissionValue: e.target.value })}
                                        className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition"
                                    />
                                </div>
                            </div>

                            {/* Overrides */}
                            <div className="mt-6">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">Regras Específicas por Funcionário</label>
                                <div className="bg-background rounded-xl p-4 space-y-3 border border-border max-h-60 overflow-y-auto">
                                    {professionals.map(pro => {
                                        const userObj = pro.user || pro;
                                        const proId = userObj.id;
                                        const proName = userObj.name || 'Profissional';

                                        const override = formData.overrides?.find(o => o.professionalId === proId);

                                        return (
                                            <div key={proId} className="flex items-center gap-3 p-2 rounded-lg bg-card border border-border/50">
                                                <input
                                                    type="checkbox"
                                                    checked={!!override}
                                                    onChange={() => toggleOverride(proId)}
                                                    className="w-5 h-5 rounded border-border bg-muted text-primary accent-primary"
                                                />
                                                <span className="text-sm font-bold text-muted-foreground flex-1">{proName}</span>
                                                {override && (
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={override.type}
                                                            onChange={(e) => updateOverride(proId, 'type', e.target.value)}
                                                            className="bg-background border border-border text-xs text-foreground rounded p-1 outline-none"
                                                        >
                                                            <option value="PERCENTAGE">%</option>
                                                            <option value="FIXED">R$</option>
                                                        </select>
                                                        <input
                                                            type="number"
                                                            value={override.value}
                                                            onChange={(e) => updateOverride(proId, 'value', e.target.value)}
                                                            className="w-20 bg-background border border-border text-xs text-foreground rounded p-1 outline-none"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {professionals.length === 0 && <p className="text-xs text-muted-foreground italic">Nenhum profissional encontrado.</p>}
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-4">
                            <button type="submit" className="w-full bg-primary text-primary-foreground p-4 rounded-xl font-black uppercase tracking-widest transition hover:bg-primary/90 shadow-lg">
                                {editingId ? 'ATUALIZAR SERVIÇO' : 'CADASTRAR SERVIÇO'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <div key={service.id} className="bg-card p-8 rounded-[2rem] border border-border hover:border-primary/50 transition-all group relative">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-black text-xl text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{service.name}</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" /> {service.duration} MINUTOS
                                </p>
                            </div>
                            <div className="text-xl font-black text-primary bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
                                R$ {service.price}
                            </div>
                        </div>

                        <p className="text-muted-foreground text-xs font-medium italic mb-8 h-8 overflow-hidden line-clamp-2">
                            {service.description || 'Sem descrição adicional para este serviço.'}
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(service)}
                                className="flex-1 border border-border bg-muted p-3 rounded-xl flex justify-center items-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(service.id)}
                                className="flex-1 border border-border bg-muted p-3 rounded-xl flex justify-center items-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Pagination
                currentPage={page}
                totalPages={servicesRes.totalPages}
                totalItems={servicesRes.total}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={(l) => { setLimit(l); setPage(1); }}
                label="serviços"
            />

            {services.length === 0 && !isAdding && (
                <div className="text-center py-32 bg-card rounded-[3rem] border-2 border-dashed border-border">
                    <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                        <Scissors className="w-10 h-10" />
                    </div>
                    <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">Nenhum serviço disponível</p>
                    <button onClick={() => setIsAdding(true)} className="text-primary font-black uppercase text-xs mt-3 tracking-widest hover:underline">
                        Clique aqui para começar
                    </button>
                </div>
            )}
        </div>
    );
}
