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
        </div>
    );
}

function GoogleCalendarCard() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ connected: false });

    const checkStatus = async () => {
        setLoading(true);
        try {
            const res = await api.get('/integration/google/status');
            setStatus(res.data);
        } catch (error) {
            console.error('Error checking Google status:', error);
            setStatus({ connected: false });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkStatus();

        // Listen for message from popup
        const handleMessage = (event) => {
            if (event.data === 'google-connected') {
                checkStatus();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const res = await api.get('/integration/google/auth-url');
            if (res.data.url) {
                const width = 500;
                const height = 650;
                const left = (window.innerWidth - width) / 2;
                const top = (window.innerHeight - height) / 2;
                window.open(res.data.url, 'GoogleAuth', `width=${width},height=${height},top=${top},left=${left}`);
            }
        } catch (error) {
            alert('Erro ao iniciar conexão com Google');
        } finally {
            setLoading(false);
        }
    };

    const isConnected = status.connected;

    return (
        <div className="p-8 rounded-[2rem] border border-border bg-card hover:border-primary/30 transition-all duration-500 group relative overflow-hidden mb-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="flex gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner shrink-0 group-hover:scale-110 transition-transform ${isConnected ? 'bg-primary/10 border-primary/20' : 'bg-zinc-100 border-zinc-200'}`}>
                        <Calendar className={`w-6 h-6 ${isConnected ? 'text-primary' : 'text-zinc-400'}`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-foreground flex items-center gap-3 uppercase tracking-tight">
                            Google Calendar
                            {isConnected && <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">CONECTADO</span>}
                            {!loading && !isConnected && status.error && <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">EXPIRADO / ERRO</span>}
                        </h3>
                        <p className="text-muted-foreground text-xs mt-2 font-medium italic leading-relaxed opacity-80 max-w-lg">
                            {isConnected 
                                ? `Sincronizado com ${status.email || 'sua conta Google'}. Seus agendamentos aparecem na sua agenda pessoal automaticamente.`
                                : 'Sincronize seus agendamentos automaticamente com sua agenda do Google para evitar conflitos de horário.'
                            }
                        </p>
                        {status.error && isConnected && (
                            <p className="text-red-500 text-[10px] font-bold mt-2 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Atenção: Há um problema com sua conexão. Tente reconectar.
                            </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleConnect}
                    disabled={loading}
                    className={`flex items-center gap-3 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isConnected
                        ? 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95'
                        }`}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        isConnected ? 'RECONECTAR' : <><ExternalLink className="w-4 h-4" /> CONECTAR</>
                    )}
                </button>
            </div>
        </div>
    );
}

function WhatsAppCard() {
    const [status, setStatus] = useState('unknown');
    const [loading, setLoading] = useState(false);

    const checkStatus = async () => {
        setLoading(true);
        try {
            const res = await api.get('/integration/whatsapp/status');
            setStatus(res.data.state || 'DISCONNECTED');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 rounded-[2rem] border border-border bg-card hover:border-primary/30 transition-all duration-500 group relative overflow-hidden mb-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="flex gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 overflow-hidden flex items-center justify-center border border-[#25D366]/20 shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                        <Smartphone className="w-8 h-8 text-[#25D366]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-foreground flex items-center gap-3 uppercase tracking-tight">
                            WhatsApp Maestro
                            {status === 'CONNECTED' && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                                    <CheckCircle className="w-3 h-3" /> Conectado
                                </span>
                            )}
                        </h3>
                        <p className="text-muted-foreground text-xs mt-2 font-medium italic leading-relaxed opacity-80 max-w-lg">
                            O coração da sua comunicação. Envie lembretes, confirmações e avisos de cancelamento instantaneamente.
                        </p>

                        <div className="mt-4 flex items-center gap-4">
                            {status === 'CONNECTED' ? (
                                <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                                    Monitoramento Ativo
                                </div>
                            ) : (
                                <button
                                    onClick={checkStatus}
                                    disabled={loading}
                                    className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline flex items-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Verificar Sincronia'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
