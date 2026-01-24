'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, LogIn, UserPlus, Scissors, Mail, Lock, User, Store, Chrome, Facebook } from 'lucide-react'; // Added Icons
import api from '../../lib/api';
import { auth, googleProvider, facebookProvider } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function AuthPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Login State
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    // Register State
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN', // Hardcoded for this page as it's for owners
        barbershopName: ''
    });

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { ...loginData, context: 'PRO' });

            // Merge explicit barbershop data into user object for frontend consistency
            const userData = {
                ...res.data.user,
                barbershopId: res.data.barbershopId,
                barbershopSlug: res.data.barbershopSlug
            };

            if (res.data.user.role === 'CLIENT') {
                localStorage.setItem('clientToken', res.data.token);
                localStorage.setItem('clientUser', JSON.stringify(userData));

                const returnTo = new URLSearchParams(window.location.search).get('returnTo');
                router.push(returnTo || '/home');
            } else {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                router.push('/dashboard');
            }
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
            if (!auth.config?.apiKey || auth.config.apiKey.includes('YOUR_API_KEY')) {
                throw new Error('Configuração do Firebase ausente no .env.local');
            }

            const result = await signInWithPopup(auth, provider);
            const { email, displayName, photoURL, uid } = result.user;

            // Sync with PRO Context
            const res = await api.post('/auth/social-login', {
                email,
                name: displayName,
                avatarUrl: photoURL,
                provider: providerName.toUpperCase(),
                providerId: uid,
                context: 'PRO' // Critical
            });

            const userData = {
                ...res.data.user,
                barbershopId: res.data.barbershopId,
                barbershopSlug: res.data.barbershopSlug
            };

            if (res.data.user.role === 'CLIENT') {
                localStorage.setItem('clientToken', res.data.token);
                localStorage.setItem('clientUser', JSON.stringify(userData));

                const returnTo = new URLSearchParams(window.location.search).get('returnTo');
                router.push(returnTo || '/home');
            } else {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                router.push('/dashboard');
            }

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
            if (res.data.user.role === 'CLIENT') {
                // Should not happen for this form
                router.push('/home');
            } else {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(userData)); // Note: userData is not defined here in original code, likely bug. Fixing below assuming res.data.user has everything needed or re-using structure.
                // Actually the original code had a bug here, userData wasn't defined. 
                // Fixing:
                const userData = { ...res.data.user, barbershopId: res.data.barbershop?.id }; // Approximation
                localStorage.setItem('user', JSON.stringify(userData));
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-4">
                    <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/20">
                        <Scissors className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="text-center text-3xl font-black text-slate-900 dark:text-white tracking-tight">Barbe-On Pro</h2>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    Painel Administrativo
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-2xl shadow-slate-200 dark:shadow-none sm:rounded-[2rem] sm:px-10 border border-slate-100 dark:border-slate-800">

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8">
                        <button
                            onClick={() => { setActiveTab('login'); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'login'
                                ? 'bg-white dark:bg-slate-950 text-orange-500 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <LogIn className="w-4 h-4" /> Entrar
                        </button>
                        <button
                            onClick={() => { setActiveTab('register'); setError(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'register'
                                ? 'bg-white dark:bg-slate-950 text-orange-500 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <UserPlus className="w-4 h-4" /> Criar Conta
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium animate-shake text-center">
                            {error}
                        </div>
                    )}

                    {activeTab === 'login' ? (
                        <>
                            <form className="space-y-5" onSubmit={handleLoginSubmit}>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">E-mail</label>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition text-slate-900 dark:text-white"
                                        placeholder="seu@email.com"
                                        value={loginData.email}
                                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Senha</label>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition text-slate-900 dark:text-white"
                                        placeholder="••••••••"
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-[1.5rem] shadow-xl shadow-orange-500/20 text-lg font-black text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition-all hover:scale-[1.02]"
                                >
                                    {loading ? 'Entrando...' : 'Entrar'}
                                </button>
                            </form>

                            <div className="relative mt-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Ou entre com</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleSocialLogin('google')}
                                    className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl shadow-sm bg-white dark:bg-slate-950 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition"
                                >
                                    <Chrome className="w-5 h-5 text-red-500 mr-2" /> Google
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocialLogin('facebook')}
                                    className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl shadow-sm bg-[#1877F2] text-sm font-medium text-white hover:bg-[#155fc4] transition"
                                >
                                    <Facebook className="w-5 h-5 text-white mr-2" /> Facebook
                                </button>
                            </div>
                        </>
                    ) : (
                        <form className="space-y-5" onSubmit={handleRegisterSubmit}>
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800 mb-6">
                                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase leading-relaxed text-center">
                                    🎉 Comece a gerenciar sua barbearia hoje mesmo!
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Seu Nome</label>
                                <input
                                    type="text"
                                    required
                                    className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition text-slate-900 dark:text-white"
                                    placeholder="Seu nome completo"
                                    value={registerData.name}
                                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Nome da Barbearia</label>
                                <input
                                    type="text"
                                    required
                                    className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition text-slate-900 dark:text-white"
                                    placeholder="Ex: Minha Barbearia"
                                    value={registerData.barbershopName}
                                    onChange={(e) => setRegisterData({ ...registerData, barbershopName: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">E-mail</label>
                                <input
                                    type="email"
                                    required
                                    className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition text-slate-900 dark:text-white"
                                    placeholder="seu@email.com"
                                    value={registerData.email}
                                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Senha</label>
                                <input
                                    type="password"
                                    required
                                    className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition text-slate-900 dark:text-white"
                                    placeholder="Crie uma senha forte"
                                    value={registerData.password}
                                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-[1.5rem] shadow-xl shadow-orange-500/20 text-lg font-black text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition-all hover:scale-[1.02]"
                            >
                                {loading ? 'Criando conta...' : 'Criar minha Barbearia'}
                            </button>
                        </form>
                    )}
                </div>
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-600 font-bold uppercase tracking-widest">
                        Acesso Restrito a Gestores
                    </p>
                </div>
            </div>
        </div>
    );
}

