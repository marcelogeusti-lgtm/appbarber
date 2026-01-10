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
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            // We pass bId just to ensure backend context is right, but auth middleware handles it mostly
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

            await fetchTemplates(); // Refresh to see overrides
            setEditingId(null);
            alert('Template salvo com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar template');
        } finally {
            setSaving(false);
        }
    };

    const insertVariable = (variable) => {
        setEditContent(prev => prev + variable);
    };

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-black uppercase text-xs">Carregando templates...</div>;

    const variables = [
        { label: 'Nome do Cliente', value: '{{clientName}}' },
        { label: 'Nome do Serviço', value: '{{serviceName}}' },
        { label: 'Data', value: '{{date}}' },
        { label: 'Horário', value: '{{time}}' },
        { label: 'Profissional', value: '{{professionalName}}' },
        { label: 'Nome da Barbearia', value: '{{barbershopName}}' },
    ];

    const templateTypes = {
        'CONFIRMATION_REQUEST': 'Solicitação de Confirmação',
        'REMINDER': 'Lembrete Automático',
        'CANCELLATION': 'Aviso de Cancelamento',
        // Add others if exist in Enum
    };

    return (
        <div className="space-y-8">
            <header className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                    <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-white">Templates de Mensagens</h2>
                    <p className="text-slate-500 text-xs font-medium">Personalize como a barbearia conversa com os clientes.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {templates.map(tmpl => {
                    const isEditing = editingId === tmpl.id;
                    return (
                        <div key={tmpl.type} className={`bg-[#111827] rounded-3xl border transition-all ${isEditing ? 'border-emerald-500 ring-1 ring-emerald-500/20 shadow-2xl' : 'border-slate-800 shadow-sm'}`}>
                            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                <div className="md:w-1/3 space-y-4">
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                        {templateTypes[tmpl.type] || tmpl.type}
                                    </h3>
                                    <p className="text-slate-500 text-xs leading-relaxed">
                                        Esta mensagem é enviada automaticamente pelo sistema quando o gatilho específico é acionado.
                                        {tmpl.isGlobal && <span className="block mt-2 text-emerald-500 font-bold bg-emerald-500/10 w-fit px-2 py-1 rounded">Usando Padrão do Sistema</span>}
                                        {!tmpl.isGlobal && <span className="block mt-2 text-blue-400 font-bold bg-blue-500/10 w-fit px-2 py-1 rounded">Personalizado</span>}
                                    </p>
                                </div>

                                <div className="flex-1 space-y-4">
                                    {isEditing ? (
                                        <div className="space-y-4 animate-in fade-in">
                                            <div className="relative">
                                                <textarea
                                                    value={editContent}
                                                    onChange={e => setEditContent(e.target.value)}
                                                    className="w-full h-40 bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white text-sm leading-relaxed focus:outline-none focus:border-emerald-500 font-mono"
                                                />
                                                <div className="absolute top-2 right-2 flex gap-1">
                                                    <div className="group relative">
                                                        <Info className="w-4 h-4 text-slate-600 hover:text-slate-400 cursor-help" />
                                                        <div className="hidden group-hover:block absolute right-0 top-6 bg-slate-900 border border-slate-700 p-2 rounded-lg w-48 z-10 text-[10px] text-slate-400 shadow-xl">
                                                            Use as variáveis abaixo para personalizar a mensagem para cada cliente.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Variables Bar */}
                                            <div className="flex flex-wrap gap-2">
                                                {variables.map(v => (
                                                    <button
                                                        key={v.value}
                                                        onClick={() => insertVariable(v.value)}
                                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors flex items-center gap-1 border border-slate-700"
                                                    >
                                                        <Sparkles className="w-3 h-3 text-yellow-500" /> {v.label}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex justify-end gap-2 pt-2">
                                                <button
                                                    onClick={handleCancel}
                                                    className="px-6 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={() => handleSave(tmpl)}
                                                    disabled={saving}
                                                    className="bg-emerald-500 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                                >
                                                    {saving ? '...' : 'Salvar Alterações'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 min-h-[100px] text-slate-300 text-sm whitespace-pre-wrap font-mono relative overflow-hidden group-hover:border-slate-700 transition-colors">
                                                {tmpl.content}
                                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-950/50 to-transparent pointer-events-none"></div>
                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => handleEdit(tmpl)}
                                                    className="px-6 py-2 bg-slate-800 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all border border-slate-700 hover:border-emerald-500"
                                                >
                                                    Editar Template
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
                    <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-3xl">
                        Nenhum template encontrado.
                    </div>
                )}
            </div>
        </div>
    );
}
