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
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            if (!bId) {
                setMessage({ type: 'error', text: 'Barbearia não encontrada no seu perfil.' });
                setLoading(false);
                return;
            }

            // We need a way to get by ID, but for now let's use the slug from user object to fetch full data
            const slug = user.barbershop?.slug || user.ownedBarbershops?.[0]?.slug;
            const res = await api.get(`/barbershops/${slug}`);
            setBarbershop(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
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
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="bg-[#111827] p-8 rounded-3xl border border-slate-800 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                    <Settings className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Ajustes da Unidade</h1>
                    <p className="text-slate-500 text-sm font-medium italic">Personalize a identidade da sua barbearia na plataforma.</p>
                </div>
            </header>

            {message && (
                <div className={`p-4 rounded-2xl text-sm font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="bg-[#111827] p-8 md:p-12 rounded-[3rem] border border-slate-800 shadow-sm space-y-10">
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

                <div className="pt-6 border-t border-slate-800 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 bg-emerald-500 text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                    >
                        {saving ? 'SALVANDO...' : <><Save className="w-4 h-4" /> SALVAR CONFIGURAÇÕES</>}
                    </button>
                </div>
            </form>

            <div className="bg-[#111827] border border-emerald-500/10 rounded-3xl p-8 space-y-4">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ring-1 ring-emerald-500/20 w-fit px-2 py-0.5 rounded">Nota Importante ⚠️</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed italic uppercase tracking-tighter">
                    Ao alterar o **Link Personalizado**, o acesso antigo deixará de funcionar imediatamente. Lembre-se de atualizar o link na biografia do seu Instagram e demais redes sociais.
                </p>
            </div>
        </div>
    );
}
