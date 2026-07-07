'use client';
import { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, Lock } from 'lucide-react';
import api from '../../lib/clientApi';

/**
 * Formulário de cartão via Stripe Elements (equivalente ao CardForm do MP).
 * Fluxo: POST /payments/stripe/intent -> stripe.confirmCardPayment(clientSecret)
 * -> POST /payments/stripe/confirm (backend re-consulta a Stripe e libera).
 */
export default function StripeCardForm({ appointmentId, onSuccess, onCancel }) {
    const [phase, setPhase] = useState('init'); // init | ready | paying | error
    const [errorMsg, setErrorMsg] = useState(null);
    const [amount, setAmount] = useState(null);

    const stripeRef = useRef(null);
    const cardRef = useRef(null);
    const intentRef = useRef(null); // { paymentId, clientSecret }
    const mountEl = useRef(null);

    useEffect(() => {
        let cancelled = false;

        const setup = async () => {
            try {
                const res = await api.post('/payments/stripe/intent', { appointmentId });
                if (cancelled) return;
                intentRef.current = { paymentId: res.data.paymentId, clientSecret: res.data.clientSecret };
                setAmount(res.data.amount);

                const stripe = await loadStripe(res.data.publishableKey);
                if (cancelled || !stripe) return;
                stripeRef.current = stripe;

                const elements = stripe.elements();
                const card = elements.create('card', {
                    style: {
                        base: {
                            color: '#fff',
                            fontSize: '16px',
                            fontFamily: 'inherit',
                            '::placeholder': { color: '#64748b' }
                        },
                        invalid: { color: '#ef4444' }
                    }
                });
                card.mount(mountEl.current);
                cardRef.current = card;
                setPhase('ready');
            } catch (err) {
                console.error('[StripeCardForm] setup error:', err);
                setErrorMsg(err.response?.data?.error || 'Erro ao iniciar o pagamento.');
                setPhase('error');
            }
        };

        if (appointmentId) setup();
        return () => {
            cancelled = true;
            if (cardRef.current) cardRef.current.destroy();
        };
    }, [appointmentId]);

    const handlePay = async () => {
        if (!stripeRef.current || !cardRef.current || !intentRef.current) return;
        setPhase('paying');
        setErrorMsg(null);

        try {
            const { error, paymentIntent } = await stripeRef.current.confirmCardPayment(
                intentRef.current.clientSecret,
                { payment_method: { card: cardRef.current } }
            );

            if (error) {
                setErrorMsg(error.message || 'Pagamento recusado.');
                setPhase('ready');
                return;
            }

            // Backend valida na API da Stripe e confirma o agendamento
            const res = await api.post('/payments/stripe/confirm', { paymentId: intentRef.current.paymentId });
            if (res.data.status === 'paid') {
                onSuccess?.();
            } else {
                setErrorMsg(res.data.statusDetail || 'Pagamento não confirmado. Tente novamente.');
                setPhase('ready');
            }
        } catch (err) {
            console.error('[StripeCardForm] pay error:', err);
            setErrorMsg(err.response?.data?.error || 'Erro ao processar o pagamento.');
            setPhase('ready');
        }
    };

    return (
        <div className="space-y-5">
            {phase === 'init' && (
                <div className="flex items-center justify-center gap-3 py-10 text-slate-400 text-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" /> Preparando pagamento seguro...
                </div>
            )}

            <div className={phase === 'init' ? 'hidden' : ''}>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">
                    Dados do cartão
                </label>
                <div ref={mountEl} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4" />
            </div>

            {errorMsg && (
                <p className="text-xs text-red-500 font-bold">{errorMsg}</p>
            )}

            {phase !== 'init' && phase !== 'error' && (
                <div className="flex gap-3">
                    <button
                        onClick={handlePay}
                        disabled={phase === 'paying'}
                        className="flex-1 bg-primary text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {phase === 'paying' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        {phase === 'paying' ? 'Processando...' : `Pagar${amount ? ` ${Number(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : ''}`}
                    </button>
                    {onCancel && (
                        <button onClick={onCancel} className="px-6 py-4 rounded-xl font-black text-[10px] uppercase text-slate-500 hover:text-white transition">
                            Cancelar
                        </button>
                    )}
                </div>
            )}

            {phase === 'error' && onCancel && (
                <button onClick={onCancel} className="w-full py-4 rounded-xl font-black text-[10px] uppercase text-slate-500 hover:text-white transition border border-slate-800">
                    Voltar
                </button>
            )}

            <p className="text-[9px] text-slate-600 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                <Lock className="w-3 h-3" /> Processado com segurança pela Stripe
            </p>
        </div>
    );
}
