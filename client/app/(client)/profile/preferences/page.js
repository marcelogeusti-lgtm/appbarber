'use client';
import { ArrowLeft, Moon, Globe } from 'lucide-react';
import Link from 'next/link';

export default function PreferencesPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans p-6">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/profile" className="p-2 -ml-2 hover:bg-slate-900 rounded-full transition">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </Link>
                <h1 className="text-xl font-black uppercase tracking-tight">Preferências</h1>
            </header>

            <div className="space-y-4">
                <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                            <Moon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Modo Escuro</h3>
                            <p className="text-[10px] text-slate-500 font-medium">Usar tema do sistema por padrão</p>
                        </div>
                    </div>
                    {/* Toggle Switch Mock */}
                    <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">Idioma</h3>
                            <p className="text-[10px] text-slate-500 font-medium">Português (Brasil)</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 hover:text-white cursor-pointer">Alterar</span>
                </div>
            </div>
        </div>
    );
}
