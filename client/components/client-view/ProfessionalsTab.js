'use client';
import { Star } from 'lucide-react';

export default function ProfessionalsTab({ professionals }) {
    if (!professionals || professionals.length === 0) {
        return (
            <div className="text-center py-10 opacity-50">
                <p className="text-sm font-bold uppercase tracking-widest">Nenhum profissional encontrado.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-24">
            {professionals.map(pro => (
                <div key={pro.id} className="bg-[#111] p-4 rounded-3xl border border-white/5 flex items-center gap-4 hover:border-emerald-500/50 transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-[#1e293b] flex items-center justify-center font-black text-2xl text-white border border-white/5 uppercase">
                        {pro.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base uppercase tracking-tight">{pro.name}</h3>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">{pro.professionalProfile?.position || 'Barbeiro'}</p>
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-[10px] text-slate-400 font-bold">5.0 (28 avaliações)</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
