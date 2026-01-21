'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { CreditCard, CheckCircle, AlertTriangle, Lock } from 'lucide-react';

export default function PaymentSettings() {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // 'velify' | 'stripe' | null

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

            {/* VELIFY CONFIG */}
            <GatewayCard
                title="Velify (PIX)"
                description="Recebimento instantâneo via PIX com QR Code dinâmico."
                gateway="velify"
                config={getConfig('velify')}
                onSave={handleSave}
                saving={saving === 'velify'}
                icon={<div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">PIX</div>}
                fields={[
                    { name: 'apiUrl', label: 'API URL', placeholder: 'https://api.velify.com' },
                    { name: 'apiKey', label: 'API Key / Token', type: 'password' }
                ]}
            />

            {/* STRIPE CONFIG */}
            <GatewayCard
                title="Stripe"
                description="Aceite cartões de crédito e débito mundialmente."
                gateway="stripe"
                config={getConfig('stripe')}
                onSave={handleSave}
                saving={saving === 'stripe'}
                icon={<div className="w-8 h-8 rounded bg-[#635BFF] flex items-center justify-center text-white font-bold text-xs">S</div>}
                fields={[
                    { name: 'publicKey', label: 'Public Key', placeholder: 'pk_test_...' },
                    { name: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_test_...' }
                ]}
            />

            {/* MERCADO PAGO CONFIG */}
            <GatewayCard
                title="Mercado Pago"
                description="Solução completa de pagamentos da América Latina."
                gateway="mercadopago"
                config={getConfig('mercadopago')}
                onSave={handleSave}
                saving={saving === 'mercadopago'}
                icon={<div className="w-8 h-8 rounded bg-[#009EE3] flex items-center justify-center text-white font-bold text-xs">MP</div>}
                fields={[
                    { name: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'APP_USR-...' },
                    { name: 'siteId', label: 'Site ID', placeholder: 'MLB' }
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
                        <div key={f.name} className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{f.label}</label>
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
                        </div>
                    ))}
                    <div className="md:col-span-2 flex justify-end mt-2">
                        <button
                            onClick={() => onSave(gateway, localData)}
                            disabled={saving}
                            className="bg-slate-800 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
