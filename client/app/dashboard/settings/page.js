'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '../../../lib/api';
import {
    Settings, Save, MapPin, Phone, ChevronDown,
    Image as ImageIcon, Shield, MessageSquare, Zap,
    Globe, Smartphone, CreditCard, ExternalLink, CheckCircle, Info, Sparkles, Loader2, Camera, Palette, Bell, BellRing, Trash2, Plus, AlignLeft, ScrollText
} from 'lucide-react';
import IntegrationSettings from '../../../components/settings/IntegrationSettings';
import Link from 'next/link';

import { useQuery } from '@tanstack/react-query';

export default function SettingsPage() {
    return (
        <Suspense fallback={<div>Carregando configurações...</div>}>
            <SettingsContent />
        </Suspense>
    );
}

function SettingsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialTab = searchParams.get('tab') || 'Geral';

    const { data: barbershopData, refetch: refetchShop } = useQuery({
        queryKey: ['barbershop-me'],
        queryFn: async () => {
            const res = await api.get('/barbershops/me');
            return res.data;
        },
        staleTime: 1000 * 60 * 30,
    });

    const [barbershop, setBarbershop] = useState({
        name: '',
        slug: '',
        address: '',
        phone: '',
        description: '',
        logoUrl: '',
        bannerUrls: [],
        noShowEnabled: false,
        noShowPercent: 0,
        noShowText: '',
        whatsappAutoReply: false,
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        instagramUrl: '',
        facebookUrl: '',

    });

    // Sync state with query data
    useEffect(() => {
        if (barbershopData) {
            const data = { ...barbershopData };
            if (!data.bannerUrls) data.bannerUrls = [];
            setBarbershop(data);
        }
    }, [barbershopData]);

    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isMaster, setIsMaster] = useState(false);
    const [editingTemplateId, setEditingTemplateId] = useState(null);
    const [editContent, setEditContent] = useState('');

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
            const tRes = await api.get('/notifications/templates');
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


            // Refetch fresh data to update cache
            await Promise.all([
                refetchShop(),
                api.get('/notifications/templates').then(r => setTemplates(r.data))
            ]);

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
        { name: 'Alertas', icon: Bell },
        { name: 'Assinatura', icon: CreditCard },
    ];

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <div className="text-center text-muted-foreground font-semibold uppercase text-[10px] tracking-widest">Sincronizando...</div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
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
                        <button key={tab.name} onClick={() => { setActiveTab(tab.name); router.push(`/dashboard/settings?tab=${tab.name}`, { scroll: false }); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-semibold text-xs tracking-wide ${isActive ? 'bg-card text-primary border border-border shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-card/50'}`}>
                            <Icon className={`w-4 h-4 ${isActive ? 'opacity-100' : 'opacity-40'}`} />
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            <div className="min-h-[500px]">
                {activeTab === 'Geral' && <GeneralTab barbershop={barbershop} setBarbershop={setBarbershop} />}
                {activeTab === 'Identidade Visual' && <VisualTab barbershop={barbershop} setBarbershop={setBarbershop} />}
                {activeTab === 'Regras e Políticas' && <RulesTab barbershop={barbershop} setBarbershop={setBarbershop} />}
                {activeTab === 'Comunicação' && <CommunicationTab barbershop={barbershop} setBarbershop={setBarbershop} templates={templates} editingTemplateId={editingTemplateId} setEditingTemplateId={setEditingTemplateId} editContent={editContent} setEditContent={setEditContent} saving={saving} fetchTemplates={fetchInitialData} />}
                {activeTab === 'Alertas' && <AlertsTab />}
                {activeTab === 'Assinatura' && <SubscriptionTab barbershop={barbershop} refetchShop={refetchShop} />}
            </div>
        </div>
    );
}

function GeneralTab({ barbershop, setBarbershop }) {
    return (
        <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-soft space-y-8">
            <div>
                <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /> Informações do Negócio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground ml-1">Nome da Empresa</label>
                        <input
                            value={barbershop.commercialName || barbershop.name || ''}
                            onChange={e => setBarbershop({ ...barbershop, name: e.target.value, commercialName: e.target.value })}
                            className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-medium text-foreground"
                            placeholder="Ex: Barbearia do João"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground ml-1">Link de Agendamento (Slug)</label>
                        <input value={barbershop.slug || ''} onChange={e => setBarbershop({ ...barbershop, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-mono text-sm text-primary" placeholder="minha-barbearia" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground ml-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Endereço Completo (Visível no App)</label>
                    <input value={barbershop.address || ''} onChange={e => setBarbershop({ ...barbershop, address: e.target.value })} className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-medium text-foreground" placeholder="Rua Exemplo, 123 - Centro" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Rua / Logradouro</label>
                    <input value={barbershop.street || ''} onChange={e => setBarbershop({ ...barbershop, street: e.target.value })} className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-medium text-foreground" placeholder="Rua Augusta" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Número</label>
                    <input value={barbershop.number || ''} onChange={e => setBarbershop({ ...barbershop, number: e.target.value })} className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-medium text-foreground" placeholder="100" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Bairro</label>
                    <input value={barbershop.neighborhood || ''} onChange={e => setBarbershop({ ...barbershop, neighborhood: e.target.value })} className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-medium text-foreground" placeholder="Centro" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Cidade</label>
                    <input value={barbershop.city || ''} onChange={e => setBarbershop({ ...barbershop, city: e.target.value })} className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-medium text-foreground" placeholder="São Paulo" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Estado (UF)</label>
                    <input value={barbershop.state || ''} onChange={e => setBarbershop({ ...barbershop, state: e.target.value?.toUpperCase() })} maxLength={2} className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-medium text-foreground" placeholder="SP" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Telefone para Contato</label>
                    <input value={barbershop.phone || ''} onChange={e => setBarbershop({ ...barbershop, phone: e.target.value })} className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-medium text-foreground" placeholder="(11) 99999-9999" />
                </div>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-border">
                <label className="text-xs font-semibold text-muted-foreground ml-1 flex items-center gap-1"><AlignLeft className="w-3 h-3" /> Descrição / Bio</label>
                <textarea value={barbershop.description || ''} onChange={e => setBarbershop({ ...barbershop, description: e.target.value })} className="w-full h-32 p-4 bg-muted border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-medium text-foreground resize-none" placeholder="Conte um pouco sobre sua barbearia para seus clientes..." />
            </div>

            <div className="pt-6 border-t border-border space-y-6">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">Redes Sociais</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground ml-1 flex items-center gap-1">Instagram (@usuario ou link)</label>
                        <input value={barbershop.instagramUrl || ''} onChange={e => setBarbershop({ ...barbershop, instagramUrl: e.target.value })} className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-medium text-foreground" placeholder="https://instagram.com/..." />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground ml-1 flex items-center gap-1">Facebook</label>
                        <input value={barbershop.facebookUrl || ''} onChange={e => setBarbershop({ ...barbershop, facebookUrl: e.target.value })} className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-medium text-foreground" placeholder="https://facebook.com/..." />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground ml-1 flex items-center gap-1">YouTube</label>
                        <input value={barbershop.youtubeUrl || ''} onChange={e => setBarbershop({ ...barbershop, youtubeUrl: e.target.value })} className="w-full h-11 px-4 bg-muted border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-medium text-foreground" placeholder="https://youtube.com/..." />
                    </div>
                </div>
            </div>
        </div>
    );
}

function VisualTab({ barbershop, setBarbershop }) {
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBannerIdx, setUploadingBannerIdx] = useState(null);

    const compressImage = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => resolve(event.target.result);
        });
    };

    const addBanner = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadingBannerIdx('new');
            const dataUri = await compressImage(file);
            const newBanners = [...(barbershop.bannerUrls || []), dataUri];
            setBarbershop({ ...barbershop, bannerUrls: newBanners });
            setUploadingBannerIdx(null);
        }
    };

    const removeBanner = (index) => {
        const newBanners = barbershop.bannerUrls.filter((_, i) => i !== index);
        setBarbershop({ ...barbershop, bannerUrls: newBanners });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in slide-in-from-bottom-4">
            <div className="lg:col-span-2 bg-card p-6 md:p-8 rounded-xl border border-border shadow-soft space-y-10">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Identidade Visual</h2>

                {/* Logo Upload */}
                <div className="space-y-4">
                    <div>
                        <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Logotipo</h4>
                        <p className="text-muted-foreground text-[10px] font-medium">Recomendado: 512x512px (PNG ou SVG).</p>
                    </div>
                    <div className="relative w-40 h-40 bg-muted border-2 border-dashed border-border rounded-full flex items-center justify-center overflow-hidden hover:border-primary group transition-all shadow-sm">
                        {barbershop.logoUrl ? (
                            <img src={barbershop.logoUrl} className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="w-8 h-8 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                        )}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setUploadingLogo(true);
                                const dataUri = await compressImage(file);
                                setBarbershop({ ...barbershop, logoUrl: dataUri });
                                setUploadingLogo(false);
                            }
                        }} />
                        {uploadingLogo && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Banners Manager */}
                <div className="space-y-4 pt-6 border-t border-border">
                    <div>
                        <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Imagens de Capa (Banners)</h4>
                        <p className="text-muted-foreground text-[10px] font-medium">Você pode adicionar múltiplas fotos. Elas aparecerão no topo da sua página pública.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {(barbershop.bannerUrls || []).map((url, idx) => (
                            <div key={idx} className="relative aspect-[16/9] bg-muted rounded-xl border border-border overflow-hidden group shadow-sm">
                                <img src={url} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeBanner(idx)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}

                        <div className="relative aspect-[16/9] bg-muted border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:border-primary group transition-all cursor-pointer overflow-hidden shadow-sm">
                            {uploadingBannerIdx === 'new' ? (
                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-6 h-6 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Adicionar</span>
                                </>
                            )}
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={addBanner} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Smartphone Mockup Preview */}
            <div className="lg:col-span-1 flex justify-center sticky top-8">
                <div className="relative w-[280px] h-[580px] bg-[#09090b] rounded-xl border-[8px] border-[#18181b] shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col">
                    {/* Notch */}
                    <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                        <div className="w-28 h-5 bg-[#18181b] rounded-b-2xl"></div>
                    </div>

                    {/* Screen Content */}
                    <div className="w-full flex-1 bg-background overflow-y-auto scrollbar-hide relative flex flex-col">
                        {/* Header Banner */}
                        <div className="w-full h-36 bg-muted relative shrink-0">
                            {barbershop.bannerUrls && barbershop.bannerUrls.length > 0 ? (
                                <img src={barbershop.bannerUrls[0]} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-primary/30" />
                                </div>
                            )}
                        </div>

                        {/* Logo & Info */}
                        <div className="px-4 -mt-10 relative z-10 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-card rounded-full border-4 border-background overflow-hidden shadow-md mb-3 flex items-center justify-center">
                                {barbershop.logoUrl ? (
                                    <img src={barbershop.logoUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <Camera className="w-6 h-6 text-muted-foreground/30" />
                                )}
                            </div>
                            <h3 className="font-bold text-[15px] text-foreground leading-tight tracking-tight">{barbershop.name || 'Sua Barbearia'}</h3>
                            <p className="text-[10px] text-muted-foreground mt-1.5 px-2 line-clamp-3 leading-relaxed">
                                {barbershop.description || 'A bio da sua barbearia vai aparecer aqui. Escreva algo bacana para atrair seus clientes!'}
                            </p>
                        </div>

                        {/* Mock Buttons */}
                        <div className="px-4 mt-6 space-y-2.5">
                            <div className="w-full h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-[11px] shadow-sm tracking-wide uppercase">
                                Agendar Horário
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="h-9 bg-muted rounded-lg border border-border flex items-center justify-center text-[10px] font-bold text-foreground uppercase">Serviços</div>
                                <div className="h-9 bg-muted rounded-lg border border-border flex items-center justify-center text-[10px] font-bold text-foreground uppercase">Equipe</div>
                            </div>
                        </div>

                        {/* Mock Content */}
                        <div className="px-4 mt-6 space-y-3 pb-6 flex-1">
                            <div className="w-20 h-3 bg-muted rounded-full"></div>
                            <div className="w-full h-16 bg-muted/50 rounded-xl border border-border/50"></div>
                            <div className="w-full h-16 bg-muted/50 rounded-xl border border-border/50"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RulesTab({ barbershop, setBarbershop }) {
    return (
        <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-soft">
            <h2 className="text-lg font-bold text-foreground mb-8 flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Regras e Políticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted p-6 rounded-xl border border-border flex items-center justify-between">
                    <div className="space-y-1">
                        <h4 className="font-bold text-foreground text-sm">Protocolo No-Show</h4>
                        <p className="text-muted-foreground text-[10px]">Penalidade automática para faltas sem aviso prévio.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={barbershop.noShowEnabled || false} onChange={e => setBarbershop({ ...barbershop, noShowEnabled: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                </div>
                {barbershop.noShowEnabled && (
                    <div className="bg-muted p-6 rounded-xl border border-border space-y-3 animate-in fade-in slide-in-from-left-4">
                        <label className="text-xs font-semibold text-muted-foreground">Percentual da Multa (%)</label>
                        <input type="number" value={barbershop.noShowPercent || 0} onChange={e => setBarbershop({ ...barbershop, noShowPercent: parseInt(e.target.value) })} className="w-full h-10 px-4 bg-card border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none transition font-bold" />
                    </div>
                )}
            </div>
        </div>
    );
}

function CommunicationTab({ barbershop, setBarbershop, templates, editingTemplateId, setEditingTemplateId, editContent, setEditContent, saving, fetchTemplates }) {
    const [waStatus, setWaStatus] = useState({ status: 'LOADING' });
    const [qrCode, setQrCode] = useState(null);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        if (!barbershop?.id) return;

        const checkStatus = async () => {
            try {
                const res = await api.get(`/whatsapp/status/${barbershop.id}`);
                setWaStatus(res.data);

                // If we were waiting for QR but now it's connected, clear QR
                if (res.data.status === 'CONNECTED') {
                    setQrCode(null);
                }
            } catch (e) {
                console.error('Error fetching WA status:', e);
                setWaStatus({ status: 'ERROR' });
            }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [barbershop?.id]);

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const res = await api.post(`/whatsapp/connect/${barbershop.id}`);
            if (res.data.qr) {
                setQrCode(res.data.qr);
            }
            setWaStatus({ status: 'WAITING_QR' });
        } catch (error) {
            console.error('Failed to connect WhatsApp:', error);
            alert('Falha ao iniciar conexão com WhatsApp');
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Tem certeza que deseja desconectar o WhatsApp?')) return;
        try {
            await api.delete(`/whatsapp/disconnect/${barbershop.id}`);
            setWaStatus({ status: 'DISCONNECTED' });
            setQrCode(null);
        } catch (error) {
            console.error('Failed to disconnect WhatsApp:', error);
        }
    };

    const templateTypes = { 'CONFIRMATION_REQUEST': 'Solicitação de Confirmação', 'REMINDER': 'Lembrete de Agendamento', 'CANCELLATION': 'Aviso de Cancelamento' };

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-soft">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Smartphone className="w-5 h-5 text-[#25D366]" /> WhatsApp Smart Bot</h2>
                        <p className="text-muted-foreground text-xs font-medium">Automação inteligente de disparos e confirmações.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {waStatus.status === 'CONNECTED' ? (
                            <button
                                onClick={handleDisconnect}
                                className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                            >
                                Desconectar
                            </button>
                        ) : (
                            <button
                                onClick={handleConnect}
                                disabled={connecting || waStatus.status === 'WAITING_QR'}
                                className="px-4 py-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition-all disabled:opacity-50"
                            >
                                {connecting ? 'Iniciando...' : 'Conectar WhatsApp'}
                            </button>
                        )}

                        <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${waStatus.status === 'CONNECTED' ? 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20' : 'bg-muted text-muted-foreground border-border'}`}>
                            {waStatus.status === 'CONNECTED' ? <CheckCircle className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                {waStatus.status === 'CONNECTED' ? 'Conectado' :
                                    waStatus.status === 'WAITING_QR' ? 'Aguardando QR' : 'Desconectado'}
                            </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={barbershop.whatsappAutoReply || false} onChange={e => setBarbershop({ ...barbershop, whatsappAutoReply: e.target.checked })} className="sr-only peer" />
                            <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-[#25D366] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>
                    </div>
                </div>

                {/* QR Code Display Section */}
                {waStatus.status === 'WAITING_QR' && qrCode && (
                    <div className="mt-8 flex flex-col items-center justify-center p-8 bg-muted/30 rounded-xl border border-dashed border-border animate-in zoom-in-95 duration-300">
                        <div className="bg-white p-4 rounded-xl shadow-xl mb-6">
                            <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
                        </div>
                        <div className="text-center max-w-sm">
                            <h4 className="font-bold text-foreground mb-2">Escaneie o QR Code</h4>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Abra o WhatsApp no seu celular, vá em **Aparelhos Conectados** e escaneie o código acima para ativar o Smart Bot.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {templates.map(tmpl => {
                    const isEditing = editingTemplateId === tmpl.id;
                    return (
                        <div key={tmpl.id} className="bg-card p-6 rounded-xl border border-border shadow-soft group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-foreground text-sm">{templateTypes[tmpl.type] || tmpl.type}</h3>
                                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Template Ativo</span>
                                </div>
                                <button onClick={() => { setEditingTemplateId(tmpl.id); setEditContent(tmpl.content); }} className="px-3 py-1 bg-muted border border-border rounded-lg text-[9px] font-bold text-foreground uppercase hover:bg-card transition-colors">Editar</button>
                            </div>
                            {isEditing ? (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full h-28 bg-muted border border-border rounded-lg p-4 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" />
                                    <div className="flex justify-end gap-3 text-[10px] font-bold uppercase">
                                        <button onClick={() => setEditingTemplateId(null)} className="text-muted-foreground hover:text-foreground">Cancelar</button>
                                        <button onClick={() => setEditingTemplateId(null)} className="bg-primary text-white px-4 py-2 rounded-lg">Confirmar Alteração</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-muted/50 p-4 rounded-xl border border-border text-xs leading-relaxed text-muted-foreground italic relative">
                                    <MessageSquare className="w-4 h-4 absolute -top-2 -left-2 text-primary opacity-20" />
                                    "{tmpl.content}"
                                </div>
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
        <div className="bg-card p-16 rounded-xl border border-border shadow-soft text-center space-y-5">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto border border-primary/10">
                <BellRing className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <div className="max-w-xs mx-auto space-y-2">
                <h3 className="text-lg font-bold text-foreground">Motor de Alertas Ativo</h3>
                <p className="text-muted-foreground text-xs font-medium leading-relaxed">
                    Seu sistema está monitorando agendamentos e enviando notificações em tempo real.
                </p>
            </div>
            <div className="pt-4">
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-full border border-primary/20">Protocolo de Alta Fidelidade</span>
            </div>
        </div>
    );
}

function SubscriptionTab({ barbershop, refetchShop }) {
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const saasPlanDetails = {
        SOLO: { name: 'Básico (Solo)', maxBarbers: 1, price: 'R$ 79,90' },
        BASIC: { name: 'Médio (Basic)', maxBarbers: 5, price: 'R$ 109,90' },
        PRO: { name: 'Pro', maxBarbers: 15, price: 'R$ 164,50' },
        ENTERPRISE: { name: 'Empire (Enterprise)', maxBarbers: 100, price: 'R$ 219,90' }
    };

    const currentPlan = saasPlanDetails[barbershop?.saasPlan] || { name: 'Período de Testes', maxBarbers: 1, price: 'Grátis' };
    const statusMap = {
        ACTIVE: { label: 'Ativo', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
        TRIAL: { label: 'Período de Testes (Trial)', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
        OVERDUE: { label: 'Atrasado', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
        CANCELLED: { label: 'Cancelado', color: 'text-red-500 bg-red-500/10 border-red-500/20' }
    };

    const currentStatus = statusMap[barbershop?.subscriptionStatus] || { label: barbershop?.subscriptionStatus || 'Inativo', color: 'text-muted-foreground bg-muted border-border' };

    const handleCancel = async () => {
        if (confirmText.toLowerCase() !== 'cancelar') {
            alert('Por favor, digite "cancelar" para confirmar.');
            return;
        }

        setCancelling(true);
        try {
            await api.post('/barbershops/cancel-saas');
            alert('Sua assinatura foi cancelada com sucesso. Seu acesso será desativado.');
            setShowCancelModal(false);
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Erro ao processar o cancelamento da assinatura.');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-soft space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" /> Detalhes da sua Assinatura SaaS
                    </h2>
                    <p className="text-muted-foreground text-xs font-medium">Visualização do seu plano de contratação e faturamento do sistema.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Plan Card */}
                    <div className="bg-muted/40 p-5 rounded-lg border border-border flex flex-col justify-between space-y-4">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Plano Contratado</span>
                        <div>
                            <h3 className="text-xl font-bold text-foreground">{currentPlan.name}</h3>
                            <p className="text-sm font-semibold text-primary mt-1">{currentPlan.price} <span className="text-xs text-muted-foreground font-normal">/ mês</span></p>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">Limite de até {currentPlan.maxBarbers} profissionais ativos.</span>
                    </div>

                    {/* Status Card */}
                    <div className="bg-muted/40 p-5 rounded-lg border border-border flex flex-col justify-between space-y-4">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status do Acesso</span>
                        <div>
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${currentStatus.color}`}>
                                {currentStatus.label}
                            </span>
                        </div>
                        {barbershop?.trialEndsAt && barbershop?.subscriptionStatus === 'TRIAL' && (
                            <span className="text-[10px] text-muted-foreground font-medium">
                                Expira em: {new Date(barbershop.trialEndsAt).toLocaleDateString()}
                            </span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-medium">&nbsp;</span>
                    </div>

                    {/* Billing Info */}
                    <div className="bg-muted/40 p-5 rounded-lg border border-border flex flex-col justify-between space-y-4">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Faturamento</span>
                        <div className="space-y-1">
                            <p className="text-xs text-foreground font-semibold flex items-center gap-1">
                                Integrado via Gateway Externo
                            </p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Kirvano, Kiwify, Hotmart ou Kaktus.
                            </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">Verifique sua fatura no seu e-mail de compra.</span>
                    </div>
                </div>

                {barbershop?.subscriptionStatus !== 'CANCELLED' && (
                    <div className="pt-4 border-t border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="max-w-md space-y-1">
                            <h4 className="text-sm font-bold text-foreground">Deseja cancelar sua assinatura?</h4>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Ao cancelar, você desativa o acesso ao sistema. Lembre-se também de cancelar a recorrência no seu cartão diretamente na plataforma de pagamento (Kirvano, Kiwify, Hotmart ou Kaktus) para evitar cobranças futuras.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Cancelar Assinatura
                        </button>
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-md bg-card border border-border rounded-xl overflow-hidden shadow-2xl space-y-6 p-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
                                <Trash2 className="w-5 h-5" /> Cancelar Assinatura do SaaS
                            </h3>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Você está prestes a cancelar sua assinatura do **{barbershop.name || 'sistema'}**. 
                                Isso bloqueará o seu acesso ao painel.
                            </p>
                        </div>

                        <div className="bg-muted p-4 rounded-lg space-y-3 border border-border">
                            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-primary" /> Importante sobre a Cobrança:
                            </h4>
                            <p className="text-muted-foreground text-[11px] leading-relaxed">
                                Como o seu pagamento foi feito por um link externo de checkout, para que novas parcelas **não sejam cobradas no seu cartão**, acesse a plataforma onde comprou (ex: **Kirvano, Kiwify, Hotmart ou Kaktus**) e cancele a assinatura lá.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">
                                Digite <strong>cancelar</strong> abaixo para confirmar:
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder='Digite "cancelar"'
                                className="w-full bg-muted border border-border rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-primary transition"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => { setShowCancelModal(false); setConfirmText(''); }}
                                className="px-5 h-10 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg font-bold text-xs uppercase tracking-wider transition"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={cancelling || confirmText.toLowerCase() !== 'cancelar'}
                                className="px-5 h-10 bg-red-500 text-white hover:bg-red-600 rounded-lg font-bold text-xs uppercase tracking-wider transition disabled:opacity-40 flex items-center gap-2"
                            >
                                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Cancelamento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

