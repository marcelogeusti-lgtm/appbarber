'use client';
import { useState } from 'react';
import { X, Save, User, Phone, Mail, FileText, Loader2, Camera } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function NewClientModal({ isOpen, onClose, onSuccess, barbershopId }) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        notes: '',
        avatarUrl: ''
    });

    if (!isOpen) return null;

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; // Reduced from 1920 for faster uploads
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas conversion failed'));
                        }
                    }, 'image/jpeg', 0.8);
                };
            };
        });
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            // Compress if size > 300KB
            let fileToUpload = file;
            if (file.size > 300000) {
                fileToUpload = await compressImage(file);
            }

            const storageRef = ref(storage, `clients/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, fileToUpload);
            const url = await getDownloadURL(snapshot.ref);
            setFormData(prev => ({ ...prev, avatarUrl: url }));
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Erro ao enviar imagem: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/clients', {
                ...formData,
                barbershopId
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating client:', error);
            const msg = error.response?.data?.message || error.message || 'Erro deconhecido';
            toast.error(`Erro ao cadastrar cliente: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#111827] w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-500" />
                        Novo Cliente
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">

                    {/* Avatar Upload */}
                    <div className="flex justify-center mb-6">
                        <div className="relative group w-24 h-24">
                            <input type="file" onChange={handleAvatarChange} className="absolute inset-0 opacity-0 z-10 cursor-pointer" accept="image/*" />
                            <div className={`w-full h-full rounded-full bg-slate-950 border-2 flex items-center justify-center overflow-hidden transition-all ${formData.avatarUrl ? 'border-emerald-500' : 'border-slate-800 group-hover:border-emerald-500/50'}`}>
                                {formData.avatarUrl ? (
                                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera className="w-8 h-8 text-slate-700 group-hover:text-slate-500 transition-colors" />
                                )}
                            </div>
                            {uploading && (
                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                </div>
                            )}
                            <div className="absolute -bottom-2 inset-x-0 text-center">
                                <span className="bg-slate-800 text-[9px] font-bold text-slate-300 px-2 py-0.5 rounded-full uppercase tracking-widest pointer-events-none">
                                    {uploading ? 'Enviando...' : 'Foto'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome Completo *</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Ex: João Silva"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Telefone / WhatsApp *</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="tel"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Ex: 11999999999"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email (Opcional)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="email"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Ex: joao@email.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Observações (Opcional)</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <textarea
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px]"
                                placeholder="Ex: Prefere corte na tesoura..."
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all border border-slate-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className={`flex-1 px-4 py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 ${loading || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Cadastrar</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
