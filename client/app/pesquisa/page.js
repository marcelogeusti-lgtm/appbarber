'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function SurveyForm() {
    const params = useSearchParams();
    const barbershopId = params.get('b');
    const [score, setScore] = useState(null);
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);

    const submit = async () => {
        if (score === null) return;
        setSending(true);
        try {
            await fetch('/api/surveys/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barbershopId, score, clientName: name || null, comment: comment || null })
            });
            setSent(true);
        } catch (e) { alert('Não foi possível enviar. Tente novamente.'); }
        finally { setSending(false); }
    };

    if (!barbershopId) {
        return <div className="min-h-screen flex items-center justify-center text-gray-400">Link inválido.</div>;
    }

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-neutral-950 to-neutral-900">
                <div className="text-center max-w-sm">
                    <div className="text-6xl mb-4">🙏</div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">Obrigado!</h1>
                    <p className="text-neutral-400 mt-2">Sua opinião ajuda a gente a melhorar cada vez mais.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-neutral-950 to-neutral-900">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
                <h1 className="text-xl font-black text-white uppercase tracking-tight text-center">Como foi seu atendimento?</h1>
                <p className="text-neutral-400 text-sm text-center mt-2 mb-6">De 0 a 10, o quanto você recomendaria nossa barbearia a um amigo?</p>

                <div className="grid grid-cols-6 gap-2 mb-6">
                    {Array.from({ length: 11 }).map((_, n) => (
                        <button key={n} onClick={() => setScore(n)}
                            className={`aspect-square rounded-xl font-black text-sm transition-all ${score === n ? 'bg-amber-400 text-black scale-110' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}`}>
                            {n}
                        </button>
                    ))}
                </div>

                <input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome (opcional)"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white outline-none mb-3 placeholder:text-neutral-500" />
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Quer deixar um comentário? (opcional)"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white outline-none mb-5 resize-none placeholder:text-neutral-500" />

                <button onClick={submit} disabled={score === null || sending}
                    className="w-full py-4 rounded-xl bg-amber-400 text-black font-black text-xs uppercase tracking-widest disabled:opacity-40 transition-all active:scale-95">
                    {sending ? 'Enviando...' : 'Enviar avaliação'}
                </button>
            </div>
        </div>
    );
}

export default function PesquisaPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
            <SurveyForm />
        </Suspense>
    );
}
