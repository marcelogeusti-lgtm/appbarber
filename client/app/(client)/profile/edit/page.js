'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Mail, Phone, ChevronLeft, Loader2, Camera } from 'lucide-react';
import api from '../../../../lib/clientApi';
import { storage, ensureFirebaseAuth } from '../../../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useClientAuth } from '../../../../contexts/ClientAuthContext';

export default function EditProfilePage() {
    const router = useRouter();
    const { user: authUser, refreshUser } = useClientAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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
        setMessage({ type: '', text: '' });

        try {
            // 1. Process as Base64 (Data URL)
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });

            const base64String = await base64Promise;
            setFormData(prev => ({ ...prev, avatarUrl: base64String }));
            setMessage({ type: 'success', text: 'Foto carregada! Clique em SALVAR para confirmar.' });
        } catch (error) {
            console.error("Upload error details:", error);
            setMessage({ type: 'error', text: 'Erro ao processar foto.' });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await api.put('/clients/profile', formData);
            if (res.data.user) {
                refreshUser(); // Update context
            }
            setMessage({ type: 'success', text: 'Dados salvos com sucesso!' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erro ao salvar dados.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-24 max-w-lg mx-auto">
            <div className="flex items-center gap-4 mb-8 mt-4">
                <button onClick={() => router.back()} className="p-2 bg-slate-900 rounded-full hover:bg-primary/20 transition">
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-xl font-bold">Meus Dados</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer w-28 h-28">
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                            onChange={handleAvatarChange}
                        />
                        <div className="w-full h-full rounded-full border-4 border-slate-900 overflow-hidden bg-slate-900">
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-slate-500 m-auto mt-7" />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 p-2 bg-primary rounded-full border-2 border-[#050505]">
                            <Camera className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-[#111111] border border-white/5 rounded-xl py-4 px-4 text-sm text-white focus:border-primary transition outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Telefone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-[#111111] border border-white/5 rounded-xl py-4 px-4 text-sm text-white focus:border-primary transition outline-none"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving || uploading}
                    className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-sm uppercase tracking-widest transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Salvar Alterações'}
                </button>
            </form>
        </div>
    );
}
