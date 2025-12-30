'use client';
import { useState, useEffect } from 'react';
import { MessageSquare, QrCode, ShieldCheck, XCircle, Settings, Bell, Zap } from 'lucide-react';

export default function WhatsAppPage() {
    const [status, setStatus] = useState('disconnected'); // disconnected, connecting, connected
    const [qrCode, setQrCode] = useState(null);
    const [webhookUrl, setWebhookUrl] = useState('');

    useEffect(() => {
        const savedUrl = localStorage.getItem('N8N_WEBHOOK_URL');
        if (savedUrl) setWebhookUrl(savedUrl);
    }, []);

    const saveWebhook = () => {
        localStorage.setItem('N8N_WEBHOOK_URL', webhookUrl);
        alert('Configuração de automação salva com sucesso!');
    };

    const handleConnect = () => {
        setStatus('connecting');
        // Evolution API / n8n connection simulation
        setTimeout(() => {
            setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=BarberOn_Production_Session_EvolutionAPI');
        }, 1200);
    };

    const handleDisconnect = () => {
        if (confirm('Deseja realmente desconectar sua instância de WhatsApp?')) {
            setStatus('disconnected');
            setQrCode(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-emerald-500" />
                        Automação WhatsApp
                    </h1>
                    <p className="text-slate-500 text-sm font-medium italic">Reduza faltas e fidelize clientes com notificações inteligentes</p>
                </div>
                <div className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${status === 'connected' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    {status === 'connected' ? 'Conectado' : 'Desconectado'}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
                        <div className="p-8 md:p-16 text-center">
                            {status === 'connected' ? (
                                <div className="space-y-6">
                                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/10 rotate-3">
                                        <ShieldCheck className="w-12 h-12" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Instância Ativa</h2>
                                        <p className="text-slate-500 mt-2 font-medium">Sua conta <span className="font-bold text-slate-900 dark:text-white">"BarberBot_Live"</span> está operando via Evolution API.</p>
                                    </div>
                                    <div className="pt-4">
                                        <button onClick={handleDisconnect} className="bg-red-50 text-red-500 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition flex items-center gap-2 mx-auto border border-red-100">
                                            <XCircle className="w-4 h-4" /> Desconectar instância
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {status === 'disconnected' ? (
                                        <>
                                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 text-slate-200 rounded-3xl flex items-center justify-center mx-auto -rotate-6">
                                                <QrCode className="w-12 h-12" />
                                            </div>
                                            <div className="max-w-md mx-auto">
                                                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Sincronizar Conta</h2>
                                                <p className="text-slate-500 mt-2 font-medium">Conecte o WhatsApp do seu estabelecimento para enviar lembretes automáticos e comunicações de marketing.</p>
                                            </div>
                                            <button onClick={handleConnect} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-900/30 hover:bg-black transition-all hover:scale-105 active:scale-95">
                                                GERAR QR CODE DE CONEXÃO
                                            </button>
                                        </>
                                    ) : (
                                        <div className="space-y-8 flex flex-col items-center">
                                            <div className="p-6 bg-white rounded-[2rem] border-8 border-slate-900 shadow-2xl relative">
                                                <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 grayscale hover:grayscale-0 transition-all duration-700" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-white/10 backdrop-blur-[2px] transition-opacity cursor-none font-black text-slate-900 uppercase text-[10px] tracking-widest">Aguardando Scan</div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest">Escaneie o código acima</p>
                                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Abra o WhatsApp {'>'} Aparelhos Conectados {'>'} Conectar um Aparelho</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                                    <Zap className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status da Engine</p>
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">Evolution API v2.0 <span className="text-emerald-500 ml-2">● Online</span></p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Criptografia</p>
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">HTTPS / AES-256</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Settings className="w-5 h-5 text-slate-400" />
                            <h3 className="font-black uppercase tracking-widest text-sm">Configuração de Webhook (n8n)</h3>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                placeholder="https://n8n.seu-dominio.com/webhook/..."
                                className="flex-1 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 ring-emerald-500 transition font-mono text-xs"
                            />
                            <button onClick={saveWebhook} className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20">Salvar Endpoint</button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Bell className="w-3 h-3" /> Este URL receberá notificações de novos agendamentos em tempo real.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                            <MessageSquare className="w-20 h-20" />
                        </div>
                        <h4 className="font-black uppercase tracking-widest text-xs mb-4 text-emerald-400">Funcionalidades Ativas</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                                <p className="text-xs font-medium text-slate-300">Lembretes automáticos 24h e 1h antes do horário.</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                                <p className="text-xs font-medium text-slate-300">Mensagem de boas-vindas para novos clientes.</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                                <p className="text-xs font-medium text-slate-300">Confirmação instantânea de pagamento/reserva.</p>
                            </li>
                        </ul>
                    </div>

                    <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
                        <h4 className="font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2 text-slate-400">
                            Dicas de Uso
                        </h4>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <p className="font-black uppercase text-[10px] text-slate-700 dark:text-white tracking-widest">Evite Bloqueios</p>
                                <p className="text-[10px] font-medium text-slate-500 italic leading-relaxed">Não envie mensagens em massa para números que não têm você salvo nos contatos.</p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-black uppercase text-[10px] text-slate-700 dark:text-white tracking-widest">Personalização</p>
                                <p className="text-[10px] font-medium text-slate-500 italic leading-relaxed">Use o n8n para incluir o nome do cliente e do barbeiro na mensagem.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
