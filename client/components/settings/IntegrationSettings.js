'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { Calendar, Smartphone, Bell, CheckCircle, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';

export default function IntegrationSettings() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-white">Integrações de Serviço</h2>
                    <p className="text-slate-500 text-xs font-medium">Conecte ferramentas externas para turbinar sua operação.</p>
                </div>
            </div>

            <GoogleCalendarCard />
            <WhatsAppCard />
            <PushNotificationCard />
        </div>
    );
}

function GoogleCalendarCard() {
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false); // In real app, fetch from user profile

    useEffect(() => {
        // ideally check if user has googleTokens
        // for now we trust the auth flow or check a profile endpoint
    }, []);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const res = await api.get('/integration/google/auth-url');
            if (res.data.url) {
                // Open in popup
                const width = 500;
                const height = 600;
                const left = (window.innerWidth - width) / 2;
                const top = (window.innerHeight - height) / 2;

                window.open(
                    res.data.url,
                    'GoogleAuth',
                    `width=${width},height=${height},top=${top},left=${left}`
                );
            }
        } catch (error) {
            alert('Erro ao iniciar conexão com Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 rounded-[2rem] border border-slate-800 bg-[#111827] hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-slate-800 shadow-xl shrink-0">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            Google Calendar
                            {connected && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        </h3>
                        <p className="text-slate-500 text-xs mt-1 max-w-lg">
                            Sincronize seus agendamentos automaticamente com sua agenda do Google.
                            Eventos externos bloquearão seu horário no app para evitar conflitos.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleConnect}
                    disabled={loading || connected}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${connected
                            ? 'bg-emerald-500/10 text-emerald-500 cursor-default'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                        }`}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        connected ? 'CONECTADO' : <><ExternalLink className="w-3 h-3" /> CONECTAR</>
                    )}
                </button>
            </div>
        </div>
    );
}

function WhatsAppCard() {
    const [status, setStatus] = useState('unknown'); // unknown, CONNECTED, DISCONNECTED
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkStatus = async () => {
        setLoading(true);
        try {
            const res = await api.get('/integration/whatsapp/status');
            setStatus(res.data.state || 'DISCONNECTED');
            if (res.data.qrcode) {
                setQrCode(res.data.qrcode); // base64
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 rounded-[2rem] border border-slate-800 bg-[#111827] hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 overflow-hidden flex items-center justify-center border border-emerald-600 shadow-xl shrink-0">
                        <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            WhatsApp Business
                            {status === 'CONNECTED' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        </h3>
                        <p className="text-slate-500 text-xs mt-1 max-w-lg">
                            Envie lembretes e confirmações automáticas para seus clientes.
                        </p>

                        <div className="mt-4">
                            {status === 'CONNECTED' ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    Operacional
                                </span>
                            ) : (
                                <button onClick={checkStatus} className="text-[10px] text-blue-400 font-bold hover:underline">
                                    Verificar Status
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* QR Code display area could go here or in a modal */}
            </div>
        </div>
    );
}

function PushNotificationCard() {
    const { isSubscribed, subscribeUser } = usePushNotifications();
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);
        // Need VAPID key here - usually from env or API
        // For now hardcoded or fetched
        try {
            // Fetch VAPID public key
            // const key = await api.get('/integration/push/vapid-key');
            // await subscribeUser(key.data);
            alert('Push Notification requer configuração de chaves VAPID no backend.');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 rounded-[2rem] border border-slate-800 bg-[#111827] hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 overflow-hidden flex items-center justify-center border border-purple-700 shadow-xl shrink-0">
                        <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            Notificações Push
                            {isSubscribed && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        </h3>
                        <p className="text-slate-500 text-xs mt-1 max-w-lg">
                            Receba alertas sobre novos agendamentos e cancelamentos diretamente no seu dispositivo.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSubscribe}
                    disabled={isSubscribed || loading}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSubscribed
                            ? 'bg-purple-500/10 text-purple-500 cursor-default'
                            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/20'
                        }`}
                >
                    {isSubscribed ? 'ATIVADO' : 'ATIVAR'}
                </button>
            </div>
        </div>
    );
}
