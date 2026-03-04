'use client';
import { MapPin, Plus, Loader2, Home } from 'lucide-react';
import { useState } from 'react';

export default function AddressPage() {
    const [loading, setLoading] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-white tracking-tight">Endereço</h1>
                <p className="text-slate-500 text-sm font-medium">Gerencie seus endereços de entrega e atendimento.</p>
            </div>

            <div className="grid gap-4">
                <div className="bg-[#111] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                        <MapPin className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Nenhum endereço cadastrado</h3>
                        <p className="text-xs text-slate-500 mt-1">Adicione um endereço para facilitar seus agendamentos.</p>
                    </div>
                    <button className="mt-2 px-8 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all">
                        Adicionar Endereço
                    </button>
                </div>
            </div>
        </div>
    );
}
