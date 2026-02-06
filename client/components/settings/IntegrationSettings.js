'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { Calendar, Smartphone, Bell, CheckCircle, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';

export default function IntegrationSettings() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
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
    return (
        <div className="p-8 rounded-[2rem] border border-border bg-card hover:border-primary/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="flex gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 overflow-hidden flex items-center justify-center border border-primary/20 shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                        <Bell className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-foreground flex items-center gap-3 uppercase tracking-tight">
                            Alertas Automáticos
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-widest shadow-inner">
                                <CheckCircle className="w-3 h-3" /> Operacional
                            </span>
                        </h3>
                        <p className="text-muted-foreground text-xs mt-2 font-medium italic leading-relaxed opacity-80">
                            Seu sistema envia notificações automaticamente sobre agendamentos e cancelamentos diretamente para os dispositivos autorizados.
                        </p>
                    </div>
                </div>

                <div className="bg-background/50 border border-border px-6 py-4 rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Sincronizado</span>
                </div>
            </div>
        </div>
    );
}
