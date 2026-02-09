'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Copy, CheckCircle, AlertCircle, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import api from '../../lib/clientApi'; // Adjust path if needed

export default function CheckoutPixPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');

    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    // Polling Logic
    useEffect(() => {
        if (!id) {
            setError('ID do pagamento não fornecido');
            setLoading(false);
            return;
        }

        let isMounted = true;
        const fetchPayment = async () => {
            try {
                const res = await api.get(`/payments/${id}`);
                if (isMounted) {
                    setPayment(res.data);
                    setLoading(false);

                    // Stop polling if paid or failed
                    if (res.data.status === 'paid' || res.data.status === 'PAID' || res.data.status === 'CONFIRMED') {
                        return true; // Stop
                    }
                }
            } catch (err) {
                console.error("Error fetching payment:", err);
                if (isMounted) setError('Erro ao carregar pagamento. Tente recarregar.');
            }
            return false; // Continue
        };

        // Initial fetch
        fetchPayment();

        // Interval
        const intervalId = setInterval(async () => {
            const shouldStop = await fetchPayment();
            if (shouldStop) clearInterval(intervalId);
        }, 5000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [id]);

    const handleCopy = () => {
        if (payment?.pixCopiaECola || payment?.qrCode) {
            navigator.clipboard.writeText(payment.pixCopiaECola || payment.qrCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatCurrency = (val) => {
        return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <p className="text-slate-600 font-medium">{error}</p>
                <button onClick={() => window.location.reload()} className="text-violet-600 hover:underline font-bold">Tentar Novamente</button>
            </div>
        </div>
    );

    const isPaid = payment?.status === 'paid' || payment?.status === 'PAID' || payment?.status === 'CONFIRMED';

    // Fallback for barbershop name if not in payment include
    const shopName = payment?.barbershop?.name || "Pagamento Seguro";

    return (
        <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4 font-sans text-slate-900">
            {/* Velfy/PixOne Header Style */}
            <div className="mb-8 text-center">
                {/* Simulate Gateway Logo or Barbershop Logo */}
                {payment?.barbershop?.logoUrl ? (
                    <img src={payment.barbershop.logoUrl} alt={shopName} className="h-16 w-16 rounded-full mx-auto shadow-sm object-cover mb-2" />
                ) : (
                    <div className="h-12 flex items-center justify-center mb-2">
                        <span className="font-black text-2xl text-violet-800 tracking-tight">V</span>
                        <span className="font-bold text-2xl text-slate-700">ELFY</span>
                    </div>
                )}
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{shopName}</p>
            </div>

            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                {/* Header Strip */}
                <div className={`h-2 w-full ${isPaid ? 'bg-emerald-500' : 'bg-violet-600'}`}></div>

                <div className="p-8 space-y-8">
                    {/* Amount Display */}
                    <div className="text-center space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor a Pagar</p>
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">{formatCurrency(payment.amount)}</h1>
                    </div>

                    {isPaid ? (
                        <div className="py-8 text-center space-y-6 animate-in zoom-in duration-300">
                            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Pagamento Confirmado!</h2>
                                <p className="text-slate-500 text-sm mt-2">Seu agendamento foi garantido com sucesso.</p>
                            </div>
                            <button
                                onClick={() => router.push('/home')}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-500/20"
                            >
                                Voltar para o App
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* QR Code Area */}
                            <div className="flex flex-col items-center space-y-4">
                                <div className="p-4 bg-white border-4 border-slate-100 rounded-2xl shadow-inner">
                                    {payment.qrCodeBase64 ? (
                                        <img
                                            src={`data:image/png;base64,${payment.qrCodeBase64}`}
                                            alt="QR Code Pix"
                                            className="w-48 h-48 object-contain mix-blend-multiply"
                                        />
                                    ) : (
                                        <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-400 text-xs text-center p-4">
                                            QR Code Indisponível (Use Copia e Cola)
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 font-medium animate-pulse">Aguardando pagamento...</p>
                            </div>

                            {/* Copy Paste Area */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase block pl-1">Pix Copia e Cola</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={payment.pixCopiaECola || payment.qrCode || ''}
                                        className="flex-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs p-3 rounded-xl focus:outline-none font-mono truncate"
                                    />
                                    <button
                                        onClick={handleCopy}
                                        className={`p-3 rounded-xl transition flex items-center justify-center shrink-0 border ${copied ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-violet-600 hover:bg-slate-50'}`}
                                    >
                                        {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Expiry / Info */}
                            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
                                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-blue-800 uppercase">Ambiente Seguro</p>
                                    <p className="text-[10px] text-blue-600 leading-relaxed">
                                        Ao pagar, você receberá a confirmação automática nesta tela.
                                        Se houver algum problema, o valor será estornado.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Strip */}
                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                    <button onClick={() => router.back()} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2 mx-auto transition">
                        <ArrowLeft className="w-3 h-3" />
                        Cancelar e Voltar
                    </button>
                </div>
            </div>

            <div className="mt-8 text-center opacity-40 hover:opacity-100 transition">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Powered by PixOne & Velfy</p>
            </div>
        </div>
    );
}
