'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import {
    Settings, Save, MapPin, Phone, ChevronDown,
    Image as ImageIcon, Shield, MessageSquare, Zap,
    Globe, Smartphone, CreditCard, ExternalLink, CheckCircle, Info, Sparkles, Loader2, Camera, Palette, Bell, BellRing
} from 'lucide-react';
import IntegrationSettings from '../../../components/settings/IntegrationSettings';
import Link from 'next/link';

export default function SettingsPage() {
    const [barbershop, setBarbershop] = useState({ name: '', slug: '', address: '', phone: '', bannerUrls: [], noShowEnabled: false, noShowPercent: 0, noShowText: '' });
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('Geral');
    const [isMaster, setIsMaster] = useState(false);

    // Template editing state
    const [editingTemplateId, setEditingTemplateId] = useState(null);
    const [editContent, setEditContent] = useState('');

    // Image upload loading states
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBannerIdx, setUploadingBannerIdx] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setIsMaster(user.role === 'SUPER_ADMIN');
        }
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [bRes, tRes] = await Promise.all([
                api.get('/barbershops/me'),
                api.get('/notifications/templates')
            ]);
            setBarbershop(bRes.data);
            setTemplates(tRes.data);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Erro ao carregar dados das configurações.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAll = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await api.put(`/barbershops/${barbershop.id}`, barbershop);
            if (editingTemplateId) {
                const tmpl = templates.find(t => t.id === editingTemplateId);
                if (tmpl) {
                    await api.post('/notifications/templates', {
                        type: tmpl.type,
                        content: editContent,
                        active: tmpl.active
                    });
                }
            }
            const [bRes, tRes] = await Promise.all([
                api.get('/barbershops/me'),
                api.get('/notifications/templates')
            ]);
            setBarbershop(bRes.data);
            setTemplates(tRes.data);
            setEditingTemplateId(null);
            setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { name: 'Geral', icon: Globe },
        { name: 'Identidade Visual', icon: Palette },
        { name: 'Regras e Políticas', icon: Shield },
        { name: 'Comunicação', icon: MessageSquare },
        { name: 'Conexões', icon: Zap },
        { name: 'Alertas', icon: Bell },
    ];

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <div className="text-center text-muted-foreground font-semibold uppercase text-[10px] tracking-widest">Sincronizando...</div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 md:p-8 rounded-xl border border-border shadow-soft">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-lg border border-primary/20"><Settings className="w-6 h-6" /></div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground leading-none">Configurações</h1>
                        <p className="text-muted-foreground text-xs font-medium mt-1">Gerencie sua barbearia e preferências do sistema.</p>
                    </div>
                </div>
                <button onClick={handleSaveAll} disabled={saving} className="flex items-center gap-2 bg-primary text-white h-10 px-6 rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar Tudo</>}
                </button>
            </header>

            {message && (
                <div className={`p-4 rounded-lg text-xs font-semibold text-center animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-primary/5 text-primary border border-primary/10' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-muted p-1 rounded-xl border border-border flex flex-wrap items-center gap-1 shadow-sm overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.name;
                    return (
                        <button key={tab.name} onClick={() => setActiveTab(tab.name)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-semibold text-xs tracking-wide ${isActive ? 'bg-card text-primary border border-border shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-card/50'}`}>
                            <Icon className={`w-4 h-4 ${isActive ? 'opacity-100' : 'opacity-40'}`} />
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            <div className="min-h-[500px]">
                {activeTab === 'Geral' && <GeneralTab barbershop={barbershop} setBarbershop={setBarbershop} />}
                {activeTab === 'Identidade Visual' && <VisualTab barbershop={barbershop} setBarbershop={setBarbershop} uploadingLogo={uploadingLogo} setUploadingLogo={setUploadingLogo} uploadingBannerIdx={uploadingBannerIdx} setUploadingBannerIdx={setUploadingBannerIdx} />}
                {activeTab === 'Regras e Políticas' && <RulesTab barbershop={barbershop} setBarbershop={setBarbershop} />}
                {activeTab === 'Comunicação' && <CommunicationTab barbershop={barbershop} setBarbershop={setBarbershop} templates={templates} editingTemplateId={editingTemplateId} setEditingTemplateId={setEditingTemplateId} editContent={editContent} setEditContent={setEditContent} saving={saving} fetchTemplates={fetchInitialData} />}
                {activeTab === 'Conexões' && isMaster && <IntegrationSettings />}
                {activeTab === 'Alertas' && <AlertsTab />}
            </div>
        </div>
    );
}

