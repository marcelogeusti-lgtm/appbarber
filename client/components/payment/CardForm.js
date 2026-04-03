'use client';
import { useEffect, useState } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import api from '../../lib/clientApi';

export default function CardForm({ publicKey: initialKey, amount, description, onSubmit, onCancel, barbershopId, forceSave }) {
    const [ready, setReady] = useState(false);
    const [publicKey, setPublicKey] = useState(initialKey);
    const [saveCard, setSaveCard] = useState(forceSave || false); // Default to true if forceSave

    useEffect(() => {
        if (!publicKey) {
            // If barbershopId is present, pass it. If not, pass empty (or nothing) to get Platform Key.
            const query = barbershopId ? `?barbershopId=${barbershopId}` : '';
            api.get(`/payments/public-key${query}`)
                .then(res => setPublicKey(res.data.publicKey))
                .catch(err => console.error("Failed to get public key", err));
        }
    }, [publicKey, barbershopId]);

    useEffect(() => {
        if (publicKey) {
            initMercadoPago(publicKey, { locale: 'pt-BR' });
            setReady(true);
        }
    }, [publicKey]);

    if (!publicKey) {
        return <div className="p-4 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
    }

    const customization = {
        paymentMethods: {
            minInstallments: 1,
            maxInstallments: 12, // Allow interest options if configured in MP
        },
        visual: {
            style: {
                theme: 'dark', // We are using a dark theme app
                customVariables: {
                    baseColor: '#10B981', // Emerald-500
                    formBackgroundColor: '#111827', // Slate-950
                    textColor: '#ffffff',
                    inputBackgroundColor: '#1e293b', // Slate-800
                    inputTextColor: '#ffffff',
                    inputBorderColor: '#334155',
                    inputFocusedBorderColor: '#10B981',
                    labelTextColor: '#94a3b8',
                }
            }
        }
    };

    const handleSubmit = async (formData) => {
        // formData contains token, paymentMethodId, issuerId, etc.
        try {
            console.log('MP Form Data:', formData);
            await onSubmit({ ...formData, saveCard }); // Pass saveCard preference
        } catch (error) {
            console.error('Payment Error:', error);
            throw error; // Required by MP Brick to remove loading state
        }
    };

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-slate-900/50 p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-widest">
                        <CreditCard className="w-4 h-4" />
                        Pagamento Seguro
                    </div>
                    <Lock className="w-3 h-3 text-slate-500" />
                </div>

                <div className="p-2 min-h-[300px] flex flex-col justify-center">
                    {!ready ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Iniciando ambiente seguro...</p>
                        </div>
                    ) : (
                        <>
                            <CardPayment
                                initialization={{ amount: Number(amount) }}
                                customization={customization}
                                onSubmit={handleSubmit}
                                onReady={() => console.log('Brick Ready')}
                                onError={(error) => console.error('Brick Error:', error)}
                            />
                            {/* Save Card Checkbox - ONLY show if NOT forced */}
                            {!forceSave && (
                                <div className="px-4 pb-4 pt-2 flex items-center gap-3">
                                    <div
                                        onClick={() => setSaveCard(!saveCard)}
                                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition ${saveCard ? 'bg-primary border-primary' : 'bg-slate-900 border-slate-700'}`}
                                    >
                                        {saveCard && <span className="text-white text-xs font-bold">✓</span>}
                                    </div>
                                    <span onClick={() => setSaveCard(!saveCard)} className="text-xs text-slate-400 cursor-pointer select-none">
                                        Salvar cartão para agilizar próximos agendamentos
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>

            <p className="text-center text-[10px] text-slate-600 mt-4 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Seus dados são processados com criptografia de ponta
            </p>

            {onCancel && (
                <button
                    onClick={onCancel}
                    className="w-full mt-4 py-3 text-xs font-bold text-slate-500 hover:text-white transition"
                >
                    Cancelar
                </button>
            )}
        </div>
    );
}
