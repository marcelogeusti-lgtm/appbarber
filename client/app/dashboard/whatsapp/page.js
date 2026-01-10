'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import {
    Smartphone, CheckCircle, RefreshCw, AlertCircle, Loader,
    Wifi, WifiOff, Plus, Trash2, Globe, ShieldCheck, Zap
} from 'lucide-react';

export default function WhatsAppPage() {
    const [status, setStatus] = useState('LOADING');
    const [qrCode, setQrCode] = useState(null);

    // Webhooks State
    const [webhooks, setWebhooks] = useState([]);
    const [newWebhookUrl, setNewWebhookUrl] = useState('');
    const [webhookLoading, setWebhookLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(checkStatus, 3000);
        checkStatus();
        fetchWebhooks();
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        try {
            const res = await api.get('/communication/status');
            setStatus(res.data.status);
            setQrCode(res.data.qr);
        } catch (error) {
            console.error('Status check failed', error);
        }
    };

    const fetchWebhooks = async () => {
        try {
            const res = await api.get('/webhooks');
            setWebhooks(res.data);
        } catch (error) {
            console.error('Failed to fetch webhooks', error);
        }
    };

    const handleAddWebhook = async () => {
        if (!newWebhookUrl) return;
        setWebhookLoading(true);
        try {
            await api.post('/webhooks', {
                url: newWebhookUrl,
                events: ['payment.approved', 'whatsapp.received', 'receipt.received'], // Default all
                active: true
            });
            setNewWebhookUrl('');
            fetchWebhooks();
        } catch (error) {
            alert('Erro ao adicionar webhook. Verifique o limite (Max 5).');
        } finally {
            setWebhookLoading(false);
        }
    };

    const handleDeleteWebhook = async (id) => {
        if (!confirm('Remover este webhook?')) return;
        try {
            await api.delete(`/webhooks/${id}`);
            fetchWebhooks();
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleWebhook = async (webhook) => {
        try {
            await api.put(`/webhooks/${webhook.id}`, { ...webhook, active: !webhook.active });
            fetchWebhooks();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="min-h-screen bg-[#0f111a] p-8 text-slate-200">
            {/* Header */}
            <div className="bg-[#161b2c] border border-slate-800 p-8 rounded-3xl mb-8 flex items-center justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <MessageIcon /> AUTOMAÇÃO DE MENSAGENS
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm font-medium">Sincronize sua operação com notificações inteligentes</p>
                </div>
                <div className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${status === 'CONNECTED'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/50 text-red-400'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    {status === 'CONNECTED' ? 'ONLINE' : 'OFFLINE'}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main: QR Code / Connection */}
                <div className="lg:col-span-2 bg-[#161b2c] border border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center min-h-[500px] relative">

                    {status === 'LOADING' && <Loader className="w-12 h-12 text-emerald-500 animate-spin" />}

                    {status !== 'CONNECTED' && status !== 'LOADING' && (
                        <>
                            <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
                                <QrIcon />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2 uppercase">Vincular Dispositivo</h2>
                            <p className="text-slate-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                                Conecte o WhatsApp do seu estabelecimento para habilitar os avisos de agendamento em tempo real.
                            </p>

                            {qrCode ? (
                                <div className="bg-white p-4 rounded-xl mb-6">
                                    <img src={qrCode} className="w-64 h-64 object-contain" alt="QR Code" />
                                </div>
                            ) : (
                                <div className="w-64 h-64 bg-slate-800/50 rounded-xl mb-6 flex items-center justify-center text-slate-600 text-xs">
                                    Carregando QR...
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full">
                                <ShieldCheck className="w-3 h-3" /> Conexão Segura TLS 1.3
                            </div>
                        </>
                    )}

                    {status === 'CONNECTED' && (
                        <>
                            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 text-emerald-400 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Dispositivo Vinculado</h2>
                            <p className="text-slate-400 mb-8 max-w-sm">
                                A engine de mensageria está ativa e processando filas de envio.
                            </p>
                            <button onClick={checkStatus} className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
                                Atualizar Status
                            </button>
                        </>
                    )}
                </div>

                {/* Sidebar: Modules */}
                <div className="space-y-6">
                    <div className="bg-[#161b2c] border border-slate-800 rounded-3xl p-8">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">
                            Módulos Inteligentes
                        </h3>
                        <div className="space-y-8">
                            <ModuleItem
                                title="Lembrete Pré-Agendado"
                                desc="Dispara automático 24h e 1h antes para evitar No-Show."
                                active={true}
                            />
                            <ModuleItem
                                title="Feedback do Cliente"
                                desc="Solicita uma avaliação 30 min após a conclusão do serviço."
                                active={true}
                            />
                            <ModuleItem
                                title="Recupere Clientes"
                                desc="Alerta de retorno caso o cliente não agende nada em 45 dias."
                                active={true}
                            />
                        </div>
                    </div>

                    <div className="bg-[#161b2c] border border-slate-800 rounded-3xl p-6">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Protocolos de Uso</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-white mb-1">CONEXÃO SEGURA</p>
                                <p className="text-[10px] text-slate-500 leading-relaxed">Mantenha seu celular carregado e conectado à internet para garantir a entrega das mensagens.</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white mb-1">LIMITES DE ENVIO</p>
                                <p className="text-[10px] text-slate-500 leading-relaxed">Evite disparos em massa para não ser bloqueado.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Webhooks Section */}
            <div className="mt-8 bg-[#161b2c] border border-slate-800 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Zap className="w-5 h-5 text-emerald-500" /> Webhooks
                        </h2>
                        <p className="text-slate-400 text-xs mt-1">Integre com n8n, Typebot ou sistemas externos.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newWebhookUrl}
                                onChange={e => setNewWebhookUrl(e.target.value)}
                                placeholder="https://seu-webhook.com/endpoint..."
                                className="flex-1 bg-[#0f111a] border border-slate-800 rounded-xl px-4 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
                            />
                            <button
                                onClick={handleAddWebhook}
                                disabled={webhookLoading}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                                {webhookLoading ? '...' : 'Adicionar'}
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500">Eventos disparados: Pagamentos, Agendamentos e Mensagens.</p>
                    </div>

                    <div className="space-y-3">
                        {webhooks.length === 0 && (
                            <div className="text-center py-4 text-slate-600 text-xs">Nenhum webhook configurado.</div>
                        )}
                        {webhooks.map(hook => (
                            <div key={hook.id} className="bg-[#0f111a] border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-2 h-2 rounded-full ${hook.active ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                                    <span className="text-xs text-slate-300 truncate font-mono">{hook.url}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleToggleWebhook(hook)} className={`text-[10px] font-bold px-2 py-1 rounded ${hook.active ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 bg-slate-800'}`}>
                                        {hook.active ? 'ON' : 'OFF'}
                                    </button>
                                    <button onClick={() => handleDeleteWebhook(hook.id)} className="text-slate-600 hover:text-red-400 p-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Icons Components for clean JSX
const MessageIcon = () => (
    <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
);

const QrIcon = () => (
    <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
);

const ModuleItem = ({ title, desc, active }) => (
    <div className="flex items-start gap-4">
        <div className={`mt-1 w-2 h-2 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></div>
        <div>
            <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
        </div>
    </div>
);
