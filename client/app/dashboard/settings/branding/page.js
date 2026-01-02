'use client';
import { useEffect, useState } from 'react';
import api from '../../../../lib/api';
import { Palette, Upload, Save, Eye, Sparkles } from 'lucide-react';

export default function BrandingSettingsPage() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [barbershopId, setBarbershopId] = useState('');

    const [formData, setFormData] = useState({
        logoUrl: '',
        primaryColor: '#f97316',
        secondaryColor: '#1f2937',
        accentColor: '#10b981'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;
            setBarbershopId(bId);

            if (bId) {
                const res = await api.get(`/settings?barbershopId=${bId}`);
                setSettings(res.data);
                setFormData({
                    logoUrl: res.data.logoUrl || '',
                    primaryColor: res.data.primaryColor || '#f97316',
                    secondaryColor: res.data.secondaryColor || '#1f2937',
                    accentColor: res.data.accentColor || '#10b981'
                });
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/settings/${barbershopId}`, formData);
            alert('Configurações salvas com sucesso!');
            fetchSettings();
        } catch (err) {
            alert('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-black uppercase text-xs">Carregando configurações...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-8 rounded-3xl border border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
                        <Palette className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Identidade Visual</h1>
                        <p className="text-slate-500 text-sm font-medium italic">Personalize as cores e logo da sua barbearia</p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Logo Upload */}
                <div className="bg-[#111827] p-8 rounded-3xl border border-slate-800 shadow-lg">
                    <h3 className="text-white font-bold uppercase tracking-wide mb-6 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-purple-500" /> Logo da Barbearia
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">URL da Logo</label>
                            <input
                                type="url"
                                value={formData.logoUrl}
                                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:ring-2 ring-purple-500 outline-none"
                                placeholder="https://exemplo.com/logo.png"
                            />
                            <p className="text-xs text-slate-600 italic">Cole a URL da sua logo hospedada online</p>
                        </div>
                        {formData.logoUrl && (
                            <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center justify-center">
                                <img src={formData.logoUrl} alt="Preview Logo" className="max-h-32 object-contain" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Color Palette */}
                <div className="bg-[#111827] p-8 rounded-3xl border border-slate-800 shadow-lg">
                    <h3 className="text-white font-bold uppercase tracking-wide mb-6 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-500" /> Paleta de Cores
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Primary Color */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cor Primária</label>
                            <div className="relative">
                                <input
                                    type="color"
                                    value={formData.primaryColor}
                                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div
                                    className="w-full h-24 rounded-2xl border-4 border-slate-800 shadow-lg cursor-pointer transition-transform hover:scale-105"
                                    style={{ backgroundColor: formData.primaryColor }}
                                ></div>
                            </div>
                            <input
                                type="text"
                                value={formData.primaryColor}
                                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm text-center uppercase"
                            />
                            <p className="text-xs text-slate-600 italic">Usada em botões e destaques principais</p>
                        </div>

                        {/* Secondary Color */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cor Secundária</label>
                            <div className="relative">
                                <input
                                    type="color"
                                    value={formData.secondaryColor}
                                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div
                                    className="w-full h-24 rounded-2xl border-4 border-slate-800 shadow-lg cursor-pointer transition-transform hover:scale-105"
                                    style={{ backgroundColor: formData.secondaryColor }}
                                ></div>
                            </div>
                            <input
                                type="text"
                                value={formData.secondaryColor}
                                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm text-center uppercase"
                            />
                            <p className="text-xs text-slate-600 italic">Usada em fundos e elementos secundários</p>
                        </div>

                        {/* Accent Color */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cor de Destaque</label>
                            <div className="relative">
                                <input
                                    type="color"
                                    value={formData.accentColor}
                                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div
                                    className="w-full h-24 rounded-2xl border-4 border-slate-800 shadow-lg cursor-pointer transition-transform hover:scale-105"
                                    style={{ backgroundColor: formData.accentColor }}
                                ></div>
                            </div>
                            <input
                                type="text"
                                value={formData.accentColor}
                                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm text-center uppercase"
                            />
                            <p className="text-xs text-slate-600 italic">Usada em sucesso, confirmações e ícones</p>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-[#111827] p-8 rounded-3xl border border-slate-800 shadow-lg">
                    <h3 className="text-white font-bold uppercase tracking-wide mb-6 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-purple-500" /> Preview
                    </h3>
                    <div className="space-y-4">
                        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                            <div className="flex items-center gap-4 mb-4">
                                {formData.logoUrl && <img src={formData.logoUrl} alt="Logo" className="h-12 object-contain" />}
                                <h4 className="text-2xl font-black text-white">Sua Barbearia</h4>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    className="px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg"
                                    style={{ backgroundColor: formData.primaryColor }}
                                >
                                    Botão Primário
                                </button>
                                <button
                                    type="button"
                                    className="px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg"
                                    style={{ backgroundColor: formData.secondaryColor }}
                                >
                                    Botão Secundário
                                </button>
                                <button
                                    type="button"
                                    className="px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg"
                                    style={{ backgroundColor: formData.accentColor }}
                                >
                                    Botão Destaque
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-purple-500 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:bg-purple-600 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <>Salvando...</>
                        ) : (
                            <>
                                <Save className="w-5 h-5" /> Salvar Configurações
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
