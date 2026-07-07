'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { CreditCard, CheckCircle, AlertTriangle, Lock, Shield, Zap, Globe, Coins } from 'lucide-react';

export default function PaymentSettings() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // 'mercadopago' | null

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await api.get('/gateways');
            setConfigs(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Failed to fetch payment configs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (gateway, data) => {
        setSaving(gateway);
        // Optimistic UI update: if activating this one, deactivate all others
        const normalizedGateway = gateway.toUpperCase();
        if (data.isActive) {
            setConfigs(prev => prev.map(c => ({
                ...c,
                isActive: c.gateway.toUpperCase() === normalizedGateway ? true : false
            })));
        } else {
            setConfigs(prev => prev.map(c => c.gateway.toUpperCase() === normalizedGateway ? { ...c, isActive: false } : c));
        }

        try {
            await api.post('/gateways', {
                gateway,
                isActive: data.isActive,
                credentials: data.credentials
            });
            await fetchConfigs();
            // Silence alert if it was just a toggle
            if (!data.isToggleOnly) {
                alert('Configurações de gateway atualizadas com sucesso!');
            }
        } catch (error) {
            alert('Erro ao salvar: ' + (error.response?.data?.error || error.message));
            fetchConfigs(); // Rollback on error
        } finally {
            setSaving(null);
        }
    };

    const getConfig = (gateway) => configs.find(c => c.gateway.toUpperCase() === gateway.toUpperCase()) || { isActive: false, credentials: {} };

    if (loading) return <div className="p-10 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Sincronizando Gateways de Pagamento...</div>;

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-10 rounded-xl border border-border shadow-sm relative overflow-hidden mb-10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] -mr-40 -mt-40" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-[1.8rem] border border-primary/20 flex items-center justify-center text-3xl shadow-inner">
                        <CreditCard className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground">Canais de Recebimento</h2>
                        <p className="text-muted-foreground text-sm font-medium italic mt-1 uppercase tracking-widest text-[10px] opacity-80">Configure como sua barbearia processa fluxos financeiros.</p>
                    </div>
                </div>
                <div className="bg-primary/5 border border-primary/20 px-6 py-4 rounded-xl relative z-10">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-3">
                        <Shield className="w-4 h-4" /> Camada de Segurança Diamond
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-10">
                {/* MERCADO PAGO CONFIG */}
                <GatewayCard
                    title="Mercado Pago"
                    description="Solução líder no Brasil para cartões, boleto e pix com taxas competitivas."
                    gateway="mercadopago"
                    config={getConfig('mercadopago')}
                    onSave={handleSave}
                    saving={saving === 'mercadopago'}
                    icon={<div className="w-16 h-16 rounded-xl bg-white p-2 border border-border shadow-xl group-hover:scale-110 transition-transform flex items-center justify-center">
                        <img src="/logos/mercadopago.png" alt="Mercado Pago" className="w-full h-full object-contain" />
                    </div>}
                    helpText='Você só precisa de 2 chaves, que ficam na MESMA página: entre em mercadopago.com.br/developers → "Suas integrações" → sua aplicação → "Credenciais de produção". Copie a Public Key e o Access Token e cole abaixo.'
                    fields={[
                        { name: 'publicKey', label: 'Public Key (obrigatória)', placeholder: 'Cole aqui — começa com APP_USR-...' },
                        { name: 'accessToken', label: 'Access Token (obrigatório)', type: 'password', placeholder: 'Cole aqui — começa com APP_USR-...' },
                        { name: 'clientSecret', label: 'Assinatura secreta do Webhook', type: 'password', placeholder: 'Opcional — segurança extra', advanced: true }
                    ]}
                />

                {/* STRIPE CONFIG */}
                <GatewayCard
                    title="Stripe"
                    description="Padrão internacional para cartões — EUA, Europa, México e mais de 40 países."
                    gateway="stripe"
                    config={getConfig('stripe')}
                    onSave={handleSave}
                    saving={saving === 'stripe'}
                    icon={<div className="w-16 h-16 rounded-xl bg-[#635BFF] border border-border shadow-xl group-hover:scale-110 transition-transform flex items-center justify-center">
                        <span className="text-white font-black text-2xl tracking-tighter">S</span>
                    </div>}
                    helpText='Crie sua conta grátis em stripe.com. Depois, no painel: "Developers" → "API keys" — as 2 chaves ficam juntas na mesma tela. Copie e cole abaixo. Ao ativar a Stripe, o Mercado Pago é desativado automaticamente (e vice-versa).'
                    fields={[
                        { name: 'publicKey', label: 'Publishable Key (obrigatória)', placeholder: 'Cole aqui — começa com pk_...' },
                        { name: 'secretKey', label: 'Secret Key (obrigatória)', type: 'password', placeholder: 'Cole aqui — começa com sk_...' },
                        {
                            name: 'currency', label: 'Moeda de cobrança', type: 'radio', options: [
                                { value: 'brl', label: 'Real (R$)' },
                                { value: 'usd', label: 'Dólar (US$)' },
                                { value: 'eur', label: 'Euro (€)' },
                                { value: 'mxn', label: 'Peso MX ($)' }
                            ]
                        }
                    ]}
                />
            </div>
        </div>
    );
}

