'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import PaymentBrick from '../../components/payment/PaymentBrick';
import api from '../../lib/clientApi';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Suporta tanto ?appointmentId=... quanto ?id=... (pagamento pendente)
    const appointmentId = searchParams.get('appointmentId');
    const paymentId = searchParams.get('id');

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentResult, setPaymentResult] = useState(null);

    useEffect(() => {
        if (!appointmentId && !paymentId) {
            setError('Dados do agendamento não encontrados.');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                // Determine source: Appointment or Payment
                let endpoint = '';
                if (appointmentId) endpoint = `/appointments/${appointmentId}`;
                else if (paymentId) endpoint = `/payments/${paymentId}`;

                const res = await api.get(endpoint);

                // Normalize data structure
                if (appointmentId) {
                    setData({
                        amount: res.data.service.price,
                        barbershopId: res.data.barbershopId,
                        barbershopName: res.data.barbershop.name,
                        barbershopLogo: res.data.barbershop.logoUrl,
                        description: `${res.data.service.name} - ${res.data.barbershop.name}`,
                        payer: {
                            email: res.data.client.authUser?.email || 'email@naoinformado.com',
                            name: res.data.client.name
                        },
                        context: { appointmentId }
                    });
                } else {
                    setData({
                        amount: res.data.amount,
                        barbershopId: res.data.barbershopId,
                        barbershopName: res.data.barbershop?.name,
                        barbershopLogo: res.data.barbershop?.logoUrl,
                        description: `Pagamento #${res.data.id.slice(0, 8)}`,
                        payer: {
                            email: 'email@naoinformado.com', // Need to fetch user if strictly required or prompt
                            name: 'Cliente'
                        },
                        context: { paymentId } // Pass paymentId if re-trying
                    });
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching checkout data:", err);
                setError('Erro ao carregar dados do checkout.');
                setLoading(false);
            }
        };

        fetchData();
    }, [appointmentId, paymentId]);

    const handleSuccess = (result) => {
        console.log("Payment Success:", result);
        setPaymentResult(result);
        // Could redirect to a success page or show success state here
    };

    const handleError = (err) => {
        console.error("Payment Component Error:", err);
        // Validations are handled by Brick mostly, this is for critical errors
        toast.error(`Erro no pagamento: ${err}`);
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="text-white text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={() => router.back()} className="text-emerald-500 underline">Voltar</button>
            </div>
        </div>
    );

    if (paymentResult) {
        const { status, ticket_url, qr_code_base64, qr_code } = paymentResult;

        if (status === 'approved' || status === 'paid') {
            return (
                <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
                    <CheckCircle className="w-20 h-20 text-emerald-500 mb-6" />
                    <h1 className="text-2xl font-bold mb-2">Pagamento Confirmado!</h1>
                    <p className="text-slate-400 mb-8 max-w-md text-center">Seu agendamento foi garantido com sucesso.</p>
                    <button
                        onClick={() => router.push('/dashboard/appointments')}
                        className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-xl font-bold transition"
                    >
                        Ver Meus Agendamentos
                    </button>
                </div>
            );
        }

        if (status === 'in_process' || status === 'pending') {
            if (ticket_url) {
                // Boleto UI
                return (
                    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
                        <CheckCircle className="w-20 h-20 text-yellow-500 mb-6" />
                        <h1 className="text-2xl font-bold mb-2">Boleto Gerado!</h1>
                        <p className="text-slate-400 mb-8 max-w-md text-center">Clique abaixo para visualizar e imprimir seu boleto.</p>
                        <a
                            href={ticket_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold transition mb-4 block"
                        >
                            Abrir Boleto
                        </a>
                        <button onClick={() => router.push('/dashboard/appointments')} className="text-slate-500 underline">
                            Voltar ao Dashboard
                        </button>
                    </div>
                );
            }

            if (qr_code_base64 || qr_code) {
                // Pix UI (Fallback if Brick doesn't handle it, though usually Brick does)
                // But strictly speaking, if backend generated it, we show it.
                return (
                    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
                        <h1 className="text-2xl font-bold mb-4">Pagamento Pix Gerado</h1>
                        {qr_code_base64 && (
                            <img src={`data:image/png;base64,${qr_code_base64}`} alt="Pix QR Code" className="w-64 h-64 mb-4 rounded-lg" />
                        )}
                        <p className="text-slate-400 mb-8 max-w-md text-center">Escaneie o QR Code para pagar.</p>
                        <button onClick={() => router.push('/dashboard/appointments')} className="text-slate-500 underline">
                            Já paguei, voltar
                        </button>
                    </div>
                );
            }

            // Generic Pending (Review Manual)
            return (
                <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
                    <CheckCircle className="w-20 h-20 text-yellow-500 mb-6" />
                    <h1 className="text-2xl font-bold mb-2">Processando Pagamento...</h1>
                    <p className="text-slate-400 mb-8 max-w-md text-center">Seu pagamento está sendo analisado. Você será notificado assim que aprovado.</p>
                    <button
                        onClick={() => router.push('/dashboard/appointments')}
                        className="bg-slate-800 hover:bg-slate-700 px-8 py-3 rounded-xl font-bold transition"
                    >
                        Voltar ao Dashboard
                    </button>
                </div>
            );
        }
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col md:flex-row">
            {/* Left Info Section */}
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 bg-zinc-900/50">
                <div>
                    <button onClick={() => router.back()} className="text-sm font-medium text-slate-400 hover:text-white flex items-center gap-2 mb-8 transition">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        {data.barbershopLogo && (
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                                <img src={data.barbershopLogo} alt={data.barbershopName} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">{data.barbershopName}</h2>
                            <p className="text-xs text-emerald-500 font-medium tracking-wide uppercase">Ambiente Seguro</p>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-sm">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Serviço / Referência</p>
                            <p className="text-sm text-slate-300 font-medium">{data.description}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Valor Total</p>
                            <p className="text-3xl text-white font-bold tracking-tight">
                                {Number(data.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Payment Section */}
            <div className="w-full md:w-1/2 p-6 md:p-12 bg-black flex flex-col items-center justify-center">
                <div className="w-full max-w-md space-y-4">
                    <h1 className="text-xl font-bold text-center mb-6">Escolha como pagar</h1>

                    <PaymentBrick
                        amount={data.amount}
                        barbershopId={data.barbershopId}
                        description={data.description}
                        payer={data.payer}
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />

                    <div className="text-center mt-6">
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Pagamento processado via Mercado Pago
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
