'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Mail, Phone, ChevronLeft, Loader2, Camera, Trash2 } from 'lucide-react';
import api from '../../../../lib/clientApi';
import { useClientAuth } from '../../../../contexts/ClientAuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditProfilePage() {
    const router = useRouter();
    const { user: authUser, refreshUser } = useClientAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        birthDate: '',
        gender: '',
        avatarUrl: ''
    });

    useEffect(() => {
        if (authUser) {
            let birthDateVal = '';
            if (authUser.birthDate) {
                birthDateVal = new Date(authUser.birthDate).toISOString().split('T')[0];
            }

            setFormData({
                name: authUser.name || '',
                email: authUser.email || '',
                phone: authUser.phone || '',
                birthDate: birthDateVal,
                gender: authUser.gender || '',
                avatarUrl: authUser.avatarUrl || ''
            });
            setLoading(false);
        }
    }, [authUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);

        try {
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });

            const base64String = await base64Promise;
            setFormData(prev => ({ ...prev, avatarUrl: base64String }));
            toast.success('Foto carregada! Clique em Salvar para confirmar.');
        } catch (error) {
            console.error("Upload error details:", error);
            toast.error('Erro ao processar foto.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await api.put('/clients/profile', formData);
            if (res.data.user) {
                refreshUser(); // Update context
            }
            toast.success('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar alterações.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1,
                duration: 0.5
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col gap-10"
        >
            {/* Mobile Header */}
            <div className="flex items-center gap-4 lg:hidden">
                <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition">
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-xl font-black text-white">Meus Dados</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-16">
                {/* Left side: Avatar */}
                <motion.div variants={itemVariants} className="flex flex-col items-center">
                    <div className="relative group cursor-pointer w-32 h-32 lg:w-48 lg:h-48">
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                            onChange={handleAvatarChange}
                        />
                        <div className="w-full h-full rounded-full border-4 border-white/5 overflow-hidden bg-[#0A0A0B] shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-[1.02] relative">
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-700">
                                    <User className="w-20 h-20" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
                        </div>
                        <div className="absolute bottom-2 right-2 p-3 bg-primary rounded-full border-4 border-[#050505] shadow-2xl group-hover:scale-110 transition-transform z-20">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </motion.div>

                {/* Right side: Form */}
                <div className="flex-1">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid gap-8">
                            {/* Nome Completo */}
                            <motion.div variants={itemVariants} className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                    Nome completo <span className="text-primary">*</span>
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Seu nome"
                                        className="w-full bg-[#0A0A0B]/50 backdrop-blur-md border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none group-hover:border-white/10"
                                        required
                                    />
                                    <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-primary/0 to-transparent group-focus-within:via-primary/50 transition-all" />
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Data de Nascimento */}
                                <motion.div variants={itemVariants} className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                        Data de nascimento
                                    </label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                        className="w-full bg-[#0A0A0B]/50 backdrop-blur-md border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-primary/50 transition-all outline-none [color-scheme:dark]"
                                    />
                                </motion.div>

                                {/* Celular */}
                                <motion.div variants={itemVariants} className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                        Celular <span className="text-primary">*</span>
                                    </label>
                                    <div className="relative flex items-center group">
                                        <div className="absolute left-6 flex items-center gap-2 pr-4 border-r border-white/5 select-none">
                                            <img src="https://flagcdn.com/w20/br.png" alt="BR" className="w-5 h-auto rounded-[2px]" />
                                            <span className="text-xs font-black text-slate-400">+55</span>
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="(00) 00000-0000"
                                            className="w-full bg-[#0A0A0B]/50 backdrop-blur-md border border-white/5 rounded-2xl py-5 pl-28 pr-6 text-sm text-white focus:border-primary/50 transition-all outline-none group-hover:border-white/10"
                                            required
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            {/* Gênero */}
                            <motion.div variants={itemVariants} className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                    Gênero
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    {[
                                        { id: 'Masculino', label: 'Masculino' },
                                        { id: 'Feminino', label: 'Feminino' },
                                        { id: 'Outros', label: 'Outros' }
                                    ].map((option) => (
                                        <label key={option.id} className="cursor-pointer group flex-1 min-w-[120px]">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={option.id}
                                                checked={formData.gender === option.id}
                                                onChange={handleChange}
                                                className="hidden peer"
                                            />
                                            <div className="w-full bg-[#0A0A0B]/50 border border-white/5 rounded-2xl py-4 px-2 text-center transition-all peer-checked:bg-primary/10 peer-checked:border-primary/50 group-hover:border-white/10">
                                                <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${formData.gender === option.id ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                                    {option.label}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <motion.div variants={itemVariants} className="pt-4 space-y-8">
                            <button
                                type="submit"
                                disabled={saving || uploading}
                                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.3em] transition-all shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group/btn"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300" />
                                <span className="relative z-10">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Alterações'}</span>
                            </button>

                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm('Tem certeza que deseja excluir sua conta?')) {
                                            toast.error('Funcionalidade em desenvolvimento.');
                                        }
                                    }}
                                    className="text-slate-600 hover:text-red-500/80 text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:tracking-[0.3em]"
                                >
                                    Desativar minha conta
                                </button>
                            </div>
                        </motion.div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
