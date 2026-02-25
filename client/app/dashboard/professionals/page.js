'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import ProfessionalModal from '../../../components/ProfessionalModal';
import { Plus, Trash2, Edit2, User, Phone, Mail, Award, Scissors, Clock, Calendar } from 'lucide-react';

export default function ProfessionalsPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProfessional, setSelectedProfessional] = useState(null);
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
            if (!barbershopId) return [];
            const res = await api.get(`/professionals?barbershopId=${barbershopId}`);
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: !!barbershopId,
    });

    const handleEdit = (pro) => {
        setSelectedProfessional(pro);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedProfessional(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esse profissional? Esta ação removerá todos os agendamentos futuros e dados vinculados.')) return;
        try {
            await api.delete(`/professionals/${id}`);
            queryClient.invalidateQueries(['professionals', barbershopId]);
            alert('Profissional removido com sucesso.');
        } catch (err) {
            alert('Erro ao excluir profissional: ' + (err.response?.data?.message || err.message));
        }
    };

    const isInitialLoading = loadingPros && professionals.length === 0;

    if (isInitialLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Carregando equipe...</div>;

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-3xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Equipe de Profissionais</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Gerencie horários, comissões e dados dos profissionais.</p>
                    </div>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Novo Profissional
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {professionals.map(pro => (
                    <div key={pro.id} className="bg-card p-10 rounded-[2.5rem] border border-border hover:border-primary/50 transition-all group relative flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:shadow-primary/5">
                        <div className="absolute top-6 right-6 flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${pro.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {pro.active ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>

                        <div className="w-24 h-24 rounded-[2rem] bg-muted mb-6 flex items-center justify-center border-4 border-background shadow-inner relative group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                            {pro.user?.avatarUrl || pro.avatarUrl ? (
                                <img src={pro.user?.avatarUrl || pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover" />
                            ) : <User className="w-10 h-10 text-primary" />}
                        </div>

                        <div className="mb-6">
                            <h3 className="font-black text-xl text-foreground uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">
                                {pro.name || pro.user?.name}
                            </h3>
                            <p className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-widest mt-2 border border-primary/20 inline-block">
                                {pro.professionalProfile?.position || pro.position || 'Profissional'}
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
                            <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground justify-center">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span>{pro.professionalProfile?.schedules?.filter(s => !s.isOff).length || 0} dias de trabalho</span>
                            </div>
                        </div>

                        <div className="flex gap-4 w-full mt-auto">
                            <button
                                onClick={() => handleEdit(pro)}
                                className="flex-1 bg-muted border border-border p-4 rounded-2xl flex justify-center items-center text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all font-black text-[10px] uppercase tracking-widest"
                            >
                                <Edit2 className="w-4 h-4 mr-2" /> Editar Completo
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

            {professionals.length === 0 && (
                <div className="text-center py-32 bg-card rounded-[3rem] border-2 border-dashed border-border shadow-inner">
                    <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground/30">
                        <Award className="w-10 h-10" />
                    </div>
                    <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest italic">Nenhum profissional encontrado.</p>
                </div>
            )}

            <ProfessionalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                professional={selectedProfessional}
                onSuccess={() => {
                    queryClient.invalidateQueries(['professionals', barbershopId]);
                }}
            />
        </div>
    );
}
