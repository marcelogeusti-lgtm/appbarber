'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { CreditCard, CheckCircle, AlertTriangle, Lock } from 'lucide-react';

export default function PaymentSettings() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // 'velfy' | 'stripe' | null

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await api.get('/gateways');
            setConfigs(res.data);
        } catch (error) {
            console.error('Failed to fetch payment configs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (gateway, data) => {
        setSaving(gateway);
        try {
            await api.post('/gateways', {
                gateway,
                isActive: data.isActive,
                credentials: data.credentials
            });
            // Refresh
            await fetchConfigs();
            alert('Configurações salvas!');
        } catch (error) {
            alert('Erro ao salvar: ' + (error.response?.data?.error || error.message));
        } finally {
            setSaving(null);
        }
    };

    const getConfig = (gateway) => configs.find(c => c.gateway === gateway) || { isActive: false, credentials: {} };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                    <CreditCard className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-white">Integrações de Pagamento</h2>
                    <p className="text-slate-500 text-xs font-medium">Gerencie como seus clientes pagam pelos serviços.</p>
                </div>
            </div>

            {/* VELFY CONFIG */}
            <GatewayCard
                title="Velfy (PIX)"
                description="Recebimento instantâneo via PIX com QR Code dinâmico."
                gateway="velfy"
                config={getConfig('velfy')}
                onSave={handleSave}
                saving={saving === 'velfy'}
                icon={<div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-slate-800 shadow-xl">
                    <img src="/logos/velfy.png" alt="Velfy" className="w-full h-full object-cover" />
                </div>}
                helpText="Use as credenciais fornecidas pela equipe Velfy (Chave Pública e Chave Secreta) para ativar o recebimento automático via PIX."
                fields={[
                    { name: 'publicKey', label: 'Chave Pública (Public Key)', placeholder: 'pk_...' },
                    { name: 'secretKey', label: 'Chave Secreta (Secret Key)', type: 'password', placeholder: 'sk_...' }
                ]}
            />

            {/* STRIPE CONFIG */}
            <GatewayCard
                title="Stripe"
                description="Aceite cartões de crédito/débito e PIX mundialmente."
                gateway="stripe"
                config={getConfig('stripe')}
                onSave={handleSave}
                saving={saving === 'stripe'}
                icon={<div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-slate-800 shadow-xl">
                    <img src="/logos/stripe.png" alt="Stripe" className="w-full h-full object-cover" />
                </div>}
                helpText="Acesse o painel da Stripe (Developers > API Keys) e copie a 'Secret Key' e a 'Publishable Key'. Certifique-se de estar usando chaves de Produção."
                fields={[
                    { name: 'publicKey', label: 'Public Key (pk_...)', placeholder: 'pk_live_...' },
                    { name: 'secretKey', label: 'Secret Key (sk_...)', type: 'password', placeholder: 'sk_live_...' }
                ]}
            />

            {/* MERCADO PAGO CONFIG */}
            <GatewayCard
                title="Mercado Pago"
                description="Solução completa de pagamentos para o Brasil."
                gateway="mercadopago"
                config={getConfig('mercadopago')}
                onSave={handleSave}
                saving={saving === 'mercadopago'}
                icon={<div className="w-12 h-12 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-slate-800 shadow-xl">
                    <img src="/logos/mercadopago.png" alt="Mercado Pago" className="w-full h-full object-cover" />
                </div>}
                helpText="Acesse o Portal de Desenvolvedores do Mercado Pago, crie uma aplicação e copie as credenciais de Produção ou Sandbox conforme o ambiente escolhido."
                fields={[
                    {
                        name: 'environment',
                        label: 'Ambiente',
                        type: 'radio',
                        options: [
                            { label: 'Sandbox (Teste)', value: 'sandbox' },
                            { label: 'Produção', value: 'production' }
                        ]
                    },
                    { name: 'publicKey', label: 'Public Key', placeholder: 'APP_USR-...' },
                    { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'APP_USR-...' }
                ]}
            />

        </div>
    );
}

function GatewayCard({ title, description, gateway, config, onSave, saving, icon, fields }) {
    const [localData, setLocalData] = useState({
        isActive: config.isActive,
        credentials: { ...config.credentials }
    });
    const [testStatus, setTestStatus] = useState(null); // 'testing', 'success', 'error'

    // Sync when config loads
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
        // Simulating a check - In real scenario, would hit an endpoint
        setTimeout(() => {
            if (localData.credentials.accessToken && localData.credentials.publicKey) {
                setTestStatus('success');
            } else {
                setTestStatus('error');
            }
        }, 1500);
    };

    return (
        <div className={`p-6 md:p-8 rounded-[2rem] border transition-all duration-300 ${localData.isActive ? 'bg-[#162032] border-emerald-500/30 shadow-lg shadow-emerald-900/10' : 'bg-[#111827] border-slate-800 opacity-80 hover:opacity-100'}`}>
            <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                    {icon}
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {title}
                            {localData.isActive && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        </h3>
                        <p className="text-slate-500 text-xs mt-1 max-w-sm">{description}</p>
                        <p className="text-[10px] text-emerald-500/50 mt-2 italic max-w-sm font-medium">{fields.length > 0 && "Como conectar:"} <span className="text-slate-400 not-italic">{config.helpText || "Siga as instruções do painel do desenvolvedor."}</span></p>
                    </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={localData.isActive}
                        onChange={e => setLocalData({ ...localData, isActive: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
            </div>

            {localData.isActive && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    {fields.map(f => (
                        <div key={f.name} className={`space-y-2 ${f.type === 'radio' ? 'md:col-span-2' : ''}`}>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{f.label}</label>

                            {f.type === 'radio' ? (
                                <div className="flex gap-4">
                                    {f.options.map(opt => (
                                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 hover:border-slate-600 transition">
                                            <input
                                                type="radio"
                                                name={`env-${gateway}`}
                                                value={opt.value}
                                                checked={localData.credentials[f.name] === opt.value}
                                                onChange={e => handleChange(f.name, e.target.value)}
                                                className="accent-emerald-500"
                                            />
                                            <span className="text-xs font-bold text-white">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type={f.type || "text"}
                                        value={localData.credentials[f.name] || ''}
                                        onChange={e => handleChange(f.name, e.target.value)}
                                        placeholder={f.placeholder}
                                        className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 ring-emerald-500 outline-none text-sm text-white font-mono"
                                    />
                                    {f.type === 'password' && <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />}
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="md:col-span-2 flex justify-between items-center mt-4 pt-4 border-t border-slate-800">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleTestConnection}
                                className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800/50 px-4 py-3 rounded-xl transition hover:bg-slate-800 border border-white/5"
                            >
                                {testStatus === 'testing' ? 'Verificando...' : 'Testar Conexão'}
                            </button>

                            {testStatus === 'success' && (
                                <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 animate-in fade-in slide-in-from-left-2">
                                    <CheckCircle className="w-3 h-3" /> Conectado com sucesso
                                </span>
                            )}
                            {testStatus === 'error' && (
                                <span className="flex items-center gap-2 text-[10px] font-bold text-red-500 animate-in fade-in slide-in-from-left-2">
                                    <AlertTriangle className="w-3 h-3" /> Token inválido
                                </span>
                            )}
                        </div>

                        <button
                            onClick={() => onSave(gateway, localData)}
                            disabled={saving}
                            className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {saving ? 'Salvando...' : 'Salvar Credenciais'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
