'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Settings, Save, MapPin, Phone, Hash } from 'lucide-react';

export default function SettingsPage() {
    const [barbershop, setBarbershop] = useState({ name: '', slug: '', address: '', phone: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchBarbershop();
    }, []);

    const fetchBarbershop = async () => {
        try {
            // Priority: Fetch from /me route using token
            try {
                const res = await api.get('/barbershops/me');
                setBarbershop(res.data);
                setLoading(false);
                return; // Success
            } catch (meError) {
                console.warn('Failed to fetch via /me, checking fallback...', meError);
            }

            // Fallback: Use local storage (Legacy)
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // Try explicit slug
            const slug = user.barbershop?.slug || user.ownedBarbershops?.[0]?.slug;
            if (slug) {
                const res = await api.get(`/barbershops/${slug}`);
                setBarbershop(res.data);
                setLoading(false);
                return;
            }

            setMessage({ type: 'error', text: 'Barbearia não encontrada. Faça login novamente.' });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
            setMessage({ type: 'error', text: 'Erro ao carregar dados da barbearia.' });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Client-side validation for Slug
        if (!barbershop.slug || barbershop.slug.trim().length === 0) {
            setMessage({ type: 'error', text: 'O Link (Slug) não pode ficar vazio.' });
            return;
        }

        setSaving(true);
        setMessage(null);
        try {
            await api.put(`/barbershops/${barbershop.id}`, barbershop);

            // Update local storage user object with new barbershop info if needed
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.barbershop) user.barbershop = { ...user.barbershop, ...barbershop };
                if (user.ownedBarbershops?.[0]) user.ownedBarbershops[0] = { ...user.ownedBarbershops[0], ...barbershop };
                localStorage.setItem('user', JSON.stringify(user));
            }

            setMessage({ type: 'success', text: 'Configurações atualizadas com sucesso! Recarregando...' });
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao salvar configurações' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-black uppercase text-xs">Carregando configurações...</div>;

    return (
        <>
            {message && (
                <div className={`p-4 mb-6 rounded-2xl text-sm font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="bg-[#111827] p-8 md:p-12 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                            Nome Comercial
                        </label>
                        <input
                            value={barbershop.name}
                            onChange={e => setBarbershop({ ...barbershop, name: e.target.value })}
                            className="w-full p-5 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 ring-emerald-500 outline-none transition font-bold text-lg text-white"
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                            Link Personalizado (Slug)
                        </label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 font-mono text-sm">/agendamento/</span>
                            <input
                                value={barbershop.slug}
                                onChange={e => setBarbershop({ ...barbershop, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                className="w-full p-5 pl-32 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 ring-emerald-500 outline-none transition font-mono text-sm text-emerald-500"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                            Endereço Físico
                        </label>
                        <input
                            value={barbershop.address}
                            onChange={e => setBarbershop({ ...barbershop, address: e.target.value })}
                            className="w-full p-5 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 ring-emerald-500 outline-none transition font-bold text-white placeholder:text-slate-700"
                            placeholder="Rua, Número, Bairro..."
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                            WhatsApp / Contato
                        </label>
                        <input
                            value={barbershop.phone}
                            onChange={e => setBarbershop({ ...barbershop, phone: e.target.value })}
                            className="w-full p-5 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 ring-emerald-500 outline-none transition font-bold text-white placeholder:text-slate-700"
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                </div>

                {/* IMAGES SETTINGS */}
                <div className="pt-10 border-t border-slate-800 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight text-white">Identidade Visual</h2>
                            <p className="text-slate-500 text-xs font-medium">Personalize a logo e fotos do seu estabelecimento.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* LOGO */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                                Logo da Barbearia
                            </label>
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 group hover:border-emerald-500/50 transition">
                                <div className="w-32 h-32 bg-[#111] rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-800 relative">
                                    {barbershop.logoUrl ? (
                                        <img src={barbershop.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-black text-slate-700 uppercase">{barbershop.name?.[0]}</span>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                if (file.size > 4000000) return alert('A imagem deve ter no máximo 4MB');
                                                const reader = new FileReader();
                                                reader.onloadend = () => setBarbershop({ ...barbershop, logoUrl: reader.result });
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide group-hover:text-emerald-500 transition">Clique para alterar (Max 4MB)</p>
                            </div>
                        </div>

                        {/* BANNERS */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                                Fotos do Espaço ({barbershop.bannerUrls?.length || 0}/3)
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {(barbershop.bannerUrls || []).map((url, idx) => (
                                    <div key={idx} className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden group border border-slate-800">
                                        <img src={url} alt={`Banner ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newBanners = barbershop.bannerUrls.filter((_, i) => i !== idx);
                                                setBarbershop({ ...barbershop, bannerUrls: newBanners });
                                            }}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs uppercase transition"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                ))}
                                {(barbershop.bannerUrls?.length || 0) < 3 && (
                                    <div className="relative aspect-video bg-slate-950 border border-dashed border-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:border-emerald-500/50 transition cursor-pointer">
                                        <span className="text-2xl text-slate-600">+</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    if (file.size > 4000000) return alert('A imagem deve ter no máximo 4MB');
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const newBanners = [...(barbershop.bannerUrls || []), reader.result];
                                                        setBarbershop({ ...barbershop, bannerUrls: newBanners });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <span className="absolute bottom-2 text-[8px] text-slate-500 uppercase font-bold tracking-widest">Add Banner (16:9)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>



                {/* NO-SHOW SETTINGS */}
                <div className="pt-10 border-t border-slate-800 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-500/10 text-red-500 rounded-xl">
                            <Hash className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight text-white">Política de No-Show</h2>
                            <p className="text-slate-500 text-xs font-medium">Configure a taxa automática para clientes que faltam sem avisar.</p>
                        </div>
                    </div>

                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-white uppercase tracking-wide">Habilitar Taxa de No-Show</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={barbershop.noShowEnabled || false}
                                    onChange={e => setBarbershop({ ...barbershop, noShowEnabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>

                        {barbershop.noShowEnabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                                        Porcentagem da Taxa (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={barbershop.noShowPercent || 0}
                                        onChange={e => setBarbershop({ ...barbershop, noShowPercent: parseFloat(e.target.value) })}
                                        className="w-full p-5 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 ring-emerald-500 outline-none transition font-bold text-white"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                                        Mensagem Explicativa (Opcional)
                                    </label>
                                    <input
                                        value={barbershop.noShowText || ''}
                                        onChange={e => setBarbershop({ ...barbershop, noShowText: e.target.value })}
                                        className="w-full p-5 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 ring-emerald-500 outline-none transition font-bold text-white text-sm"
                                        placeholder="Ex: Taxa referente ao não comparecimento anterior."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 bg-emerald-500 text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                    >
                        {saving ? 'SALVANDO...' : <><Save className="w-4 h-4" /> SALVAR CONFIGURAÇÕES</>}
                    </button>
                </div>
            </form >

            <div className="bg-[#111827] border border-emerald-500/10 rounded-3xl p-8 space-y-4 mt-8">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ring-1 ring-emerald-500/20 w-fit px-2 py-0.5 rounded">Nota Importante ⚠️</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed italic uppercase tracking-tighter">
                    Ao alterar o **Link Personalizado**, o acesso antigo deixará de funcionar imediatamente. Lembre-se de atualizar o link na biografia do seu Instagram e demais redes sociais.
                </p>
            </div>
        </>
    );
}
