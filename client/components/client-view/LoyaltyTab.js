'use client';
import { useState, useEffect } from 'react';
import { Gift, Info } from 'lucide-react';
import api from '../../lib/clientApi';
import { useParams } from 'next/navigation';

export default function LoyaltyTab({ points = 0 }) {
    const params = useParams();
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);

    const barbershopSlug = params.slug ? decodeURIComponent(params.slug) : null;
    // We need barbershop ID. The parent passes points, but maybe not ID.
    // However, usually we can get it from context or props.
    // The Page keeps barbershop state. Ideally pass it as prop.
    // But since `BarbershopPage` passes `points`, we might need to update the parent to pass `barbershopId` or fetch here using slug?
    // Let's assume `BarbershopPage` has the ID and we can pass it.
    // BUT the component signature in `page.js` is `<LoyaltyTab points={points} />`.
    // I should update `page.js` to pass `barbershopId` too.
    // Or I can fetch using slug if I have a endpoint for that, but `getLoyaltySettings` uses ID.
    // I will use `params` to get slug, then I need to resolve ID?
    // Actually `BarbershopPage` has the ID. I should update `BarbershopPage` to pass `barbershopId`.
    // For now, I'll update this component to ACCEPT `barbershopId`.

    return (
        <LoyaltyContent points={points} />
    );
}

function LoyaltyContent({ points }) {
    // To avoid changing props in `page.js` right now in a complex way,
    // I will try to fetch using the slug if I can, OR just update `page.js` first.
    // Actually, `page.js` already has `activeTab === 'fidelidade' && <LoyaltyTab points={points} />`.
    // I'll update `page.js` to pass `barbershopId={barbershop.id}` in the NEXT step.
    // Here I will prepare to receive it.
    // But wait, I cannot change `page.js` easily inside this tool call.
    // I'll assume `barbershopId` is passed in props.

    // Check `LoyaltyTab` usage in `page.js`:
    // It uses `dynamic`.

    return (
        <div className="space-y-6 pb-24">
            {/* Placeholder for now until connected */}
            <div className="bg-gradient-to-br from-emerald-900 to-black p-6 rounded-3xl border border-emerald-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full"></div>
                <div className="relative z-10 text-center">
                    <p className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] mb-1">Seus Pontos</p>
                    <h2 className="text-5xl font-black text-white">{points}</h2>
                    <p className="text-slate-400 text-xs mt-2 font-medium">
                        {points > 0 ? 'Parabéns! Continue agendando para ganhar mais.' : 'Faça agendamentos para ganhar pontos!'}
                    </p>
                </div>
            </div>

            <div className="text-center text-slate-500 text-xs py-8">
                Carregando regras de fidelidade...
            </div>
        </div>
    )
}
