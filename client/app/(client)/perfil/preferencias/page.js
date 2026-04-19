'use client';
import { useState, useEffect } from 'react';
import { 
    ArrowLeft, Moon, Globe, ScrollText, 
    Save, Loader2, Check, AlertCircle,
    User, Building
} from 'lucide-react';
import Link from 'next/link';
import { useClientAuth } from '../../../../contexts/ClientAuthContext';
import clientApi from '../../../../lib/clientApi';

export default function PreferencesPage() {
    const { user, refreshUser } = useClientAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error'

    useEffect(() => {
        if (user) {
            // No fiscal preferences here anymore
        }
    }, [user]);

    const handleSave = async () => {
        try {
            setSaving(true);
            setSaveStatus(null);
            
            await clientApi.patch('/clients/profile', {
                // No fiscal fields sent
            });
            
            await refreshUser();
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            console.error('Error saving preferences:', error);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white font-sans">
            <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-8">
                
                {/* Header */}
                <header className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <Link href="/perfil" className="p-2.5 -ml-2 bg-slate-900/50 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all group">
                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tighter sm:text-2xl">
                                Preferências
                            </h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Minhas Configurações</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all relative overflow-hidden ${
                            saveStatus === 'success' 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                            : saveStatus === 'error'
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                            : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
                        } disabled:opacity-50`}
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : saveStatus === 'success' ? (
                            <Check className="w-4 h-4" />
                        ) : saveStatus === 'error' ? (
                            <AlertCircle className="w-4 h-4" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saving ? 'Salvando...' : saveStatus === 'success' ? 'Salvo' : saveStatus === 'error' ? 'Erro' : 'Salvar'}
                    </button>
                </header>

                <div className="space-y-6">
                    
                    {/* General Section */}
                    <div className="space-y-3">
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Geral</h2>
                        
                        <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800/50 backdrop-blur-sm flex items-center justify-between group hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                    <Moon className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-bold text-white text-sm">Modo Escuro</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Tema escuro ativado</p>
                                </div>
                            </div>
                            <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer ring-4 ring-primary/10">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800/50 backdrop-blur-sm flex items-center justify-between group hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-bold text-white text-sm">Idioma</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Português (Brasil)</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest cursor-pointer hover:underline underline-offset-4">Alterar</span>
                        </div>
                    </div>

                </div>

                {/* Footer Info */}
                <div className="pt-8 border-t border-slate-900 flex flex-col items-center gap-4 text-center">
                    <AlertCircle className="w-5 h-5 text-slate-700" />
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest max-w-[280px]">
                        Lembre-se de salvar suas alterações antes de sair desta página.
                    </p>
                </div>

            </div>
        </div>
    );
}
