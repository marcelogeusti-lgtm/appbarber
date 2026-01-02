'use client';
import { Rocket } from 'lucide-react';

export default function UpdatesPage() {
    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-8 rounded-3xl border border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                        <Rocket className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Central de Evolução</h1>
                        <p className="text-slate-500 text-sm font-medium italic">Histórico de implementações e novos recursos</p>
                    </div>
                </div>
            </header>

            <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="text-center py-20 space-y-6 relative z-10">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                        <Rocket className="w-10 h-10 text-emerald-500 animate-bounce" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Plataforma em Dia</h3>
                        <p className="text-slate-500 mt-2 font-medium italic">Você está operando na versão <span className="text-emerald-500 font-black">v5.0 Diamond</span>.</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Rocket className="w-40 h-40 -rotate-12" />
                </div>
            </div>
        </div>
    );
}
