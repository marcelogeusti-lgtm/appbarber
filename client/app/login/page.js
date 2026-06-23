'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Scissors, ArrowRight, UserPlus, LogIn, ChevronRight, CheckCircle, ShieldCheck, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';
import { safeSetItem } from '../../lib/storage';
import { auth, googleProvider, facebookProvider } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
        />
    </svg>
);

const FacebookIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

export default function AuthPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Login State
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    // 2FA State
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [twoFactorMethod, setTwoFactorMethod] = useState('');
    const [authUserId, setAuthUserId] = useState(null);
    const [mfaToken, setMfaToken] = useState('');

    // Register State
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN',
        barbershopName: ''
    });

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = { ...loginData, context: 'PRO' };
            if (twoFactorRequired) {
                payload.mfaToken = mfaToken;
            }

            const res = await api.post('/auth/login', payload);

            if (res.status === 202 && res.data.message === '2FA_REQUIRED') {
                setTwoFactorRequired(true);
                setAuthUserId(res.data.authUserId);
                setTwoFactorMethod(res.data.method);
                setLoading(false);
                return;
            }

            const userData = {
                ...res.data.user,
                barbershopId: res.data.barbershopId,
                barbershopSlug: res.data.barbershopSlug
            };

            if (userData.role === 'SUPER_ADMIN') {
                setError('Conta Master identificada. Por favor, acesse pelo link exclusivo: /admin');
                setLoading(false);
                return;
            }

            safeSetItem('token', res.data.token);
            safeSetItem('user', JSON.stringify(userData));
            router.push('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            const msg = err.response?.data?.message || err.message || 'Erro de conexão.';
            setError(`Falha ao entrar: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (providerName) => {
        setLoading(true);
        setError('');

        let provider;
        if (providerName === 'google') provider = googleProvider;
        if (providerName === 'facebook') provider = facebookProvider;

        try {
            const result = await signInWithPopup(auth, provider);
            const { email, displayName, photoURL, uid } = result.user;

            const res = await api.post('/auth/social-login', {
                email,
                name: displayName,
                avatarUrl: photoURL,
                provider: providerName.toUpperCase(),
                providerId: uid,
                context: 'PRO',
                intent: activeTab // 'login' or 'register'
            });

            const userData = {
                ...res.data.user,
                barbershopId: res.data.barbershopId,
                barbershopSlug: res.data.barbershopSlug
            };

            if (userData.role === 'SUPER_ADMIN') {
                setError('Conta Master identificada. Por favor, acesse pelo link exclusivo: /admin');
                setLoading(false);
                return;
            }

            safeSetItem('token', res.data.token);
            safeSetItem('user', JSON.stringify(userData));
            router.push('/dashboard');

        } catch (err) {
            console.error('Social Login error:', err);
            let msg = 'Erro ao conectar. ';
            if (err.code === 'auth/popup-closed-by-user') msg = 'Login cancelado.';
            if (err.response?.data?.message) msg = err.response.data.message;
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/register', registerData);
            const userData = { ...res.data.user, barbershopId: res.data.barbershop?.id };
            safeSetItem('token', res.data.token);
            safeSetItem('user', JSON.stringify(userData));
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao criar conta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex relative overflow-hidden">

            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-[#09090b] relative items-center justify-center overflow-hidden border-r border-white/5">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                <div className="relative z-10 max-w-lg px-12">
                    <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                        Gerencie sua barbearia com <span className="text-primary">inteligência</span>.
                    </h1>
                    <ul className="space-y-4">
                        {['Agenda automática', 'Controle financeiro', 'Site personalizado', 'Marketing integrado'].map(item => (
                            <li key={item} className="flex items-center gap-3 text-zinc-400 text-lg">
                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-primary" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-24 relative z-10 bg-white">
                <Link href="/" className="absolute top-8 left-8 text-zinc-500 hover:text-zinc-900 flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar ao site
                </Link>

                <div className="max-w-md w-full mx-auto">
                    <div className="p-8 lg:p-10 bg-white border border-zinc-200 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="text-center mb-10">
                            <Link href="/" className="inline-flex items-center gap-2 mb-6 lg:hidden">
                                <span className="text-2xl font-bold text-zinc-900">NE<span className="text-primary">XT</span></span>
                            </Link>
                            <h2 className="text-3xl font-bold text-zinc-900 mb-2">
                                {activeTab === 'login' ? 'Acesso Profissional' : 'Crie sua conta grátis'}
                            </h2>
                            <p className="text-zinc-500">
                                {activeTab === 'login' ? 'Acesse o painel da sua barbearia.' : 'Comece a usar o sistema em menos de 2 minutos.'}
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="p-1 bg-zinc-50 rounded-xl border border-zinc-200 mb-8 flex">
                            <button
                                onClick={() => { setActiveTab('login'); setError(''); }}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'login' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-700'}`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <LogIn className="w-4 h-4" /> Entrar
                                </div>
                            </button>
                            <button
                                onClick={() => { setActiveTab('register'); setError(''); }}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'register' ? 'bg-primary text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <UserPlus className="w-4 h-4" /> Criar Conta
                                </div>
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium animate-in slide-in-from-top-2 text-center">
                                {error}
                            </div>
                        )}

                        {activeTab === 'login' ? (
                            <form className="space-y-5" onSubmit={handleLoginSubmit}>
                                {twoFactorRequired ? (
                                    <div className="space-y-5 animate-in fade-in duration-300">
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Check className="w-8 h-8 text-primary" />
                                            </div>
                                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Verificação em 2 Etapas</h3>
                                            <p className="text-sm text-zinc-500">
                                                Enviamos um código de 6 dígitos via <strong>{twoFactorMethod === 'EMAIL' ? 'E-mail' : 'SMS/WhatsApp'}</strong>.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 text-center block">Código de Acesso</label>
                                            <input
                                                type="text"
                                                required
                                                maxLength="6"
                                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-4 text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-center text-3xl font-mono tracking-[0.5em]"
                                                placeholder="000 000"
                                                value={mfaToken}
                                                onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleLoginSubmit}
                                            disabled={loading || mfaToken.length !== 6}
                                            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                        >
                                            {loading ? 'Verificando...' : 'Confirmar e Entrar'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => { setTwoFactorRequired(false); setMfaToken(''); }}
                                            className="w-full text-center text-sm text-zinc-500 hover:text-zinc-900 mt-4 outline-none"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">E-mail</label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                                placeholder="seu@email.com"
                                                value={loginData.email}
                                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center ml-1">
                                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Senha</label>
                                                <a href="/forgot-password" className="text-xs text-primary hover:underline">Esqueceu?</a>
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                                placeholder="••••••••"
                                                value={loginData.password}
                                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Entrando...' : 'Acessar Painel'}
                                        </button>

                                        <div className="relative my-8">
                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100"></div></div>
                                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-zinc-400">Ou entre com</span></div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button type="button" onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-2 py-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-zinc-700 text-sm font-medium shadow-sm">
                                                <GoogleIcon /> Google
                                            </button>
                                            <button type="button" onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center gap-2 py-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-zinc-700 text-sm font-medium shadow-sm">
                                                <FacebookIcon /> Facebook
                                            </button>
                                        </div>
                                    </>
                                )}
                            </form>
                        ) : (
                            <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                        placeholder="Seu nome"
                                        value={registerData.name}
                                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Nome da Empresa</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                        placeholder="Ex: Minha Barbearia ou Salão"
                                        value={registerData.barbershopName}
                                        onChange={(e) => setRegisterData({ ...registerData, barbershopName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">E-mail</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                        placeholder="seu@email.com"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Senha</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                        placeholder="Crie uma senha forte"
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-sm mt-2"
                                >
                                    {loading ? 'Criando conta...' : 'Começar Gratuitamente'}
                                </button>

                                <p className="text-center text-sm text-zinc-500 mt-6">
                                    Sou cliente e quero agendar: <Link href="/" className="text-primary font-bold hover:underline">Clique aqui</Link>
                                </p>

                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100"></div></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-zinc-400">Ou crie com</span></div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-2 py-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-zinc-700 text-sm font-medium shadow-sm">
                                        <GoogleIcon /> Google
                                    </button>
                                    <button type="button" onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center gap-2 py-3 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-zinc-700 text-sm font-medium shadow-sm">
                                        <FacebookIcon /> Facebook
                                    </button>
                                </div>

                                <p className="text-center text-xs text-zinc-400 mt-8">
                                    Ao criar uma conta, você concorda com nossos <br />
                                    <a href="#" className="underline hover:text-zinc-600 transition-colors">Termos de Uso</a> e <a href="#" className="underline hover:text-zinc-600 transition-colors">Política de Privacidade</a>.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

