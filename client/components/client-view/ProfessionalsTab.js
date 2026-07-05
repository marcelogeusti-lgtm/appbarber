'use client';

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
                <div key={pro.id} className="bg-[#111] p-4 rounded-xl border border-white/5 flex items-center gap-4 hover:border-primary/50 transition-all">
                    <div className="w-16 h-16 rounded-xl bg-[#1e293b] flex items-center justify-center font-black text-2xl text-white border border-white/5 uppercase overflow-hidden shrink-0">
                        {pro.avatarUrl ? (
                            <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover" />
                        ) : (
                            pro.name.charAt(0)
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-white text-base uppercase tracking-tight">{pro.name}</h3>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{pro.professionalProfile?.position || 'Barbeiro'}</p>
                        {pro.professionalProfile?.bio && (
                            <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{pro.professionalProfile.bio}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
