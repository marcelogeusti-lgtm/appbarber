'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Mail, Phone, ChevronLeft, Loader2, Camera, Trash2 } from 'lucide-react';
import api from '../../../../lib/clientApi';
import { useClientAuth } from '../../../../contexts/ClientAuthContext';
import { toast } from 'sonner';

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

    return (
        <div className="animate-in fade-in duration-500">
            {/* Mobile Header (Hidden on Desktop because of Sidebar) */}
            <div className="flex items-center gap-4 mb-10 lg:hidden">
                <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition">
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-xl font-black text-white">Meus Dados</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left side: Avatar */}
                <div className="flex flex-col items-center">
                    <div className="relative group cursor-pointer w-32 h-32 lg:w-40 lg:h-40">
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                            onChange={handleAvatarChange}
                        />
                        <div className="w-full h-full rounded-full border-4 border-slate-900 overflow-hidden bg-slate-900 shadow-2xl transition-transform group-hover:scale-105">
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                                    <User className="w-16 h-16" />
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-2 right-2 p-2.5 bg-primary rounded-full border-4 border-[#050505] shadow-lg group-hover:scale-110 transition-transform">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                {/* Right side: Form */}
                <div className="flex-1">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid gap-6">
                            {/* Nome Completo */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                    Nome completo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Seu nome"
                                    className="w-full bg-[#111111] border border-white/5 rounded-2xl py-4 px-5 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition outline-none"
                                    required
                                />
                            </div>

                            {/* Data de Nascimento */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                    Data de nascimento
                                </label>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                    className="w-full bg-[#111111] border border-white/5 rounded-2xl py-4 px-5 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition outline-none [color-scheme:dark]"
                                />
                            </div>

                            {/* Celular com Flag */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                    Celular <span className="text-red-500">*</span>
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 flex items-center gap-2 pr-3 border-r border-white/10 select-none">
                                        <img src="https://flagcdn.com/w20/br.png" alt="BR" className="w-5 h-auto rounded-sm" />
                                        <span className="text-xs font-bold text-slate-400">+55</span>
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="(00) 00000-0000"
                                        className="w-full bg-[#111111] border border-white/5 rounded-2xl py-4 pl-24 pr-5 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Gênero */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                    Gênero
                                </label>
                                <div className="flex flex-col gap-3 ml-1">
                                    {[
                                        { id: 'Masculino', label: 'Masculino' },
                                        { id: 'Feminino', label: 'Feminino' },
                                        { id: 'Outros', label: 'Outros' }
                                    ].map((option) => (
                                        <label key={option.id} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value={option.id}
                                                    checked={formData.gender === option.id}
                                                    onChange={handleChange}
                                                    className="peer appearance-none w-5 h-5 rounded-full border-2 border-slate-800 checked:border-primary transition-all cursor-pointer"
                                                />
                                                <div className="absolute w-2.5 h-2.5 bg-primary rounded-full scale-0 peer-checked:scale-100 transition-transform duration-200" />
                                            </div>
                                            <span className={`text-sm font-medium transition-colors ${formData.gender === option.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                                {option.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 space-y-6">
                            <button
                                type="submit"
                                disabled={saving || uploading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
                            </button>

                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
                                            // Handle account deletion logic if available
                                            toast.error('Funcionalidade em desenvolvimento.');
                                        }
                                    }}
                                    className="text-red-500/60 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.1em] transition-colors underline underline-offset-4"
                                >
                                    Excluir conta
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
