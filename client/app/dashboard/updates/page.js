'use client';
import { Rocket } from 'lucide-react';

export default function UpdatesPage() {
    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-8 rounded-3xl border border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                        <Rocket className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Atualizações do Sistema</h1>
                        <p className="text-slate-500 text-sm font-medium italic">Novidades e melhorias da plataforma</p>
                    </div>
                </div>
            </header>

            <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800">
                <div className="text-center py-20 space-y-4">
                    <Rocket className="w-16 h-16 text-slate-700 mx-auto" />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Tudo Atualizado!</h3>
                    <p className="text-slate-500">Você está utilizando a versão mais recente do sistema.</p>
                </div>
            </div>
        </div>
    );
}
