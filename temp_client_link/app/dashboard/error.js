'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('DASHBOARD_ERROR:', error);
    }, [error]);

    const handleClearCache = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#111827] text-white p-6 text-center">
            <h2 className="text-3xl font-black text-red-500 mb-4 uppercase tracking-widest">Algo deu errado!</h2>

            <div className="bg-slate-900 border border-red-500/20 p-6 rounded-2xl max-w-lg w-full mb-8 overflow-auto">
                <p className="font-mono text-xs text-red-300 break-words text-left">
                    {error.message || "Erro desconhecido"}
                </p>
                {error.digest && (
                    <p className="font-mono text-[10px] text-slate-500 mt-2 text-left">Digest: {error.digest}</p>
                )}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-600 transition"
                >
                    Tentar Novamente
                </button>
                <button
                    onClick={handleClearCache}
                    className="bg-slate-800 text-slate-400 px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-700 transition"
                >
                    Sair e Limpar Cache
                </button>
            </div>

            <p className="mt-8 text-xs text-slate-600">
                Se o erro persistir, tire um print desta tela e envie para o suporte.
            </p>
        </div>
    );
}
