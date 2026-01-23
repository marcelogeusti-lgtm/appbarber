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
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-[1.5rem] border border-emerald-500/20 shadow-inner">
                        <User className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Equipe</h1>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest italic mt-1">Gerencie talentos, horários e permissões.</p>
                    </div>
                </div>
                <button
                    onClick={handleAddPro}
                    className="relative z-10 flex items-center gap-3 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-emerald-500/30 hover:bg-emerald-600 hover:scale-105 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Adicionar Profissional
                </button>
            </header>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pros.map(pro => (
                    <div key={pro.id} className={`group bg-[#111827] rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden flex flex-col ${pro.active ? 'border-slate-800 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/5' : 'border-red-500/20 opacity-70'
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
                                className="p-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all"
                                title="Editar"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeletePro(pro.id, pro.name)}
                                className="p-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition-all"
                                title="Remover"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Card Image/Avatar Header */}
                        <div className="h-32 bg-slate-950 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111827]" />
                            {pro.professionalProfile?.showPublicly ? (
                                <div className="absolute top-4 left-4 flex items-center gap-1 text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md">
                                    <Eye className="w-3 h-3" /> Público
                                </div>
                            ) : (
                                <div className="absolute top-4 left-4 flex items-center gap-1 text-[8px] font-black uppercase text-slate-500 bg-slate-500/10 px-2 py-1 rounded-full border border-slate-500/20 backdrop-blur-md">
                                    <EyeOff className="w-3 h-3" /> Privado
                                </div>
                            )}
                        </div>

                        <div className="px-8 pb-8 -mt-12 flex-1 flex flex-col relative z-20">
                            <div className="flex items-end gap-4 mb-6">
                                <div className="w-24 h-24 rounded-[2rem] bg-slate-900 border-4 border-[#111827] shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500 relative shrink-0">
                                    {pro.avatarUrl ? (
                                        <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-black text-4xl text-emerald-500">
                                            {pro.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="pb-2">
                                    <h3 className="font-black text-2xl text-white uppercase tracking-tighter leading-none">{pro.name}</h3>
                                    <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                        <Shield className="w-3 h-3" /> {pro.professionalProfile?.position || 'Profissional'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8 flex-1">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner group-hover:text-emerald-500 transition-colors">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">{pro.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner group-hover:text-emerald-500 transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm tracking-tight truncate">{pro.email}</span>
                                </div>
                                {pro.professionalProfile?.city && (
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner group-hover:text-emerald-500 transition-colors">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-tight truncate">{pro.professionalProfile.city} - {pro.professionalProfile.state}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800/50 group-hover:border-emerald-500/20 transition-all cursor-default">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Agenda</p>
                                    <div className="flex items-center gap-2 text-white">
                                        <Clock className="w-3 h-3 text-emerald-500" />
                                        <span className="text-[10px] font-black">{pro.professionalProfile?.schedules?.filter(s => !s.isOff).length || 0} Dias</span>
                                    </div>
                                </div>
                                <div className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800/50 group-hover:border-emerald-500/20 transition-all cursor-default">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Serviços</p>
                                    <div className="flex items-center gap-2 text-white">
                                        <Building className="w-3 h-3 text-emerald-500" />
                                        <span className="text-[10px] font-black">{pro.professionalProfile?.services?.length || 0} Itens</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handleEditPro(pro)}
                            className="m-8 mt-0 bg-slate-950 border border-slate-800 p-4 rounded-2xl font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 group-hover:shadow-xl group-hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                        >
                            <Edit className="w-4 h-4" /> Gerenciar Profile
                        </button>
                    </div>
                ))}

                {/* Empty State */}
                {pros.length === 0 && (
                    <div className="col-span-full py-20 bg-[#111827] rounded-[3rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-800">
                            <User className="w-12 h-12 text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Nenhum Profissional Cadastrado</h3>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Comece adicionando seu primeiro membro de equipe.</p>
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
