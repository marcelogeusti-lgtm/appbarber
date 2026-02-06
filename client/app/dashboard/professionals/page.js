'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import {
    Plus, User, Phone, Mail, Clock, Shield, X, Check,
    Calendar, Trash2, Edit, MapPin, Eye, EyeOff, Building
} from 'lucide-react';
import ProfessionalModal from '../../../components/ProfessionalModal';

export default function ProfessionalsPage() {
    const [pros, setPros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPro, setSelectedPro] = useState(null);

    useEffect(() => {
        fetchPros();
    }, []);

    const fetchPros = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const res = await api.get(`/professionals?barbershopId=${user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id}`);
            setPros(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleEditPro = (pro) => {
        setSelectedPro(pro);
        setModalOpen(true);
    };

    const handleAddPro = () => {
        setSelectedPro(null);
        setModalOpen(true);
    };

    const handleDeletePro = async (proId, proName) => {
        if (!confirm(`⚠️ AVISO DE EXCLUSÃO DEFINITIVA: 

Você está prestes a apagar TODOS os dados do profissional ${proName} permanentemente.

Esta ação irá REMOVER:
- Perfil e Dados de Acesso
- Agenda e Horários
- TODO o histórico de Agendamentos vinculados
- Registros de Comissões e Vendas
- Lista de Espera

Esta ação é IRREVERSÍVEL e não pode ser desfeita. O e-mail, CPF e Telefone serão liberados para um novo cadastro totalmente do zero.

Deseja realmente apagar tudo agora?`)) return;

        try {
            await api.delete(`/professionals/${proId}`);
            await fetchPros();
            alert('✅ Profissional removido com sucesso!');
        } catch (err) {
            console.error(err);
            alert('❌ Erro ao remover: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <span className="font-black uppercase text-[10px] tracking-widest">Carregando sua equipe...</span>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-[2.5rem] border border-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-[1.5rem] border border-emerald-500/20 shadow-inner">
                        <User className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">Equipe</h1>
                        <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest italic mt-1">Gerencie talentos, horários e permissões.</p>
                    </div>
                </div>
                <button
                    onClick={handleAddPro}
                    className="relative z-10 flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Adicionar Profissional
                </button>
            </header>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pros.map(pro => (
                    <div key={pro.id} className={`group bg-card rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden flex flex-col ${pro.active ? 'border-border hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5' : 'border-destructive/20 opacity-70'
                        }`}>

                        {/* Status Batch */}
                        {!pro.active && (
                            <div className="absolute top-6 left-6 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                                Inativo
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="absolute top-6 right-6 z-10 flex gap-2">
                            <button
                                onClick={() => handleEditPro(pro)}
                                className="p-3 rounded-2xl bg-muted/80 backdrop-blur-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/10 transition-all"
                                title="Editar"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeletePro(pro.id, pro.name)}
                                className="p-3 rounded-2xl bg-muted/80 backdrop-blur-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/10 transition-all"
                                title="Remover"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Card Image/Avatar Header */}
                        <div className="h-32 bg-muted relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card" />
                            {pro.professionalProfile?.showPublicly ? (
                                <div className="absolute top-4 left-4 flex items-center gap-1 text-[8px] font-black uppercase text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20 backdrop-blur-md">
                                    <Eye className="w-3 h-3" /> Público
                                </div>
                            ) : (
                                <div className="absolute top-4 left-4 flex items-center gap-1 text-[8px] font-black uppercase text-muted-foreground bg-muted/10 px-2 py-1 rounded-full border border-border backdrop-blur-md">
                                    <EyeOff className="w-3 h-3" /> Privado
                                </div>
                            )}
                        </div>

                        <div className="px-8 pb-8 -mt-12 flex-1 flex flex-col relative z-20">
                            <div className="flex items-end gap-4 mb-6">
                                <div className="w-24 h-24 rounded-[2rem] bg-card border-4 border-card shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500 relative shrink-0">
                                    {pro.avatarUrl ? (
                                        <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-black text-4xl text-primary">
                                            {pro.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="pb-2">
                                    <h3 className="font-black text-2xl text-foreground uppercase tracking-tighter leading-none">{pro.name}</h3>
                                    <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                        <Shield className="w-3 h-3" /> {pro.professionalProfile?.position || 'Profissional'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center border border-border shadow-inner group-hover:text-primary transition-colors">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">{pro.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center border border-border shadow-inner group-hover:text-primary transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm tracking-tight truncate">{pro.email}</span>
                                </div>
                                {pro.professionalProfile?.city && (
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center border border-border shadow-inner group-hover:text-primary transition-colors">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-tight truncate">{pro.professionalProfile.city} - {pro.professionalProfile.state}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-muted/50 p-4 rounded-3xl border border-border group-hover:border-primary/20 transition-all cursor-default">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Agenda</p>
                                    <div className="flex items-center gap-2 text-foreground">
                                        <Clock className="w-3 h-3 text-primary" />
                                        <span className="text-[10px] font-black">{pro.professionalProfile?.schedules?.filter(s => !s.isOff).length || 0} Dias</span>
                                    </div>
                                </div>
                                <div className="bg-muted/50 p-4 rounded-3xl border border-border group-hover:border-primary/20 transition-all cursor-default">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Serviços</p>
                                    <div className="flex items-center gap-2 text-foreground">
                                        <Building className="w-3 h-3 text-primary" />
                                        <span className="text-[10px] font-black">{pro.professionalProfile?.services?.length || 0} Itens</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleEditPro(pro)}
                            className="m-8 mt-0 bg-secondary border border-border p-4 rounded-2xl font-black text-[10px] text-muted-foreground uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:shadow-xl group-hover:shadow-primary/20 transition-all flex items-center justify-center gap-3"
                        >
                            <Edit className="w-4 h-4" /> Gerenciar Profile
                        </button>
                    </div>
                ))}

                {/* Empty State */}
                {pros.length === 0 && (
                    <div className="col-span-full py-20 bg-card rounded-[3rem] border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-muted rounded-[2rem] flex items-center justify-center mb-6 border border-border">
                            <User className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">Nenhum Profissional Cadastrado</h3>
                        <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-2">Comece adicionando seu primeiro membro de equipe.</p>
                        <button
                            onClick={handleAddPro}
                            className="mt-8 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-emerald-500/30 hover:bg-emerald-600 transition"
                        >
                            Cadastrar Agora
                        </button>
                    </div>
                )}
            </div>

            <ProfessionalModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                professional={selectedPro}
                onSuccess={fetchPros}
            />
        </div>
    );
}

const Loader2 = ({ className }) => (
    <div className={`animate-spin ${className}`}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2V6M12 18V22M6 12H2M22 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);
