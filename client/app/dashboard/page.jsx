'use client';

export default function DashboardPageV4() {
    console.log('Dashboard V4 - Minimal Mode Loaded');

    return (
        <div className="p-10 text-center">
            <h1 className="text-4xl font-black text-white mb-4">Dashboard V4</h1>
            <p className="text-emerald-500 font-bold uppercase tracking-widest">
                Se você está vendo isso, o deploy funcionou!
            </p>
            <div className="mt-8 p-4 bg-slate-900 rounded-xl inline-block text-left text-xs font-mono text-slate-400">
                <p>Status: Operacional</p>
                <p>Versão: 4.0.0 (Clean)</p>
            </div>
        </div>
    );
}