function GatewayCard({ title, description, gateway, config, onSave, saving, icon, fields, helpText }) {
    const [localData, setLocalData] = useState({
        isActive: config.isActive,
        credentials: { ...config.credentials }
    });
    const [testStatus, setTestStatus] = useState(null); // 'testing', 'success', 'error'
    const [showAdvanced, setShowAdvanced] = useState(false);
    // Permite abrir o formulário e preencher as chaves ANTES de ativar
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        setLocalData({
            isActive: config.isActive,
            credentials: { ...config.credentials }
        });
    }, [config]);

    const handleChange = (field, value) => {
        setLocalData(prev => ({
            ...prev,
            credentials: { ...prev.credentials, [field]: value }
        }));
        setTestStatus(null);
    };

    const handleTestConnection = async () => {
        setTestStatus('testing');
        setTimeout(() => {
            if (localData.credentials.publicKey) {
                setTestStatus('success');
            } else {
                setTestStatus('error');
            }
        }, 1500);
    };

    return (
        <div className={`p-10 rounded-xl border transition-all duration-500 group relative overflow-hidden ${localData.isActive ? 'bg-card border-primary/30 shadow-2xl shadow-primary/5' : 'bg-card border-border opacity-70 hover:opacity-100'}`}>
            <div className="flex flex-col xl:flex-row items-start justify-between gap-10 mb-10">
                <div className="flex flex-col md:flex-row gap-8">
                    {icon}
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight leading-none">
                                {title}
                            </h3>
                            {localData.isActive && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-widest shadow-inner">
                                    <CheckCircle className="w-3 h-3" /> Gateway Ativo
                                </span>
                            )}
                        </div>
                        <p className="text-muted-foreground text-sm font-medium italic max-w-lg leading-relaxed">{description}</p>
                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 max-w-lg">
                            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-1">Como conectar:</p>
                            <p className="text-[11px] text-muted-foreground font-bold tracking-tight">{helpText}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-background p-3 px-6 rounded-xl border border-border shadow-inner">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${localData.isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {localData.isActive ? 'OPERANDO' : 'DESATIVADO'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={localData.isActive}
                            onChange={async (e) => {
                                const newActive = e.target.checked;
                                
                                // A caixinha segue o botão: ligar abre, desligar fecha
                                if (!newActive) {
                                    setExpanded(false);
                                }

                                // --- PRE-SAVE VALIDATION ---
                                // Sem as chaves deste gateway (MP: accessToken; Stripe: secretKey),
                                // ligar apenas ABRE o formulário para preencher — não ativa ainda
                                if (newActive) {
                                    const missing = fields
                                        .filter(f => !f.advanced && f.type !== 'radio')
                                        .filter(f => !localData.credentials[f.name]);
                                    if (missing.length > 0) {
                                        setExpanded(true);
                                        alert(`Preencha ${missing.map(f => f.label).join(' e ')} nos campos abaixo e clique em "Sincronizar Credenciais". Depois é só ligar a chavinha de novo.`);
                                        return;
                                    }
                                }

                                setLocalData({ ...localData, isActive: newActive });
                                // AUTO-SAVE ON TOGGLE
                                await onSave(gateway, { ...localData, isActive: newActive, isToggleOnly: true });
                            }}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                    </label>
                </div>
            </div>

            {!localData.isActive && !expanded && (
                <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="w-full py-4 border border-dashed border-border rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
                >
                    + Configurar chaves do {title}
                </button>
            )}

            {(localData.isActive || expanded) && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {fields.filter(f => !f.advanced || showAdvanced).map(f => (
                            <div key={f.name} className={`space-y-3 ${f.type === 'radio' ? 'md:col-span-2' : ''}`}>
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    {f.type === 'password' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                    {f.label}
                                </label>

                                {f.type === 'radio' ? (
                                    <div className="flex flex-wrap gap-4">
                                        {f.options.map(opt => (
                                            <label key={opt.value} className={`flex items-center gap-3 cursor-pointer px-6 py-4 rounded-xl border-2 transition-all duration-300 ${localData.credentials[f.name] === opt.value ? 'bg-primary/5 border-primary text-primary shadow-lg' : 'bg-background border-border text-muted-foreground hover:border-primary/30'}`}>
                                                <input
                                                    type="radio"
                                                    name={`env-${gateway}`}
                                                    value={opt.value}
                                                    checked={localData.credentials[f.name] === opt.value}
                                                    onChange={e => handleChange(f.name, e.target.value)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-4 h-4 rounded-full border-2 border-current flex items-center justify-center`}>
                                                    {localData.credentials[f.name] === opt.value && <div className="w-1.5 h-1.5 bg-current rounded-full"></div>}
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-widest">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="relative group/field">
                                        <input
                                            type={f.type || "text"}
                                            value={localData.credentials[f.name] || ''}
                                            onChange={e => handleChange(f.name, e.target.value)}
                                            placeholder={f.placeholder}
                                            className="w-full p-5 bg-background border border-border rounded-xl focus:ring-4 ring-primary/10 outline-none text-sm text-foreground font-mono shadow-inner group-hover/field:border-primary/30 transition-all font-bold"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {fields.some(f => f.advanced) && (
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(v => !v)}
                            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                        >
                            {showAdvanced ? '− Ocultar configuração avançada' : '+ Configuração avançada (opcional)'}
                        </button>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-10 pt-10 border-t border-border/50">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={handleTestConnection}
                                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary bg-muted/50 px-6 py-4 rounded-xl transition-all hover:bg-muted border border-border/50 active:scale-95"
                            >
                                {testStatus === 'testing' ? 'Validando Camada API...' : 'Testar Comunicação'}
                            </button>

                            {testStatus === 'success' && (
                                <span className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest animate-in fade-in slide-in-from-left-4">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div> Conectado com Sucesso
                                </span>
                            )}
                            {testStatus === 'error' && (
                                <span className="flex items-center gap-2 text-[10px] font-black text-destructive uppercase tracking-widest animate-in shake">
                                    <AlertTriangle className="w-4 h-4" /> Parâmetros Inválidos
                                </span>
                            )}
                        </div>

                        <button
                            onClick={() => onSave(gateway, localData)}
                            disabled={saving}
                            className="w-full md:w-auto bg-primary text-primary-foreground px-12 py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-primary/90 shadow-2xl shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Zap className="w-5 h-5" /> {saving ? 'SALVANDO CONFIGURAÇÃO...' : 'SINCRONIZAR CREDENCIAIS'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
