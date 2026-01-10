'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Smartphone, CheckCircle, RefreshCw, AlertCircle, Loader, Wifi, WifiOff } from 'lucide-react';

export default function WhatsAppSettingsPage() {
    const [status, setStatus] = useState('LOADING'); // LOADING, WAITING_QR, CONNECTED, DISCONNECTED
    const [qrCode, setQrCode] = useState(null);
    const [pollInterval, setPollInterval] = useState(null);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 3000); // Poll every 3s
        setPollInterval(interval);
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        try {
            const res = await api.get('/communication/status');
            setStatus(res.data.status);
            if (res.data.qr) {
                setQrCode(res.data.qr);
            }
        } catch (error) {
            console.error(error);
            setStatus('ERROR');
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-black text-slate-800 mb-1">Integração WhatsApp</h1>
            <p className="text-slate-500 mb-8">Conecte seu aparelho para habilitar o envio automático de confirmações.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Status Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Status da Conexão</h2>

                    <div className={`p-4 rounded-xl flex items-center gap-4 mb-6 ${status === 'CONNECTED' ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'
                        }`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status === 'CONNECTED' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                            }`}>
                            {status === 'CONNECTED' ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                                {status === 'CONNECTED' ? 'ONLINE' : 'OFFLINE'}
                            </p>
                            <p className="text-xs text-slate-500">
                                {status === 'CONNECTED' ? 'Sistema pronto para envios.' : 'Automação pausada.'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span>Envio de Confirmação Automática</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span>Resposta Inteligente (1 = Confirmar)</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span>Histórico no CRM</span>
                        </div>
                    </div>
                </div>

                {/* Connection Area */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">

                    {status === 'LOADING' && (
                        <div className="text-center animate-pulse">
                            <Loader className="w-10 h-10 text-slate-300 mx-auto mb-4 animate-spin" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verificando status...</p>
                        </div>
                    )}

                    {status === 'WAITING_QR' && qrCode && (
                        <div className="text-center">
                            <p className="text-sm font-bold text-slate-800 mb-4">Escaneie para Conectar</p>
                            <div className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-inner mb-4 inline-block">
                                <img src={qrCode} alt="QR Code" className="w-64 h-64 object-contain" />
                            </div>
                            <p className="text-[10px] bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full inline-block mb-2 animate-pulse">
                                Aguardando Leitura
                            </p>
                            <p className="text-xs text-slate-400">WhatsApp &gt; Configurações &gt; Aparelhos Conectados</p>
                        </div>
                    )}

                    {status === 'CONNECTED' && (
                        <div className="text-center">
                            <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Conectado!</h3>
                            <p className="text-sm text-slate-500 mb-6 max-w-[200px] mx-auto">
                                Seu Whatsapp está sincronizado e operando normalmente.
                            </p>
                            <button onClick={checkStatus} className="text-emerald-600 text-xs font-bold hover:underline">
                                Atualizar Status
                            </button>
                        </div>
                    )}

                    {status === 'ERROR' && (
                        <div className="text-center">
                            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <p className="text-sm font-bold text-slate-500 mb-4">Erro de conexão com servidor.</p>
                            <button onClick={checkStatus} className="flex items-center gap-2 mx-auto text-xs font-bold bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition text-slate-600">
                                <RefreshCw className="w-4 h-4" /> Tentar Novamente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
