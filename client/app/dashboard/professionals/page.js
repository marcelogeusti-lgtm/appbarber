'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import { Plus, Trash2, Edit2, X, User, Phone, Mail, Award, Scissors } from 'lucide-react';

export default function ProfessionalsPage() {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', specialty: '', bio: '' });
    const [user, setUser] = useState(null);
    const [barbershopId, setBarbershopId] = useState(null);

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
    const { data: professionals = [], isLoading: loadingPros } = useQuery({
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
                alert('Barbearia não encontrada.');
                return;
            }

            const payload = { ...formData, barbershopId };

            if (editingId) {
                await api.put(`/professionals/${editingId}`, payload);
            } else {
                await api.post('/professionals', payload);
            }

            setFormData({ name: '', email: '', phone: '', specialty: '', bio: '' });
            setIsAdding(false);
            setEditingId(null);
            queryClient.invalidateQueries(['professionals', barbershopId]);
        } catch (err) {
            alert('Erro ao salvar profissional');
        }
    };

    const handleEdit = (pro) => {
        setFormData({
            name: pro.name || pro.user?.name || '',
            email: pro.email || pro.user?.email || '',
            phone: pro.phone || pro.user?.phone || '',
            specialty: pro.specialty || '',
            bio: pro.bio || ''
        });
        setEditingId(pro.id);
        setIsAdding(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esse profissional?')) return;
        try {
            await api.delete(`/professionals/${id}`);
            queryClient.invalidateQueries(['professionals', barbershopId]);
        } catch (err) {
            alert('Erro ao excluir profissional');
        }
    };

    if (loadingPros) return <div className="p-8 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Carregando profissionais...</div>;

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-3xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Equipe de Profissionais</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Gerencie os profissionais que realizam atendimentos no seu estabelecimento.</p>
                    </div>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Novo Profissional
                    </button>
                )}
            </header>

            {isAdding && (
                <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-2xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black uppercase tracking-widest text-foreground">
                            {editingId ? 'Editar Perfil' : 'Novo Integrante'}
                        </h2>
                        <button onClick={() => { setIsAdding(false); setEditingId(null); setFormData({ name: '', email: '', phone: '', specialty: '', bio: '' }); }} className="text-muted-foreground hover:text-destructive transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</label>
                            <input
                                placeholder="Ex: Marcelo Geusti"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition shadow-inner"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail de Acesso</label>
                            <input
                                type="email"
                                placeholder="email@exemplo.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition shadow-inner"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Celular / WhatsApp</label>
                            <input
                                placeholder="(00) 00000-0000"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition shadow-inner"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Especialidade Principal</label>
                            <input
                                placeholder="Ex: Barbeiro Master / Colorista"
                                value={formData.specialty}
                                onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition shadow-inner"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Bio / Descrição (Opcional)</label>
                            <textarea
                                placeholder="Conte um pouco sobre a experiência..."
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground transition shadow-inner min-h-[120px]"
                            />
                        </div>
                        <div className="md:col-span-2 pt-4">
                            <button type="submit" className="w-full bg-primary text-primary-foreground p-5 rounded-2xl font-black uppercase tracking-[0.2em] transition hover:bg-primary/90 shadow-2xl shadow-primary/20 active:scale-95">
                                {editingId ? 'ATUALIZAR PROFISSIONAL' : 'CADASTRAR NA EQUIPE'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {professionals.map(pro => (
                    <div key={pro.id} className="bg-card p-10 rounded-[2.5rem] border border-border hover:border-primary/50 transition-all group relative flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:shadow-primary/5">
                        <div className="w-24 h-24 rounded-[2rem] bg-muted mb-6 flex items-center justify-center border-4 border-background shadow-inner relative group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                            {pro.user?.avatarUrl ? (
                                <img src={pro.user.avatarUrl} alt={pro.name} className="w-full h-full object-cover" />
                            ) : <User className="w-10 h-10 text-primary" />}
                        </div>

                        <div className="mb-6">
                            <h3 className="font-black text-xl text-foreground uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">
                                {pro.name || pro.user?.name}
                            </h3>
                            <p className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-widest mt-2 border border-primary/20 inline-block">
                                {pro.specialty || 'Profissional'}
                            </p>
                        </div>

                        <div className="space-y-3 w-full border-t border-border/50 pt-6 mb-8">
                            <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground justify-center">
                                <Phone className="w-4 h-4 text-primary" />
                                <span>{pro.phone || pro.user?.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground justify-center">
                                <Mail className="w-4 h-4 text-primary" />
                                <span className="truncate max-w-[200px]">{pro.email || pro.user?.email || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 w-full mt-auto">
                            <button
                                onClick={() => handleEdit(pro)}
                                className="flex-1 bg-muted border border-border p-4 rounded-2xl flex justify-center items-center text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all font-black text-[10px] uppercase tracking-widest"
                            >
                                <Edit2 className="w-4 h-4 mr-2" /> Editar
                            </button>
                            <button
                                onClick={() => handleDelete(pro.id)}
                                className="p-4 bg-muted border border-border rounded-2xl flex justify-center items-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {professionals.length === 0 && !isAdding && (
                <div className="text-center py-32 bg-card rounded-[3rem] border-2 border-dashed border-border shadow-inner">
                    <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground/30">
                        <Award className="w-10 h-10" />
                    </div>
                    <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest italic">Nenhum profissional na equipe ainda.</p>
                </div>
            )}
        </div>
    );
}
