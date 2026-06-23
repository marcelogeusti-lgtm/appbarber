'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import api from '../../../../lib/api';
import { safeSetItem } from '../../../../lib/storage';

export default function MasterLogin() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = { ...loginData, context: 'PRO' };
            const res = await api.post('/auth/login', payload);

            if (res.data.user.role !== 'SUPER_ADMIN') {
                setError('Acesso negado: Credenciais não autorizadas para este ambiente.');
                setLoading(false);
                return;
            }

            safeSetItem('token', res.data.token);
            safeSetItem('user', JSON.stringify(res.data.user));
            router.push('/master');
        } catch (err) {
            console.error('Login error:', err);
            const msg = err.response?.data?.message || err.message || 'Erro de conexão.';
            setError(`Falha ao entrar: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/10">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Acesso Restrito</h1>
                    <p className="text-white/40 text-sm font-medium tracking-widest uppercase">SaaS Master Control</p>
                </div>

                <div className="bg-[#111] p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                    
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl mb-6 text-center font-bold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/60 uppercase tracking-widest pl-1">E-mail Master</label>
                            <input
                                type="email"
                                required
                                value={loginData.email}
                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                className="w-full h-14 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                                placeholder="sysadmin@seudominio.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/60 uppercase tracking-widest pl-1">Senha de Segurança</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    className="w-full h-14 bg-black/50 border border-white/10 rounded-xl px-4 pr-12 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-mono tracking-widest"
                                    placeholder="••••••••"
                                />
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Entrar no Sistema <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                </div>
                
                <div className="text-center mt-8">
                    <p className="text-[10px] text-white/20 font-mono tracking-widest">SECURE ENVIRONMENT v2.4.1</p>
                </div>
            </div>
        </div>
    );
}
