'use client';
import { ArrowLeft, Moon, Globe, Bell, Lock } from 'lucide-react';
import Link from 'next/link';

export default function PreferencesPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white font-sans">
            <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-8">

                {/* Header */}
                <header className="flex items-center gap-4 mb-2">
                    <Link href="/perfil" className="p-2.5 -ml-2 bg-slate-900/50 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all group">
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tighter sm:text-2xl">
                            Preferências
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Minhas Configurações</p>
                    </div>
                </header>

                <div className="space-y-6">

                    {/* General Section */}
                    <div className="space-y-3">
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Aparência</h2>

                        <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800/50 backdrop-blur-sm flex items-center justify-between group hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                                    <Moon className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-bold text-white text-sm">Modo Escuro</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">O NEXT usa tema escuro por padrão</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                                Ativo
                            </span>
                        </div>

                        <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800/50 backdrop-blur-sm flex items-center justify-between group hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-bold text-white text-sm">Idioma</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Português (Brasil)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shortcuts to real settings */}
                    <div className="space-y-3">
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Atalhos</h2>

                        <Link href="/perfil/seguranca" className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800/50 backdrop-blur-sm flex items-center justify-between group hover:border-primary/40 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-bold text-white text-sm">Segurança</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Senha e autenticação em 2 fatores</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Abrir</span>
                        </Link>

                        <Link href="/perfil" className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800/50 backdrop-blur-sm flex items-center justify-between group hover:border-primary/40 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-bold text-white text-sm">Notificações</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Lembretes de agendamento no app</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Abrir</span>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
