'use client';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X, Smartphone, CheckCircle, RefreshCw, AlertCircle, Loader } from 'lucide-react';

export default function ConnectWhatsAppModal({ isOpen, onClose }) {
    const [status, setStatus] = useState('LOADING'); // LOADING, WAITING_QR, CONNECTED, DISCONNECTED
    const [qrCode, setQrCode] = useState(null);
    const [pollInterval, setPollInterval] = useState(null);

    useEffect(() => {
        if (isOpen) {
            checkStatus();
            const interval = setInterval(checkStatus, 3000); // Poll every 3s
            setPollInterval(interval);
            return () => clearInterval(interval);
        } else {
            if (pollInterval) clearInterval(pollInterval);
        }
    }, [isOpen]);

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition text-slate-500">
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 text-center bg-slate-50">
                    <div className="w-16 h-16 bg-emerald-100 text-primary/90 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                        <Smartphone className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Conectar WhatsApp</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">
                        Escaneie o QR Code para ativar as notificações
                    </p>
                </div>

                <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                    {status === 'LOADING' && (
                        <div className="text-center animate-pulse">
                            <Loader className="w-10 h-10 text-slate-300 mx-auto mb-4 animate-spin" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Iniciando sessão...</p>
                        </div>
                    )}

                    {status === 'WAITING_QR' && qrCode && (
                        <div className="text-center">
                            <div className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-inner mb-4">
                                <img src={qrCode} alt="QR Code" className="w-64 h-64 object-contain" />
                            </div>
                            <p className="text-[10px] bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full inline-block mb-2 animate-pulse">
                                Aguardando Leitura
                            </p>
                            <p className="text-xs text-slate-400">Abra o WhatsApp &gt; Configurações &gt; Aparelhos Conectados</p>
                        </div>
                    )}

                    {status === 'CONNECTED' && (
                        <div className="text-center">
                            <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Conectado com Sucesso!</h3>
                            <p className="text-sm text-slate-500 mb-6">Seu sistema já pode enviar mensagens automáticas.</p>
                            <button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg shadow-primary/20">
                                Fechar
                            </button>
                        </div>
                    )}

                    {status === 'ERROR' && (
                        <div className="text-center">
                            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                            <p className="text-sm font-bold text-slate-500 mb-4">Erro ao conectar.</p>
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
