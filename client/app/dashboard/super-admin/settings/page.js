'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SuperAdminSettingsPage() {
    const [settings, setSettings] = useState({
        WHATSAPP_API_URL: '',
        WHATSAPP_API_TOKEN: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            // This requires the user to be a MASTER/OWNER
            const res = await api.get('/master/settings');
            setSettings(prev => ({ ...prev, ...res.data }));
        } catch (error) {
            console.error('Failed to load settings:', error);
            toast.error('Erro ao carregar configurações da plataforma.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.post('/master/settings', settings);
            toast.success('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Erro ao salvar configurações.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Carregando configurações...</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Configurações Globais</h1>
                <p className="text-gray-500 mt-2">
                    Gerencie variáveis de ambiente e integrações de toda a plataforma SaaS.
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Motor do WhatsApp (Evolution API)</h2>
                        <p className="text-sm text-gray-500">Configuração do servidor de disparo em massa.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            URL do Servidor
                        </label>
                        <input
                            type="text"
                            placeholder="ex: https://api.seudominio.com.br"
                            value={settings.WHATSAPP_API_URL || ''}
                            onChange={(e) => setSettings({ ...settings, WHATSAPP_API_URL: e.target.value })}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Se deixado em branco, o sistema entrará no Modo de Simulação.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Global API Token
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••••••••••"
                            value={settings.WHATSAPP_API_TOKEN || ''}
                            onChange={(e) => setSettings({ ...settings, WHATSAPP_API_TOKEN: e.target.value })}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            A chave mestre (Global API Key) configurada na sua VPS.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {saving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
            </div>
        </div>
    );
}
