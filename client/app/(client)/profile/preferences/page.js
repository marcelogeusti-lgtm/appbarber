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

    // Fiscal States
    const [requiresNfe, setRequiresNfe] = useState(false);
    const [cpf, setCpf] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [type, setType] = useState('PF'); // PF or PJ

    useEffect(() => {
        if (user) {
            setRequiresNfe(user.requiresNfe || false);
            setCpf(user.cpf || '');
            setCnpj(user.cnpj || '');
            if (user.cnpj) setType('PJ');
        }
    }, [user]);

    const handleSave = async () => {
        try {
            setSaving(true);
            setSaveStatus(null);
            
            await clientApi.patch('/clients/profile', {
                requiresNfe,
                cpf: type === 'PF' ? cpf : null,
                cnpj: type === 'PJ' ? cnpj : null
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
                        <Link href="/profile" className="p-2.5 -ml-2 bg-slate-900/50 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all group">
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

                    {/* Fiscal / NFe Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Configurações Fiscais</h2>
                            {requiresNfe && (
                                <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">Ativado</span>
                            )}
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800/50 backdrop-blur-xl space-y-6">
                            
                            {/* Toggle NFe */}
                            <div 
                                onClick={() => setRequiresNfe(!requiresNfe)}
                                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                    requiresNfe 
                                    ? 'bg-primary/5 border-primary/20 ring-4 ring-primary/5' 
                                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                        requiresNfe ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-slate-800 text-slate-500'
                                    }`}>
                                        <ScrollText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-xs uppercase tracking-tighter">Sempre solicitar Nota Fiscal</h3>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">A nota será emitida automaticamente no pós-atendimento</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative transition-all ${requiresNfe ? 'bg-primary' : 'bg-slate-700'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${requiresNfe ? 'left-6' : 'left-1 shadow-inner'}`} />
                                </div>
                            </div>

                            {/* Fiscal ID Inputs */}
                            {requiresNfe && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {/* Type Toggle */}
                                    <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-2xl">
                                        <button 
                                            onClick={() => setType('PF')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                type === 'PF' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                        >
                                            <User className="w-3.5 h-3.5" /> Pessoa Física
                                        </button>
                                        <button 
                                            onClick={() => setType('PJ')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                type === 'PJ' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                        >
                                            <Building className="w-3.5 h-3.5" /> Pessoa Jurídica
                                        </button>
                                    </div>

                                    {/* Input Field */}
                                    <div className="space-y-1.5 px-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                            {type === 'PF' ? 'CPF do Beneficiário' : 'CNPJ da Empresa'}
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder={type === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                                            value={type === 'PF' ? cpf : cnpj}
                                            onChange={(e) => type === 'PF' ? setCpf(e.target.value) : setCnpj(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                        <p className="text-[9px] text-slate-600 font-medium ml-1">Apenas números. Dados criptografados para sua segurança.</p>
                                    </div>
                                </div>
                            )}
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
