import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Loader2, X, MessageSquare, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function MessageLogsModal({ barbershopId, onClose }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (barbershopId) {
            fetchLogs();
        }
    }, [barbershopId]);

    const fetchLogs = async () => {
        try {
            const res = await api.get(`/communication/logs`, { params: { barbershopId } });
            setLogs(res.data);
        } catch (error) {
            console.error('Error fetching message logs', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <div>
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">Logs de Disparos Recentes</h2>
                        <p className="text-muted-foreground text-xs">Acompanhe as mensagens enviadas aos seus clientes.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-muted/20">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : logs.length === 0 ? (
                        <div className="text-center p-12 bg-card rounded-xl border border-dashed border-border">
                            <p className="text-muted-foreground text-sm font-medium">Nenhum log encontrado recentemente.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map(log => (
                                <div key={log.id} className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-2 items-center">
                                            {log.type === 'WHATSAPP' ? (
                                                <div className="p-1.5 bg-[#25D366]/10 rounded-md"><MessageSquare className="w-4 h-4 text-[#25D366]" /></div>
                                            ) : (
                                                <div className="p-1.5 bg-blue-500/10 rounded-md"><Mail className="w-4 h-4 text-blue-500" /></div>
                                            )}
                                            <span className="text-xs font-bold text-foreground">{log.recipient}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-muted-foreground">{new Date(log.createdAt).toLocaleString('pt-BR')}</span>
                                            {log.status === 'SENT' ? (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-1"><CheckCircle2 className="w-3 h-3" /> Enviado</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 mt-1"><AlertCircle className="w-3 h-3" /> Falha</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-muted p-3 rounded-lg mt-2">
                                        <p className="text-[11px] text-muted-foreground whitespace-pre-wrap">{log.body}</p>
                                        {log.error && (
                                            <p className="text-[10px] text-red-500 mt-2 p-2 border border-red-500/20 bg-red-500/5 rounded">Erro: {log.error}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
