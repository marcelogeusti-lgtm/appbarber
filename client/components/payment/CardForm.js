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
                    baseColor: '#10B981', // Verde Esmeralda (Corte Conexão)
                    formBackgroundColor: '#0f172a', // Slate-900 (Combinando com o fundo do app)
                    textColor: '#ffffff',
                    inputBackgroundColor: '#1e293b', // Slate-800
                    inputTextColor: '#ffffff',
                    inputBorderColor: '#334155',
                    inputFocusedBorderColor: '#10B981',
                    labelTextColor: '#94a3b8',
                }
            },
            texts: {
                paymentButton: forceSave ? 'Salvar Cartão com Segurança' : 'Pagar Agora'
            }
        }
    }), [forceSave]);

    const initialization = useMemo(() => ({
        amount: Number(amount) || 100, // MP requires a valid amount even for saving for verification
    }), [amount]);

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
        <div className="card-cartao w-full max-w-full sm:max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 px-2 sm:px-0">
            <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                {/* Premium Card Header Mockup */}
                <div className="relative h-40 bg-gradient-to-br from-emerald-600/20 to-slate-900 overflow-hidden border-b border-white/5">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="absolute top-6 left-8 z-10">
                        <div className="w-12 h-12 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 backdrop-blur-xl">
                            <CreditCard className="w-6 h-6 text-emerald-500" />
                        </div>
                    </div>
                    <div className="absolute bottom-6 left-8 z-10">
                        <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-[0.3em] mb-1">Cofre de Pagamentos</p>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                            {forceSave ? 'Cartão para Assinatura' : 'Checkout Seguro'}
                        </h2>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="p-4 sm:p-8 min-h-[300px] flex flex-col justify-center">
                    {!ready ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-5">
                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-emerald-500/20"></div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black animate-pulse">Iniciando ambiente seguro...</p>
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
                                    className={`mt-6 mx-1 p-4 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all duration-300 ${saveCard ? 'bg-emerald-500/5 border-emerald-500/30 text-white' : 'bg-slate-800/20 border-slate-700/50 text-slate-500'}`}
                                >
                                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${saveCard ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-700 border-slate-600'}`}>
                                        {saveCard && <span className="text-white text-[10px] font-black">✓</span>}
                                    </div>
                                    <span className="text-[10px] font-black uppercase select-none tracking-widest leading-none">
                                        Salvar para uso futuro
                                    </span>
                                </div>
                            )}

                            {/* Trust Badge (Simplified for Vault) */}
                            <div className="mt-8 flex items-center justify-center gap-2 opacity-30 border-t border-white/5 pt-6">
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">{forceSave ? 'Proteção de Dados Nível PCI' : 'Segurança Level 1 PCI-DSS'}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-5" />
                    <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" className="h-5" />
                    <img src="https://img.icons8.com/color/48/000000/amex.png" alt="Amex" className="h-5" />
                    <img src="https://img.icons8.com/color/48/000000/elo.png" alt="Elo" className="h-5" />
                </div>
                
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="group flex items-center gap-2 text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.2em] transition-all"
                    >
                        <span className="opacity-0 group-hover:opacity-100 transition-all">←</span>
                        Voltar e Cancelar
                    </button>
                )}
            </div>
        </div>
    );
}
