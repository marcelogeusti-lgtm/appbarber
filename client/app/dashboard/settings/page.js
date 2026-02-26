'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import {
    Settings, Save, MapPin, Phone, ChevronDown,
    Image as ImageIcon, Shield, MessageSquare, Zap,
    Globe, Smartphone, CreditCard, ExternalLink, CheckCircle, Info, Sparkles, Loader2, Camera, Palette, Bell
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
            // Save Barbershop settings
            await api.put(`/barbershops/${barbershop.id}`, barbershop);

            // If editing a template, save it too
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

            // REFRESH all data to be sure
            const [bRes, tRes] = await Promise.all([
                api.get('/barbershops/me'),
                api.get('/notifications/templates')
            ]);
            setBarbershop(bRes.data);
            setTemplates(tRes.data);
            setEditingTemplateId(null);

            // Update local storage
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.barbershop) user.barbershop = { ...user.barbershop, ...barbershop };
                localStorage.setItem('user', JSON.stringify(user));
            }

            setMessage({ type: 'success', text: 'Protocolos e configurações atualizados com sucesso!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao salvar configurações' });
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
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <div className="text-center text-muted-foreground animate-pulse font-black uppercase text-[10px] tracking-[0.3em]">
                Sincronizando Ecossistema NEXT...
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 md:p-12 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -mr-48 -mt-48 pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-5 bg-primary/10 text-primary rounded-[1.8rem] border border-primary/20 shadow-2xl shadow-primary/5">
                        <Settings className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-foreground uppercase tracking-tighter leading-none">Configurações</h1>
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-3 opacity-60">Gerencie sua barbearia e preferências técnicas.</p>
                    </div>
                </div>
                <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="relative z-10 flex items-center gap-4 bg-primary text-primary-foreground px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Salvar Tudo</>}
                </button>
            </header>

            {message && (
                <div className={`p-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] text-center animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                    {message.text}
                </div>
            )}

            {/* Premium Tab Navigation */}
            <div className="bg-card/50 p-2 rounded-3xl border border-border flex flex-wrap items-center gap-1 md:gap-2 shadow-inner overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.name;
                    return (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest border border-transparent ${isActive
                                ? 'bg-background text-primary border-border shadow-xl ring-4 ring-primary/5'
                                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'}`}
                        >
                            <Icon className={`w-4 h-4 transition-transform duration-500 ${isActive ? 'scale-110' : 'opacity-50'}`} />
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {activeTab === 'Geral' && <GeneralTab barbershop={barbershop} setBarbershop={setBarbershop} />}
                {activeTab === 'Identidade Visual' && (
                    <VisualTab
                        barbershop={barbershop}
                        setBarbershop={setBarbershop}
                        uploadingLogo={uploadingLogo}
                        setUploadingLogo={setUploadingLogo}
                        uploadingBannerIdx={uploadingBannerIdx}
                        setUploadingBannerIdx={setUploadingBannerIdx}
                    />
                )}
                {activeTab === 'Regras e Políticas' && <RulesTab barbershop={barbershop} setBarbershop={setBarbershop} />}
                {activeTab === 'Comunicação' && (
                    <CommunicationTab
                        barbershop={barbershop}
                        setBarbershop={setBarbershop}
                        templates={templates}
                        editingTemplateId={editingTemplateId}
                        setEditingTemplateId={setEditingTemplateId}
                        editContent={editContent}
                        setEditContent={setEditContent}
                        saving={saving}
                        fetchTemplates={fetchInitialData}
                    />
                )}
                {activeTab === 'Conexões' && isMaster && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <IntegrationSettings />
                    </div>
                )}
                {activeTab === 'Alertas' && <AlertsTab />}
            </div>

            {/* Footer Protocol */}
            <div className="bg-card border-l-8 border-primary rounded-[2.5rem] p-10 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/2 pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                    <Shield className="w-6 h-6 text-primary" />
                    <h4 className="text-[11px] font-black text-foreground uppercase tracking-[0.4em]">Protocolo de Governança NEXT</h4>
                </div>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed italic uppercase tracking-tighter max-w-3xl relative z-10">
                    A alteração de parâmetros sensíveis como o **Link Personalizado (Slug)** impacta a indexação e o acesso via biografia Social. Mudanças estruturais são registradas para auditoria técnica.
                </p>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS (TABS) ---

function GeneralTab({ barbershop, setBarbershop }) {
    return (
        <div className="bg-card p-10 md:p-12 rounded-[3rem] border border-border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-10 flex items-center gap-4">
                <Globe className="w-6 h-6 text-primary" /> Dados da Barbearia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Nome Comercial</label>
                    <input
                        value={barbershop.name}
                        onChange={e => setBarbershop({ ...barbershop, name: e.target.value })}
                        className="w-full p-6 bg-background border border-border rounded-2xl focus:ring-8 ring-primary/5 outline-none transition font-black text-lg text-foreground shadow-inner"
                        placeholder="Nome da sua barbearia"
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Link Personalizado (Slug)</label>
                    <div className="relative group">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-[9px] uppercase tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">/agendamento/</span>
                        <input
                            value={barbershop.slug}
                            onChange={e => setBarbershop({ ...barbershop, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/\s+/g, '-') })}
                            className="w-full p-6 pl-36 bg-background border border-border rounded-2xl focus:ring-8 ring-primary/5 outline-none transition font-mono text-sm text-primary shadow-inner"
                        />
                        {barbershop.slug.length > 3 && (
                            <CheckCircle className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-in zoom-in" />
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Endereço Físico</label>
                    <input
                        value={barbershop.address}
                        onChange={e => setBarbershop({ ...barbershop, address: e.target.value })}
                        className="w-full p-6 bg-background border border-border rounded-2xl focus:ring-8 ring-primary/5 outline-none transition font-bold text-foreground shadow-inner"
                        placeholder="Rua, Número, Bairro, Cidade..."
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">WhatsApp de Contato</label>
                    <div className="relative">
                        <input
                            value={barbershop.phone}
                            onChange={e => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 11) val = val.slice(0, 11);
                                if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
                                if (val.length > 9) val = `${val.slice(0, 10)}-${val.slice(10)}`;
                                setBarbershop({ ...barbershop, phone: val });
                            }}
                            className="w-full p-6 bg-background border border-border rounded-2xl focus:ring-8 ring-primary/5 outline-none transition font-black text-foreground shadow-inner"
                            placeholder="(00) 00000-0000"
                        />
                        <Smartphone className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-30" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function VisualTab({ barbershop, setBarbershop, uploadingLogo, setUploadingLogo, uploadingBannerIdx, setUploadingBannerIdx }) {
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            if (!file.type.match('image.*')) return reject(new Error('Arquivo não é uma imagem'));
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
            };
            reader.onerror = error => reject(error);
        });
    };

    return (
        <div className="bg-card p-10 md:p-12 rounded-[3rem] border border-border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-10 flex items-center gap-4">
                <Palette className="w-6 h-6 text-primary" /> Identidade Visual
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-6">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Logo Principal</label>
                    <div className="relative aspect-square w-64 mx-auto bg-background/50 border-2 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center group overflow-hidden hover:border-primary transition-all shadow-inner">
                        {uploadingLogo ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest animate-pulse">Processando...</span>
                            </div>
                        ) : barbershop.logoUrl ? (
                            <img src={barbershop.logoUrl} alt="Logo" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                            <Camera className="w-12 h-12 text-muted-foreground opacity-20" />
                        )}
                        {!uploadingLogo && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer">
                                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Upload Nova Logo</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingLogo}
                            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setUploadingLogo(true);
                                    try {
                                        const dataUri = await compressImage(file);
                                        setBarbershop({ ...barbershop, logoUrl: dataUri });
                                    } finally {
                                        setUploadingLogo(false);
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Capa / Banners do App ({barbershop.bannerUrls?.length || 0}/3)</label>
                    <div className="grid grid-cols-1 gap-6">
                        {(barbershop.bannerUrls || []).map((url, idx) => (
                            <div key={idx} className="relative aspect-video bg-background border border-border rounded-2xl overflow-hidden group shadow-sm">
                                <img src={url} alt={`Banner ${idx}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                <button
                                    onClick={() => setBarbershop({ ...barbershop, bannerUrls: barbershop.bannerUrls.filter((_, i) => i !== idx) })}
                                    className="absolute inset-0 bg-destructive/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                                >
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Remover Imagem</span>
                                </button>
                            </div>
                        ))}
                        {(barbershop.bannerUrls?.length || 0) < 3 && (
                            <div className="relative aspect-video border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-background/50 hover:border-primary transition-all cursor-pointer group bg-card/20">
                                {uploadingBannerIdx === 'new' ? (
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                ) : (
                                    <>
                                        <span className="text-2xl text-muted-foreground group-hover:scale-125 transition-transform">+</span>
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Adicionar Foto do Espaço</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    disabled={uploadingBannerIdx !== null}
                                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setUploadingBannerIdx('new');
                                            try {
                                                const dataUri = await compressImage(file);
                                                setBarbershop({ ...barbershop, bannerUrls: [...(barbershop.bannerUrls || []), dataUri] });
                                            } finally {
                                                setUploadingBannerIdx(null);
                                            }
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function RulesTab({ barbershop, setBarbershop }) {
    return (
        <div className="bg-card p-10 md:p-12 rounded-[3rem] border border-border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-10 flex items-center gap-4">
                <Shield className="w-6 h-6 text-primary" /> Regras e Políticas
            </h2>
            <div className="space-y-12">
                <div className="bg-background/40 p-10 rounded-[2.5rem] border border-border shadow-inner flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                            <h4 className="font-black text-foreground uppercase tracking-tight text-lg">Protocolo de No-Show</h4>
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed font-medium italic opacity-80 max-w-xl">
                            Clientes que faltarem sem justificativa prévia serão penalizados com uma taxa automática adicionada ao próximo agendamento realizado.
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={barbershop.noShowEnabled || false}
                            onChange={e => setBarbershop({ ...barbershop, noShowEnabled: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-20 h-10 bg-muted/50 border border-border rounded-full peer peer-checked:bg-primary shadow-inner after:content-[''] after:absolute after:top-1.5 after:left-1.5 after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:after:translate-x-10"></div>
                    </label>
                </div>

                {barbershop.noShowEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in zoom-in-95 duration-500">
                        <div className="space-y-5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Gravidade da Multa (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={barbershop.noShowPercent || 0}
                                    onChange={e => setBarbershop({ ...barbershop, noShowPercent: parseFloat(e.target.value) })}
                                    className="w-full p-6 pr-16 bg-background border border-border rounded-2xl focus:ring-8 ring-primary/5 outline-none transition font-black text-2xl text-foreground shadow-inner"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-primary font-black text-xl">%</span>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2">Texto Informativo no Check-in</label>
                            <input
                                value={barbershop.noShowText || ''}
                                onChange={e => setBarbershop({ ...barbershop, noShowText: e.target.value })}
                                className="w-full p-6 bg-background border border-border rounded-2xl focus:ring-8 ring-primary/5 outline-none transition font-bold text-foreground text-sm shadow-inner"
                                placeholder="Ex: Taxa de compensação por ausência anterior."
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function CommunicationTab({ barbershop, setBarbershop, templates, editingTemplateId, setEditingTemplateId, editContent, setEditContent, saving, fetchTemplates }) {
    const [waStatus, setWaStatus] = useState({ status: 'LOADING' });

    useEffect(() => {
        let isSubscribed = true;
        const checkStatus = async () => {
            try {
                const res = await api.get('/whatsapp/status');
                if (isSubscribed) setWaStatus(res.data);
            } catch (e) {
                if (isSubscribed) setWaStatus({ status: 'ERROR' });
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => {
            isSubscribed = false;
            clearInterval(interval);
        };
    }, []);

    const templateTypes = {
        'CONFIRMATION_REQUEST': 'Confirmação',
        'REMINDER': 'Lembrete',
        'CANCELLATION': 'Cancelamento',
    };

    const variables = [
        { label: 'Cliente', value: '{{clientName}}' },
        { label: 'Data', value: '{{date}}' },
        { label: 'Hora', value: '{{time}}' },
    ];

    const keywords = barbershop.whatsappKeywords || {};

    const handleAddKeyword = () => {
        const key = prompt('Digite a palavra-chave (ex: agendar, horario, cancelar):');
        if (!key) return;
        const msg = prompt('Digite a resposta automática para essa palavra:');
        if (!msg) return;

        setBarbershop(prev => ({
            ...prev,
            whatsappKeywords: {
                ...(prev.whatsappKeywords || {}),
                [key.toLowerCase().trim()]: msg
            }
        }));
    };

    const handleRemoveKeyword = (keyToRemove) => {
        const newKeywords = { ...keywords };
        delete newKeywords[keyToRemove];
        setBarbershop(prev => ({
            ...prev,
            whatsappKeywords: newKeywords
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* WhatsApp Smart Bot Controls */}
            <div className="bg-gradient-to-br from-card to-background p-10 md:p-12 rounded-[3rem] border border-primary/20 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <div className="p-3 bg-[#25D366]/10 text-[#25D366] rounded-2xl border border-[#25D366]/20 shadow-lg shadow-[#25D366]/5">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">WhatsApp Smart Bot {barbershop.whatsappAutoReply ? 'Ativo' : 'Offline'}</h2>
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed font-medium italic opacity-80 max-w-xl">
                            O robô inteligente responde automaticamente seus clientes com o link de agendamento e informações essenciais, evitando que você perca reservas por demora no atendimento.
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-6">

                        {/* WhatsApp Auth Widget */}
                        <div className="bg-background/80 p-6 rounded-3xl border border-border shadow-inner text-center min-w-[200px] flex flex-col items-center justify-center relative overflow-hidden h-[180px]">
                            {waStatus.status === 'LOADING' && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
                            {waStatus.status === 'WAITING_QR' && waStatus.qr && (
                                <div className="space-y-2 animate-in zoom-in duration-500">
                                    <div className="bg-white p-2 rounded-xl inline-block shadow-md">
                                        <img src={waStatus.qr} alt="WhatsApp QR Code" className="w-24 h-24 object-contain" />
                                    </div>
                                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Escaneie o QR Code</p>
                                </div>
                            )}
                            {waStatus.status === 'CONNECTED' && (
                                <div className="space-y-3 animate-in fade-in duration-500">
                                    <div className="w-16 h-16 bg-[#25D366]/20 text-[#25D366] rounded-full flex items-center justify-center mx-auto ring-4 ring-[#25D366]/10">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <p className="text-[10px] font-black text-[#25D366] uppercase tracking-[0.2em]">Dispositivo Linkado</p>
                                </div>
                            )}
                            {(waStatus.status === 'DISCONNECTED' || waStatus.status === 'ERROR') && (
                                <div className="space-y-3 animate-in fade-in duration-500">
                                    <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
                                        <Zap className="w-8 h-8" />
                                    </div>
                                    <p className="text-[10px] font-black text-destructive uppercase tracking-[0.2em]">{waStatus.status}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center gap-4 bg-background/40 p-6 rounded-[2rem] border border-border shadow-inner h-[180px] justify-center">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Status da Automação</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={barbershop.whatsappAutoReply || false}
                                    onChange={e => setBarbershop({ ...barbershop, whatsappAutoReply: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-20 h-10 bg-muted/50 border border-border rounded-full peer peer-checked:bg-[#25D366] shadow-inner after:content-[''] after:absolute after:top-1.5 after:left-1.5 after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:after:translate-x-10"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {barbershop.whatsappAutoReply && (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-border/50 animate-in zoom-in-95 duration-500">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-4 h-4 text-primary" />
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Filtro de Horário Comercial</label>
                            </div>
                            <div className="flex items-center justify-between bg-background/60 p-6 rounded-2xl border border-border">
                                <span className="text-xs font-bold text-foreground opacity-60 italic">Responder apenas entre 08h e 19h</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={barbershop.whatsappBusinessHoursOnly || false}
                                        onChange={e => setBarbershop({ ...barbershop, whatsappBusinessHoursOnly: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-muted/50 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-7"></div>
                                </label>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Mensagem de Boas-Vindas</label>
                            </div>
                            <input
                                value={barbershop.whatsappWelcomeMessage || ''}
                                onChange={e => setBarbershop({ ...barbershop, whatsappWelcomeMessage: e.target.value })}
                                className="w-full p-6 bg-background/60 border border-border rounded-2xl focus:ring-8 ring-primary/5 outline-none transition font-bold text-foreground text-sm shadow-inner"
                                placeholder="Olá! {{clientName}}, como posso ajudar? Para agendar, use: {{link}}"
                            />
                        </div>
                    </div>
                )}

                {barbershop.whatsappAutoReply && (
                    <div className="mt-8 pt-8 border-t border-border/50 animate-in zoom-in-95 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 text-primary cursor-pointer" />
                                <label className="text-[12px] font-black text-foreground uppercase tracking-[0.2em]">Respostas por Palavras-Chave</label>
                            </div>
                            <button
                                onClick={handleAddKeyword}
                                className="px-4 py-2 bg-primary/20 text-primary rounded-xl text-[10px] font-black uppercase shadow-inner hover:bg-primary hover:text-primary-foreground transition-all"
                            >
                                + Nova Regra
                            </button>
                        </div>
                        <div className="space-y-4">
                            {Object.entries(keywords).length === 0 ? (
                                <p className="text-xs text-muted-foreground italic tracking-widest text-center py-4 bg-background/50 rounded-2xl">Nenhuma palavra-chave configurada. O bot usará apenas a mensagem de boas-vindas.</p>
                            ) : (
                                Object.entries(keywords).map(([key, msg]) => (
                                    <div key={key} className="flex flex-col md:flex-row items-center gap-4 bg-background/60 p-4 rounded-2xl border border-border group relative">
                                        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-mono text-xs font-bold w-full md:w-32 text-center uppercase border border-primary/20">
                                            "{key}"
                                        </div>
                                        <div className="flex-1 text-xs text-foreground font-medium opacity-80 break-words w-full">
                                            {msg}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveKeyword(key)}
                                            className="absolute top-2 right-2 md:relative md:top-auto md:right-auto px-3 py-1 bg-destructive/10 text-destructive text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity uppercase font-black tracking-wider"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4 px-4 pt-4">
                <MessageSquare className="w-5 h-5 text-primary opacity-50" />
                <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">Protocolos de Notificação Transacional</h3>
            </div>

            {!templates.length ? (
                <div className="p-20 text-center border-2 border-dashed border-border rounded-[3rem] bg-card/20 text-muted-foreground font-black text-[10px] uppercase tracking-widest mt-6">
                    Nenhum protocolo ativo.
                </div>
            ) : (
                templates.map(tmpl => {
                    const isEditing = editingTemplateId === tmpl.id;
                    return (
                        <div key={tmpl.id} className={`bg-card rounded-[3rem] border transition-all duration-700 overflow-hidden ${isEditing ? 'border-primary ring-8 ring-primary/5 shadow-2xl' : 'border-border shadow-md'}`}>
                            <div className="p-10 md:p-12 flex flex-col lg:flex-row gap-12">
                                <div className="lg:w-1/3">
                                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-4">{templateTypes[tmpl.type] || tmpl.type}</h3>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-6">
                                        <Sparkles className="w-3 h-3" /> Protocolo Ativo
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium italic leading-relaxed opacity-70">
                                        Define como o sistema fala com seu cliente durante o evento de **{templateTypes[tmpl.type]?.toLowerCase()}**.
                                    </p>
                                </div>

                                <div className="flex-1 space-y-6">
                                    {isEditing ? (
                                        <div className="space-y-8 animate-in delay-200">
                                            <textarea
                                                value={editContent}
                                                onChange={e => setEditContent(e.target.value)}
                                                className="w-full h-40 bg-background border border-border rounded-[2.5rem] p-8 text-foreground text-sm leading-relaxed focus:ring-8 ring-primary/5 outline-none transition-all font-mono shadow-inner border-primary/30"
                                            />
                                            <div className="flex flex-wrap gap-3">
                                                {variables.map(v => (
                                                    <button
                                                        key={v.value}
                                                        onClick={() => setEditContent(prev => prev + v.value)}
                                                        className="px-6 py-3 bg-muted/50 hover:bg-primary hover:text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-border"
                                                    >
                                                        +{v.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex justify-end gap-5">
                                                <button onClick={() => setEditingTemplateId(null)} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-8">Cancelar</button>
                                                <button
                                                    onClick={() => {
                                                        // This is handled by "Save All", but local save is also good
                                                        setEditingTemplateId(null);
                                                    }}
                                                    className="bg-primary text-primary-foreground px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                                                >
                                                    Pronto para Salvar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 h-full flex flex-col justify-between">
                                            <div className="relative">
                                                <div className="bg-background/80 p-8 rounded-[2.5rem] border border-border min-h-[120px] text-foreground text-sm font-mono shadow-inner leading-relaxed relative italic opacity-80">
                                                    {tmpl.content}
                                                </div>

                                                {/* WhatsApp Simulator Preview */}
                                                <div className="mt-6 flex justify-start animate-in fade-in slide-in-from-left-4 duration-700">
                                                    <div className="max-w-[85%] bg-[#075E54] rounded-2xl p-4 shadow-lg border border-white/10 relative">
                                                        <div className="text-[10px] font-bold text-[#25D366] uppercase tracking-widest mb-1 flex items-center gap-2">
                                                            <Smartphone className="w-3 h-3" /> Preview Cliente
                                                        </div>
                                                        <p className="text-white text-xs leading-relaxed font-sans pr-8">
                                                            {tmpl.content.replace(/{{clientName}}/g, 'João').replace(/{{date}}/g, '12/10').replace(/{{time}}/g, '14:30')}
                                                        </p>
                                                        <span className="absolute bottom-2 right-3 text-[9px] text-white/50 font-sans italic">14:31 ✓✓</span>
                                                        <div className="absolute -left-2 top-4 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-[#075E54]" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-6">
                                                <button
                                                    onClick={() => {
                                                        setEditingTemplateId(tmpl.id);
                                                        setEditContent(tmpl.content);
                                                    }}
                                                    className="px-10 py-4 bg-muted text-muted-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all border border-border shadow-sm group"
                                                >
                                                    <Sparkles className="w-3 h-3 inline-block mr-2 group-hover:animate-spin" />
                                                    Customizar Voz
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }))}
        </div>
    );
}

function AlertsTab() {
    return (
        <div className="bg-card p-10 md:p-20 rounded-[4rem] border border-border shadow-2xl text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                <Bell className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <div className="space-y-4">
                <h3 className="text-4xl font-black text-foreground uppercase tracking-tighter">Motor de Alertas Ativo</h3>
                <p className="text-muted-foreground text-[11px] font-black uppercase tracking-[0.2em] opacity-60">Monitoramento 24/7 de todos os eventos da unidade.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {['Push Local', 'WhatsApp SDK', 'Webhooks API'].map(alert => (
                    <div key={alert} className="bg-background/50 p-5 border border-border rounded-2xl flex items-center justify-center gap-3">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black text-foreground tracking-widest">{alert}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
