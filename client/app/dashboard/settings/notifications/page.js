'use client';
import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import { MessageSquare, Save, Info, Sparkles } from 'lucide-react';

export default function NotificationSettingsPage() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit State
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications/templates');
            setTemplates(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleEdit = (tmpl) => {
        setEditingId(tmpl.id);
        setEditContent(tmpl.content);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditContent('');
    };

    const handleSave = async (tmpl) => {
        try {
            setSaving(true);
            await api.post('/notifications/templates', {
                type: tmpl.type,
                content: editContent,
                active: tmpl.active
            });

            await fetchTemplates();
            setEditingId(null);
            alert('Protocolo de comunicação atualizado!');
        } catch (error) {
            console.error(error);
            alert('Falha na sincronização do protocolo');
        } finally {
            setSaving(false);
        }
    };

    const insertVariable = (variable) => {
        setEditContent(prev => prev + variable);
    };

    if (loading) return <div className="p-20 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Sincronizando Templates...</div>;

    const variables = [
        { label: 'Cliente', value: '{{clientName}}' },
        { label: 'Serviço', value: '{{serviceName}}' },
        { label: 'Data', value: '{{date}}' },
        { label: 'Horário', value: '{{time}}' },
        { label: 'Profissional', value: '{{professionalName}}' },
        { label: 'Barbearia', value: '{{barbershopName}}' },
    ];

    const templateTypes = {
        'CONFIRMATION_REQUEST': 'Solicitação de Confirmação',
        'REMINDER': 'Lembrete Automático',
        'CANCELLATION': 'Aviso de Cancelamento',
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            <header className="flex items-center gap-6 bg-card p-10 rounded-[2.5rem] border border-border shadow-sm">
                <div className="p-4 bg-primary/10 text-primary rounded-[1.5rem] border border-primary/20 shadow-xl shadow-primary/5">
                    <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">Protocolos de Comunicação</h2>
                    <p className="text-muted-foreground text-sm font-medium italic opacity-80 uppercase tracking-widest text-[10px] mt-1">Personalize a voz digital da sua barbearia.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                {templates.map(tmpl => {
                    const isEditing = editingId === tmpl.id;
                    return (
                        <div key={tmpl.type} className={`bg-card rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isEditing ? 'border-primary ring-4 ring-primary/10 shadow-2xl' : 'border-border shadow-sm'}`}>
                            <div className="p-8 md:p-12 flex flex-col lg:flex-row gap-12">
                                <div className="lg:w-1/3 space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
                                            {templateTypes[tmpl.type] || tmpl.type}
                                        </h3>
                                        {tmpl.isGlobal ? (
                                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/10 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                <Sparkles className="w-3 h-3" /> Padrão Maestro
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/10 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                <Info className="w-3 h-3" /> Personalizado
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground text-xs leading-relaxed font-medium italic opacity-80">
                                        Este script é disparado automaticamente pela nossa inteligência de comunicação quando o evento de **{templateTypes[tmpl.type]?.toLowerCase() || tmpl.type}** ocorre.
                                    </p>
                                </div>

                                <div className="flex-1 space-y-6">
                                    {isEditing ? (
                                        <div className="space-y-6 animate-in fade-in duration-500">
                                            <div className="relative group">
                                                <textarea
                                                    value={editContent}
                                                    onChange={e => setEditContent(e.target.value)}
                                                    className="w-full h-48 bg-background border border-border rounded-3xl p-6 text-foreground text-sm leading-relaxed focus:outline-none focus:ring-4 ring-primary/10 transition-all font-mono shadow-inner"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Variáveis Inteligentes (Toque para Inserir)</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {variables.map(v => (
                                                        <button
                                                            key={v.value}
                                                            onClick={() => insertVariable(v.value)}
                                                            className="px-4 py-2 bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-wide transition-all flex items-center gap-2 border border-border"
                                                        >
                                                            {v.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-4 pt-4">
                                                <button
                                                    onClick={handleCancel}
                                                    className="px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    Descartar
                                                </button>
                                                <button
                                                    onClick={() => handleSave(tmpl)}
                                                    disabled={saving}
                                                    className="bg-primary text-primary-foreground px-12 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                                                >
                                                    {saving ? 'Gravando...' : 'Atualizar Protocolo'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="bg-background/80 p-8 rounded-3xl border border-border min-h-[140px] text-foreground text-sm whitespace-pre-wrap font-mono relative overflow-hidden shadow-inner leading-relaxed">
                                                {tmpl.content}
                                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background/80 to-transparent pointer-events-none"></div>
                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => handleEdit(tmpl)}
                                                    className="px-8 py-3 bg-muted text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all border border-border shadow-sm group"
                                                >
                                                    Customizar Voz
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {templates.length === 0 && (
                    <div className="p-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-[3rem] bg-muted/20">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Nenhum protocolo ativo detectado.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
