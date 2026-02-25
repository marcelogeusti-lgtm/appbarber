'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Copy, CheckCircle, AlertCircle, Loader2, ShieldCheck, ArrowLeft, Smartphone, Clock } from 'lucide-react';
import api from '../../lib/clientApi';

export default function CheckoutPixPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');

    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

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

                    if (res.data.status === 'paid' || res.data.status === 'PAID' || res.data.status === 'CONFIRMED') {
                        return true;
                    }
                }
            } catch (err) {
                console.error("Error fetching payment:", err);
                if (isMounted) setError('Erro ao carregar pagamento. Tente recarregar.');
            }
            return false;
        };

        fetchPayment();
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
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <p className="text-slate-400 font-medium">{error}</p>
                <button onClick={() => window.location.reload()} className="text-emerald-500 hover:underline font-bold">Tentar Novamente</button>
            </div>
        </div>
    );

    const isPaid = payment?.status === 'paid' || payment?.status === 'PAID' || payment?.status === 'CONFIRMED';
    const shopName = payment?.barbershop?.name || "Pagamento Seguro";
    const shopLogo = payment?.barbershop?.logoUrl || "https://content.pixone.com.br/logo.svg"; // Fallback to Velfy/PixOne generic

    // Velfy Dark Mode Colors: bg-black, text-white, accents emerald/green
    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col md:flex-row">

            {/* Left/Top Info Section (Mobile: Top, Desktop: Left) */}
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 bg-zinc-900/50">
                <div>
                    <button onClick={() => router.back()} className="text-sm font-medium text-slate-400 hover:text-white flex items-center gap-2 mb-8 transition">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                            <img src={shopLogo} alt={shopName} className="w-full h-full object-cover" onError={(e) => e.target.src = '/svg/logo.svg'} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">{shopName}</h2>
                            <p className="text-xs text-emerald-500 font-medium tracking-wide uppercase">Ambiente Seguro</p>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-sm">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Referência</p>
                            <p className="text-sm text-slate-300 font-medium">Agendamento #{payment.id.slice(0, 8)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Valor Total</p>
                            <p className="text-3xl text-white font-bold tracking-tight">{formatCurrency(payment.amount)}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 md:mt-0 hidden md:block">
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Processado por Velfy</p>
                </div>
            </div>

            {/* Right/Bottom Action Section (Payment) */}
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col items-center justify-center bg-black">
                <div className="w-full max-w-md space-y-8">

                    {isPaid ? (
                        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full mx-auto flex items-center justify-center ring-4 ring-emerald-500/10">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold text-white">Pagamento Confirmado!</h1>
                                <p className="text-slate-400">Seu horário foi reservado com sucesso.</p>
                            </div>
                            <button
                                onClick={() => router.push('/home')}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-emerald-900/20 transform hover:-translate-y-0.5"
                            >
                                Voltar para Início
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center space-y-2">
                                <h1 className="text-2xl font-bold text-white">Pagamento via Pix</h1>
                                <p className="text-sm text-slate-400">Escaneie o QR Code abaixo com seu celular</p>
                            </div>

                            {/* QR Code Card */}
                            <div className="bg-white p-4 rounded-2xl shadow-2xl mx-auto w-fit relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                <div className="relative bg-white p-2 rounded-xl">
                                    {payment.qrCodeBase64 ? (
                                        <img
                                            src={`data:image/png;base64,${payment.qrCodeBase64}`}
                                            alt="QR Code Pix"
                                            className="w-56 h-56 object-contain"
                                        />
                                    ) : (
                                        <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                                            Gerando QR Code...
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Expiry Timer Mock */}
                            <div className="flex justify-center items-center gap-2 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />
                                <span>Pague em até 15 minutos</span>
                            </div>

                            {/* Copia e Cola */}
                            <div className="space-y-4 pt-6 w-full animate-in slide-in-from-bottom-4 duration-700">
                                <button
                                    onClick={handleCopy}
                                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black uppercase tracking-widest transition-all duration-300 ${copied
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 transform hover:-translate-y-0.5'
                                        }`}
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Copiado com Sucesso!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-5 h-5" />
                                            Copiar Código Pix
                                        </>
                                    )}
                                </button>

                                <div className="relative">
                                    <input
                                        type="text"
                                        readOnly
                                        value={payment.pixCopiaECola || payment.qrCode || ''}
                                        onClick={handleCopy}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 text-slate-500 text-[10px] p-3 rounded-lg focus:outline-none cursor-pointer text-center truncate font-mono hover:bg-zinc-900 transition"
                                    />
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mt-2">
                                    <p className="text-center text-xs text-slate-300 font-medium leading-relaxed">
                                        Ou se preferir, abra o app do seu banco pelo celular e escolha <strong className="text-emerald-500 font-bold">Pix Copia e Cola</strong>.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-12 md:hidden">
                    <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-bold">Velfy Payment</p>
                </div>
            </div>
        </div>
    );
}
