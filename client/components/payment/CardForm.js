'use client';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { CreditCard, Lock } from 'lucide-react';
import api from '../../lib/clientApi';

export default function CardForm({ publicKey: initialKey, amount, onSubmit, onCancel, barbershopId, forceSave }) {
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

    const customization = useMemo(() => ({
        paymentMethods: {
            minInstallments: 1,
            maxInstallments: forceSave ? 1 : 12,
        },
        visual: {
            style: {
                theme: 'dark',
                customVariables: {
                    baseColor: '#007AFF', // Solid Blue like screenshot
                    formBackgroundColor: 'transparent', 
                    textColor: '#ffffff',
                    inputBackgroundColor: '#1C1C1E', // Dark gray inputs
                    inputTextColor: '#ffffff',
                    inputBorderColor: '#2C2C2E',
                    inputFocusedBorderColor: '#007AFF',
                    labelTextColor: '#A1A1AA',
                }
            },
            texts: {
                formSubmit: 'Cadastrar',
                payButton: 'Cadastrar',
                paymentButton: 'Cadastrar'
            }
        }
    }), [forceSave]);

    const initialization = useMemo(() => ({
        amount: forceSave ? 0.01 : (Number(amount) || 100),
    }), [amount, forceSave]);

    if (!publicKey) {
        return <div className="p-4 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
    }

    const handleSubmit = async (formData) => {
        try {
            console.log('[CardForm] Submitting:', formData);
            await onSubmit({ ...formData, saveCard });
        } catch (error) {
            console.error('[CardForm] Submission error:', error);
            throw error;
        }
    };

    return (
        <div className="w-full max-w-full mx-auto animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col justify-center">
                {!ready ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-5">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/20"></div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black animate-pulse">Carregando ambiente seguro...</p>
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-500 relative">
                        {/* Key fix for duplication in modals */}
                        <CardPayment
                            key={publicKey}
                            initialization={initialization}
                            customization={customization}
                            onSubmit={handleSubmit}
                            onReady={() => console.log('[MP] Brick Ready')}
                            onError={(error) => {
                                console.error('[MP] Brick Error:', error);
                                toast.error('Erro ao carregar formulário de pagamento.');
                            }}
                        />
                        
                        {/* Save Card Checkbox (Hidden if forced) */}
                        {!forceSave && (
                            <div 
                                onClick={() => setSaveCard(!saveCard)}
                                className={`mt-6 p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all duration-300 ${saveCard ? 'bg-blue-500/5 border-blue-500/30 text-white' : 'bg-[#1C1C1E] border-transparent text-slate-500'}`}
                            >
                                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${saveCard ? 'bg-blue-500 border-blue-500 shadow-[0_0_15px_rgba(0,122,255,0.4)]' : 'bg-slate-700 border-slate-600'}`}>
                                    {saveCard && <span className="text-white text-[10px] font-black">✓</span>}
                                </div>
                                <span className="text-[10px] font-black uppercase select-none tracking-widest leading-none">
                                    Salvar para uso futuro
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
