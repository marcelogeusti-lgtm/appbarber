'use client';
import { useState, useEffect } from 'react';
import { MessageSquare, QrCode, ShieldCheck, XCircle, Settings, Bell, Zap } from 'lucide-react';
import api from '../../../lib/api';


export default function WhatsAppPage() {
    const [status, setStatus] = useState('disconnected'); // disconnected, connecting, connected
    const [qrCode, setQrCode] = useState(null);
    const [webhookUrl, setWebhookUrl] = useState('');

    useEffect(() => {
        fetchBarbershopData();
    }, []);

    const fetchBarbershopData = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const slug = user.barbershop?.slug || user.ownedBarbershops?.[0]?.slug;
            if (!slug) return;

            const res = await api.get(`/barbershops/${slug}`);
            if (res.data.webhookUrl) {
                setWebhookUrl(res.data.webhookUrl);
            }
        } catch (err) {
            console.error('Error fetching barbershop data:', err);
        }
    };

    const saveWebhook = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            if (!bId) {
                alert('Barbearia não identificada.');
                return;
            }

            await api.put(`/barbershops/${bId}`, { webhookUrl });
            alert('Configuração de automação salva com sucesso no banco de dados!');
        } catch (err) {
            console.error('Error saving webhook:', err);
            alert('Erro ao salvar configuração: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleConnect = () => {
        setStatus('connecting');
        // Evolution API / n8n connection simulation
        setTimeout(() => {
            setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CorteConexao_Production_Session_EvolutionAPI');
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
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-8 rounded-3xl border border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Automação de Mensagens</h1>
                        <p className="text-slate-500 text-sm font-medium italic leading-none mt-1">Sincronize sua operação com notificações inteligentes</p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${status === 'connected' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                    <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    {status === 'connected' ? 'Instância Ativa' : 'Offline'}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#111827] border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                        <div className="p-8 md:p-16 text-center">
                            {status === 'connected' ? (
                                <div className="space-y-8">
                                    <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-3xl border border-emerald-500/20 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 rotate-3">
                                        <ShieldCheck className="w-12 h-12" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Conexão Estabelecida</h2>
                                        <p className="text-slate-500 mt-2 font-medium">Sua instância <span className="text-emerald-500 font-bold uppercase tracking-widest text-xs ml-1">"Barbe_On_Live"</span> está pronta.</p>
                                    </div>
                                    <div className="pt-4">
                                        <button onClick={handleDisconnect} className="bg-slate-950 text-red-500 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition flex items-center gap-2 mx-auto border border-slate-800">
                                            <XCircle className="w-4 h-4" /> Finalizar Instância
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {status === 'disconnected' ? (
                                        <>
                                            <div className="w-24 h-24 bg-slate-950 text-slate-700 rounded-3xl border border-slate-800 flex items-center justify-center mx-auto -rotate-6">
                                                <QrCode className="w-12 h-12" />
                                            </div>
                                            <div className="max-w-md mx-auto">
                                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Vincular Dispositivo</h2>
                                                <p className="text-slate-500 mt-2 font-medium">Conecte o WhatsApp do seu estabelecimento para habilitar os avisos de agendamento em tempo real.</p>
                                            </div>
                                            <button onClick={handleConnect} className="bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95">
                                                GERAR TOKEN DE ACESSO
                                            </button>
                                        </>
                                    ) : (
                                        <div className="space-y-8 flex flex-col items-center">
                                            <div className="p-6 bg-white rounded-[2rem] border-[12px] border-slate-950 shadow-2xl relative">
                                                <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 grayscale group-hover:grayscale-0 transition-all duration-700" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-white/40 backdrop-blur-[2px] transition-opacity cursor-pointer font-black text-slate-950 uppercase text-[10px] tracking-widest">Digitalizando...</div>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-white font-black uppercase text-xs tracking-[0.2em] animate-pulse">Aguardando Leitura</p>
                                                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest bg-slate-950 px-4 py-1 rounded-full border border-slate-800">WhatsApp {'>'} Aparelhos Conectados {'>'} Vincular</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-6 bg-slate-950/50 border-t border-slate-800/50 flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg border border-slate-800">
                                    <Zap className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Engine de Mensageria</p>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-tight">Evolution API Enterprise <span className="text-emerald-500 ml-2">● Estável</span></p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Segurança</p>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-tight">TLS 1.3 / End-to-End</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden relative">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                                <Settings className="w-5 h-5 text-emerald-500" />
                            </div>
                            <h3 className="font-black uppercase tracking-[0.15em] text-xs text-white">Configuração de Automação (n8n Webhook)</h3>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="text"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                placeholder="https://automaserv.com/webhook/..."
                                className="flex-1 p-5 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:ring-2 ring-emerald-500 transition font-mono text-[10px] text-emerald-500 placeholder:text-slate-800"
                            />
                            <button onClick={saveWebhook} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition shadow-xl shadow-emerald-500/20">SALVAR ENDPOINT</button>
                        </div>
                        <div className="mt-6 flex items-center gap-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                            <Bell className="w-4 h-4 text-emerald-500" />
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                Este endpoint processará gatilhos de agendamento, cancelamento e lembretes recorrentes.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-8 bg-[#111827] text-white rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden group">
                        <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MessageSquare className="w-32 h-32" />
                        </div>
                        <h4 className="font-black uppercase tracking-[0.2em] text-[10px] mb-6 text-emerald-500">Módulos Inteligentes</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0 shadow-lg shadow-emerald-500/50"></div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black uppercase tracking-tight text-white">Lembrete Pré-Agendado</p>
                                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">Disparo automático 24h e 1h antes para evitar No-Show.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0 shadow-lg shadow-emerald-500/50"></div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black uppercase tracking-tight text-white">Feedback do Cliente</p>
                                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">Solicita uma avaliação 30 min após a conclusão do serviço.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0 shadow-lg shadow-emerald-500/50"></div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black uppercase tracking-tight text-white">Recupere Clientes</p>
                                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">Alerta de retorno caso o cliente não agende nada em 45 dias.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="p-8 bg-slate-950/20 border border-slate-800/50 rounded-[2.5rem]">
                        <h4 className="font-black uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2 text-slate-600">
                            Protocolos de Uso
                        </h4>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <p className="font-black uppercase text-[10px] text-slate-400 tracking-widest border-b border-slate-800 pb-1 w-fit">Conexão Segura</p>
                                <p className="text-[10px] font-medium text-slate-600 italic leading-relaxed">Mantenha seu celular carregado e conectado à internet para garantir a entrega das mensagens.</p>
                            </div>
                            <div className="space-y-3">
                                <p className="font-black uppercase text-[10px] text-slate-400 tracking-widest border-b border-slate-800 pb-1 w-fit">Limites de Envio</p>
                                <p className="text-[10px] font-medium text-slate-600 italic leading-relaxed">Não realize disparos manuais em massa pelo app enquanto a engine estiver processando automações.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
