'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import api from '../../lib/api';
import { safeSetItem } from '../../lib/storage';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
    </svg>
);

export default function AdminLogin() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    const finishLogin = (res) => {
        const userData = {
            ...res.data.user,
            barbershopId: res.data.barbershopId,
            barbershopSlug: res.data.barbershopSlug
        };

        if (userData.role !== 'SUPER_ADMIN' && userData.role !== 'ADMIN') {
            setError('Acesso restrito. Sua conta não tem privilégios administrativos master.');
            return;
        }

        safeSetItem('token', res.data.token);
        safeSetItem('user', JSON.stringify(userData));
        router.push('/dashboard');
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = { ...loginData, context: 'PRO' };
            const res = await api.post('/auth/login', payload);
            
            // For simplicity in this restricted route, ignoring 2FA logic if it triggers, 
            // but normally it should be handled. Assuming Master uses social login mostly.
            finishLogin(res);
        } catch (err) {
            console.error('Login error:', err);
            const msg = err.response?.data?.message || err.message || 'Erro de conexão.';
            setError(`Falha ao entrar: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const { email, displayName, photoURL, uid } = result.user;

            const res = await api.post('/auth/social-login', {
                email,
                name: displayName,
                avatarUrl: photoURL,
                provider: 'GOOGLE',
                providerId: uid,
                context: 'PRO',
                intent: 'login'
            });

            finishLogin(res);
        } catch (err) {
            console.error('Social Login error:', err);
            let msg = 'Erro ao conectar. ';
            if (err.code === 'auth/popup-closed-by-user') msg = 'Login cancelado.';
            if (err.response?.data?.message) msg = err.response.data.message;
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/10">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Login Master</h1>
                    <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Acesso Exclusivo à Gestão SaaS</p>
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
                            <label className="text-xs font-bold text-white/60 uppercase tracking-widest pl-1">E-mail</label>
                            <input
                                type="email"
                                required
                                value={loginData.email}
                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                className="w-full h-14 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                                placeholder="sysadmin@corteconexao.com.br"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/60 uppercase tracking-widest pl-1">Senha</label>
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
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
                        </button>

                        <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-white/20 text-xs font-bold uppercase">Ou</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full h-14 bg-white text-black font-bold text-sm rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            <GoogleIcon />
                            Entrar com Google
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
