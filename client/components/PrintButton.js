'use client';
import { Printer } from 'lucide-react';

export default function PrintButton({ className = "" }) {
    return (
        <button
            onClick={() => window.print()}
            className={`flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest print:hidden ${className}`}
        >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
        </button>
    );
}