function GeneralTab({ barbershop, setBarbershop }) {
    return (
        <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-soft">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Dados da Barbearia</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Nome Comercial</label>
                    <input value={barbershop.name} onChange={e => setBarbershop({ ...barbershop, name: e.target.value })} className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-medium text-foreground" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Link (Slug)</label>
                    <input value={barbershop.slug} onChange={e => setBarbershop({ ...barbershop, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-mono text-sm text-primary" />
                </div>
            </div>
        </div>
    );
}

function VisualTab({ barbershop, setBarbershop, uploadingLogo, setUploadingLogo, uploadingBannerIdx, setUploadingBannerIdx }) {
    const compressImage = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => resolve(event.target.result);
        });
    };

    return (
        <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-soft">
            <h2 className="text-lg font-bold text-foreground mb-8 flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Identidade Visual</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <label className="text-xs font-semibold text-muted-foreground">Logo Principal</label>
                    <div className="relative aspect-square w-48 mx-auto bg-muted border border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden hover:border-primary transition-all">
                        {barbershop.logoUrl ? <img src={barbershop.logoUrl} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-muted-foreground/40" />}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setUploadingLogo(true);
                                const dataUri = await compressImage(file);
                                setBarbershop({ ...barbershop, logoUrl: dataUri });
                                setUploadingLogo(false);
                            }
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function RulesTab({ barbershop, setBarbershop }) {
    return (
        <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-soft">
            <h2 className="text-lg font-bold text-foreground mb-8 flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Regras</h2>
            <div className="bg-muted p-6 rounded-lg border border-border flex items-center justify-between">
                <div className="space-y-1">
                    <h4 className="font-bold text-foreground text-sm">Protocolo No-Show</h4>
                    <p className="text-muted-foreground text-xs">Penalidade automática para faltas sem aviso.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={barbershop.noShowEnabled} onChange={e => setBarbershop({ ...barbershop, noShowEnabled: e.target.checked })} className="sr-only peer" />
                    <div className="w-12 h-6 bg-border rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"></div>
                </label>
            </div>
        </div>
    );
}

function CommunicationTab({ barbershop, setBarbershop, templates, editingTemplateId, setEditingTemplateId, editContent, setEditContent, saving, fetchTemplates }) {
    const [waStatus, setWaStatus] = useState({ status: 'LOADING' });

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await api.get('/whatsapp/status');
                setWaStatus(res.data);
            } catch (e) { setWaStatus({ status: 'ERROR' }); }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const templateTypes = { 'CONFIRMATION_REQUEST': 'Confirmação', 'REMINDER': 'Lembrete', 'CANCELLATION': 'Cancelamento' };

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-soft">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-lg font-bold text-foreground">WhatsApp Smart Bot</h2>
                        <p className="text-muted-foreground text-xs">Automação de agendamentos e respostas.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-muted p-4 rounded-lg border border-border flex flex-col items-center">
                            {waStatus.status === 'CONNECTED' ? <CheckCircle className="text-[#25D366]" /> : <Loader2 className="animate-spin text-muted-foreground/40" />}
                            <span className="text-[10px] font-bold mt-2 uppercase">{waStatus.status}</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={barbershop.whatsappAutoReply} onChange={e => setBarbershop({ ...barbershop, whatsappAutoReply: e.target.checked })} className="sr-only peer" />
                            <div className="w-12 h-6 bg-border rounded-full peer peer-checked:bg-[#25D366] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {templates.map(tmpl => {
                    const isEditing = editingTemplateId === tmpl.id;
                    return (
                        <div key={tmpl.id} className="bg-card p-6 rounded-xl border border-border shadow-soft">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-foreground">{templateTypes[tmpl.type] || tmpl.type}</h3>
                                <button onClick={() => { setEditingTemplateId(tmpl.id); setEditContent(tmpl.content); }} className="text-[10px] font-bold text-primary uppercase">Editar</button>
                            </div>
                            {isEditing ? (
                                <div className="space-y-4">
                                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full h-24 bg-muted border border-border rounded-lg p-3 text-sm text-foreground" />
                                    <div className="flex justify-end gap-2 text-[10px] font-bold uppercase">
                                        <button onClick={() => setEditingTemplateId(null)} className="text-muted-foreground">Cancelar</button>
                                        <button onClick={() => setEditingTemplateId(null)} className="text-primary">OK</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-muted p-3 rounded-lg text-xs italic text-muted-foreground">{tmpl.content}</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function AlertsTab() {
    return (
        <div className="bg-card p-12 rounded-xl border border-border shadow-soft text-center space-y-4">
            <BellRing className="w-12 h-12 text-primary mx-auto opacity-20" />
            <h3 className="text-lg font-bold text-foreground">Motor de Alertas Ativo</h3>
            <p className="text-muted-foreground text-xs">Todas as notificações estão configuradas e operais.</p>
        </div>
    );
}
