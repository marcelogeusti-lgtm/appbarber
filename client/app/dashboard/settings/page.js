'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import {
    Settings, Save, MapPin, Phone, Hash, ChevronDown,
    Image as ImageIcon, Shield, MessageSquare, Zap,
    Globe, Smartphone, CreditCard, ExternalLink, CheckCircle
} from 'lucide-react';
import IntegrationSettings from '../../../components/settings/IntegrationSettings';
import Link from 'next/link';

export default function SettingsPage() {
    const [barbershop, setBarbershop] = useState({ name: '', slug: '', address: '', phone: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeAccordion, setActiveAccordion] = useState('perfil');
    const [isMaster, setIsMaster] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setIsMaster(user.role === 'SUPER_ADMIN');
        }
        fetchBarbershop();
    }, []);

    const fetchBarbershop = async () => {
        try {
            const res = await api.get('/barbershops/me');
            setBarbershop(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
            setMessage({ type: 'error', text: 'Erro ao carregar dados da barbearia.' });
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!barbershop.slug || barbershop.slug.trim().length === 0) {
            setMessage({ type: 'error', text: 'O Link (Slug) não pode ficar vazio.' });
            return;
        }

        setSaving(true);
        setMessage(null);
        try {
            await api.put(`/barbershops/${barbershop.id}`, barbershop);
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.barbershop) user.barbershop = { ...user.barbershop, ...barbershop };
                if (user.ownedBarbershops?.[0]) user.ownedBarbershops[0] = { ...user.ownedBarbershops[0], ...barbershop };
                localStorage.setItem('user', JSON.stringify(user));
            }
            setMessage({ type: 'success', text: 'Configurações atualizadas com sucesso!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao salvar configurações' });
        } finally {
            setSaving(false);
        }
    };

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            if (!file.type.match('image.*')) return reject(new Error('Arquivo não é uma imagem'));
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
            };
            reader.onerror = error => reject(error);
        });
    };

    if (loading) return <div className="p-10 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Sincronizando Ecossistema NEXT...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-10 rounded-[2.5rem] border border-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] -mr-40 -mt-40" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-4 bg-primary/10 text-primary rounded-[1.5rem] border border-primary/20 shadow-xl shadow-primary/5">
                        <Settings className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Configurações</h1>
                        <p className="text-muted-foreground text-sm font-medium italic mt-1 uppercase tracking-widest text-[10px] opacity-80">Orquestração técnica e visual da sua unidade.</p>
                    </div>
                </div>
                <button
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="relative z-10 flex items-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                >
                    {saving ? 'Gravando...' : <><Save className="w-5 h-5" /> Salvar Tudo</>}
                </button>
            </header>

            {message && (
                <div className={`p-6 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] text-center animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-4">
                {/* 1. PERFIL DA BARBEARIA */}
                <AccordionItem
                    id="perfil"
                    title="Dados da Barbearia"
                    icon={<Globe className="w-5 h-5" />}
                    desc="Informações essenciais de contato e localização."
                    active={activeAccordion}
                    setActive={setActiveAccordion}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Nome Comercial</label>
                            <input
                                value={barbershop.name}
                                onChange={e => setBarbershop({ ...barbershop, name: e.target.value })}
                                className="w-full p-5 bg-background border border-border rounded-2xl focus:ring-4 ring-primary/10 outline-none transition font-bold text-lg text-foreground shadow-inner"
                                required
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Link Personalizado (Slug)</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-[10px] uppercase tracking-widest">/agendamento/</span>
                                <input
                                    value={barbershop.slug}
                                    onChange={e => setBarbershop({ ...barbershop, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="w-full p-5 pl-36 bg-background border border-border rounded-2xl focus:ring-4 ring-primary/10 outline-none transition font-mono text-sm text-primary shadow-inner"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Endereço Físico</label>
                            <input
                                value={barbershop.address}
                                onChange={e => setBarbershop({ ...barbershop, address: e.target.value })}
                                className="w-full p-5 bg-background border border-border rounded-2xl focus:ring-4 ring-primary/10 outline-none transition font-bold text-foreground shadow-inner"
                                placeholder="Rua, Número, Bairro..."
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">WhatsApp / Contato Direto</label>
                            <input
                                value={barbershop.phone}
                                onChange={e => setBarbershop({ ...barbershop, phone: e.target.value })}
                                className="w-full p-5 bg-background border border-border rounded-2xl focus:ring-4 ring-primary/10 outline-none transition font-bold text-foreground shadow-inner"
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                    </div>
                </AccordionItem>

                {/* 2. IDENTIDADE VISUAL */}
                <AccordionItem
                    id="branding"
                    title="Identidade Visual"
                    icon={<ImageIcon className="w-5 h-5" />}
                    desc="Marca, logos e portfólio de fotos do espaço."
                    active={activeAccordion}
                    setActive={setActiveAccordion}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Logo da Barbearia</label>
                            <div className="bg-background border border-border rounded-3xl p-8 flex flex-col items-center justify-center gap-6 group hover:border-primary/50 transition shadow-inner">
                                <div className="w-36 h-36 bg-muted rounded-[2rem] flex items-center justify-center overflow-hidden border-2 border-border relative shadow-2xl">
                                    {barbershop.logoUrl ? (
                                        <img src={barbershop.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-5xl font-black text-primary uppercase">{barbershop.name?.[0]}</span>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                try {
                                                    const compressedDataUrl = await compressImage(file);
                                                    setBarbershop({ ...barbershop, logoUrl: compressedDataUrl });
                                                } catch (err) {
                                                    alert('Erro ao processar imagem: ' + err.message);
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest group-hover:text-primary transition">Toque para atualizar</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Fotos do Espaço ({barbershop.bannerUrls?.length || 0}/3)</label>
                            <div className="grid grid-cols-1 gap-4">
                                {(barbershop.bannerUrls || []).map((url, idx) => (
                                    <div key={idx} className="relative aspect-video bg-muted rounded-2xl overflow-hidden group border border-border shadow-sm">
                                        <img src={url} alt={`Banner ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newBanners = barbershop.bannerUrls.filter((_, i) => i !== idx);
                                                setBarbershop({ ...barbershop, bannerUrls: newBanners });
                                            }}
                                            className="absolute inset-0 bg-destructive/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                        >
                                            Remover Foto
                                        </button>
                                    </div>
                                ))}
                                {(barbershop.bannerUrls?.length || 0) < 3 && (
                                    <div className="relative aspect-video bg-background border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center hover:bg-muted hover:border-primary/50 transition-all cursor-pointer group">
                                        <span className="text-3xl text-muted-foreground mb-2 group-hover:scale-110 transition-transform">+</span>
                                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em]">Adicionar Foto (16:9)</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    try {
                                                        const compressedDataUrl = await compressImage(file);
                                                        const newBanners = [...(barbershop.bannerUrls || []), compressedDataUrl];
                                                        setBarbershop({ ...barbershop, bannerUrls: newBanners });
                                                    } catch (err) {
                                                        alert('Erro ao processar imagem');
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </AccordionItem>

                {/* 3. REGRAS E POLÍTICAS */}
                <AccordionItem
                    id="regras"
                    title="Regras e Políticas"
                    icon={<Shield className="w-5 h-5" />}
                    desc="Defina multas, taxas de no-show e bloqueios."
                    active={activeAccordion}
                    setActive={setActiveAccordion}
                >
                    <div className="bg-background/50 p-8 rounded-[2rem] border border-border space-y-8 shadow-inner">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="text-sm font-black text-foreground uppercase tracking-tight">Habilitar Taxa de No-Show</h4>
                                <p className="text-muted-foreground text-[10px] font-medium italic">Clientes que faltarem sem avisar serão cobrados automaticamente no próximo agendamento.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={barbershop.noShowEnabled || false}
                                    onChange={e => setBarbershop({ ...barbershop, noShowEnabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                            </label>
                        </div>

                        {barbershop.noShowEnabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Porcentagem do Serviço (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={barbershop.noShowPercent || 0}
                                        onChange={e => setBarbershop({ ...barbershop, noShowPercent: parseFloat(e.target.value) })}
                                        className="w-full p-5 bg-background border border-border rounded-2xl focus:ring-4 ring-primary/10 outline-none transition font-black text-foreground shadow-inner"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">Justificativa no Comprovante</label>
                                    <input
                                        value={barbershop.noShowText || ''}
                                        onChange={e => setBarbershop({ ...barbershop, noShowText: e.target.value })}
                                        className="w-full p-5 bg-background border border-border rounded-2xl focus:ring-4 ring-primary/10 outline-none transition font-bold text-foreground text-sm shadow-inner"
                                        placeholder="Ex: Taxa referente ao não comparecimento anterior."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </AccordionItem>

                {/* 4. COMUNICAÇÃO COM CLIENTES */}
                <AccordionItem
                    id="comunicacao"
                    title="Comunicação com Clientes"
                    icon={<MessageSquare className="w-5 h-5" />}
                    desc="Gestão de mensagens e lembretes automáticos."
                    active={activeAccordion}
                    setActive={setActiveAccordion}
                >
                    <div className="space-y-6">
                        <div className="bg-background/50 p-8 rounded-[2.5rem] border border-border shadow-inner flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex gap-6 items-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                                    <Smartphone className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-black text-foreground uppercase tracking-tight">Número para Envios Automáticos</h4>
                                    <p className="text-muted-foreground text-[10px] font-medium italic mt-1 leading-relaxed max-w-sm">Status da sua conexão para lembretes via WhatsApp Business.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Link
                                    href="/dashboard/settings/notifications"
                                    className="px-8 py-4 bg-background border border-border hover:border-primary/50 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center gap-2 group"
                                >
                                    <Zap className="w-4 h-4 text-primary group-hover:animate-pulse" /> Configurar Mensagens
                                </Link>
                            </div>
                        </div>

                        {/* Hidden Tech Info - Accessible only for master */}
                        {isMaster && (
                            <div className="bg-destructive/5 p-6 rounded-2xl border border-destructive/10 animate-in fade-in slide-in-from-top-4">
                                <h5 className="text-[9px] font-black text-destructive uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Shield className="w-3 h-3" /> Camada Técnica de Governança (Master Only)
                                </h5>
                                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                    Chave de API e endpoint de comunicação são gerenciados automaticamente pelo **NEXT Maestro**.
                                    Não recomendamos a alteração manual dessas configurações para evitar interrupções no serviço.
                                </p>
                            </div>
                        )}
                    </div>
                </AccordionItem>

                {/* 5. INTEGRAÇÕES - Master Only */}
                {isMaster && (
                    <AccordionItem
                        id="integracoes"
                        title="Conexões Externas"
                        icon={<Zap className="w-5 h-5" />}
                        desc="Google Calendar, Pagamentos e ferramentas extras."
                        active={activeAccordion}
                        setActive={setActiveAccordion}
                    >
                        <IntegrationSettings />
                    </AccordionItem>
                )}

                {/* 6. NOTIFICAÇÕES */}
                <AccordionItem
                    id="notificacoes"
                    title="Alertas do Sistema"
                    icon={<Smartphone className="w-5 h-5" />}
                    desc="Push Notifications e alertas operacionais."
                    active={activeAccordion}
                    setActive={setActiveAccordion}
                >
                    <div className="bg-primary/5 p-10 rounded-[3rem] border border-primary/20 text-center space-y-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20 shadow-inner">
                            <Zap className="w-10 h-10 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight flex items-center justify-center gap-3">
                                <CheckCircle className="w-6 h-6 text-primary" /> Seu sistema envia notificações automáticas
                            </h3>
                            <p className="text-muted-foreground text-xs font-medium italic max-w-lg mx-auto leading-relaxed">
                                Agendamentos, cancelamentos e alterações de horário são notificados instantaneamente para você e seus clientes. Tudo configurado e otimizado por padrão.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-3 bg-background border border-border px-8 py-3 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                            <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Fluxo de Notificação Ativo</span>
                        </div>
                    </div>
                </AccordionItem>
            </div>

            {/* Footer Notice */}
            <div className="bg-card border-l-4 border-primary rounded-3xl p-10 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em]">Protocolo de Segurança</h4>
                </div>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed italic uppercase tracking-tighter max-w-2xl">
                    ⚠️ Ao alterar o **Link Personalizado (Slug)**, o acesso antigo deixará de funcionar imediatamente. Certifique-se de atualizar o link em sua biografia do Instagram para evitar perda de clientes.
                </p>
            </div>
        </div>
    );
}

function AccordionItem({ id, title, icon, desc, active, setActive, children }) {
    const isOpen = active === id;

    return (
        <div className={`bg-card rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isOpen ? 'border-primary/30 shadow-2xl' : 'border-border shadow-sm'}`}>
            <button
                onClick={() => setActive(isOpen ? null : id)}
                className="w-full p-8 md:p-10 flex items-center justify-between hover:bg-muted/30 transition-colors text-left group"
            >
                <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${isOpen ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className={`text-xl font-black uppercase tracking-tight transition-colors ${isOpen ? 'text-primary' : 'text-foreground'}`}>{title}</h3>
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60 italic">{desc}</p>
                    </div>
                </div>
                <div className={`w-12 h-12 rounded-full border border-border flex items-center justify-center transition-all duration-500 ${isOpen ? 'rotate-180 bg-primary/20 border-primary/20 text-primary' : 'group-hover:bg-muted text-muted-foreground'}`}>
                    <ChevronDown className="w-6 h-6" />
                </div>
            </button>

            <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-10 pt-0 border-t border-border/50 mt-2">
                    <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
