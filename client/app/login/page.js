'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Scissors, Chrome, Facebook, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';
import { auth, googleProvider, facebookProvider } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function AuthPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Login State
    const [loginData, setLoginData] = useState({ email: '', password: '' });

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
            const res = await api.post('/auth/login', { ...loginData, context: 'PRO' });

            const userData = {
                ...res.data.user,
                barbershopId: res.data.barbershopId,
                barbershopSlug: res.data.barbershopSlug
            };

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(userData));
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
                context: 'PRO'
            });

            const userData = {
                ...res.data.user,
                barbershopId: res.data.barbershopId,
                barbershopSlug: res.data.barbershopSlug
            };

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(userData));
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
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(userData));
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao criar conta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex relative overflow-hidden">

            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-[#09090b] relative items-center justify-center overflow-hidden border-r border-white/5">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                <div className="relative z-10 max-w-lg px-12">
                    <div className="mb-8 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 inline-block">
                        <Scissors className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                        Gerencie sua barbearia com <span className="text-primary">inteligência</span>.
                    </h1>
                    <ul className="space-y-4">
                        {['Agenda automática', 'Controle financeiro', 'Site personalizado', 'Marketing integrado'].map(item => (
                            <li key={item} className="flex items-center gap-3 text-gray-400 text-lg">
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
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-24 relative z-10 bg-black">
                <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar ao site
                </Link>

                <div className="max-w-md w-full mx-auto">
                    <div className="text-center mb-10">
                        <Link href="/" className="inline-flex items-center gap-2 mb-6 lg:hidden">
                            <div className="bg-primary/10 p-2 rounded-xl">
                                <Scissors className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-2xl font-bold text-white">Barbe<span className="text-primary">On</span></span>
                        </Link>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {activeTab === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta grátis'}
                        </h2>
                        <p className="text-gray-400">
                            {activeTab === 'login' ? 'Acesse o painel da sua barbearia.' : 'Comece a usar o sistema em menos de 2 minutos.'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="p-1 bg-[#09090b] rounded-xl border border-white/5 mb-8 flex">
                        <button
                            onClick={() => { setActiveTab('login'); setError(''); }}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'login' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <LogIn className="w-4 h-4" /> Entrar
                            </div>
                        </button>
                        <button
                            onClick={() => { setActiveTab('register'); setError(''); }}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'register' ? 'bg-primary text-black shadow-[0_0_20px_rgba(0,230,118,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <UserPlus className="w-4 h-4" /> Criar Conta
                            </div>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium animate-in slide-in-from-top-2 text-center">
                            {error}
                        </div>
                    )}

                    {activeTab === 'login' ? (
                        <form className="space-y-5" onSubmit={handleLoginSubmit}>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">E-mail</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                    placeholder="seu@email.com"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Senha</label>
                                    <a href="#" className="text-xs text-primary hover:underline">Esqueceu?</a>
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                    placeholder="••••••••"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(0,230,118,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Entrando...' : 'Acessar Painel'}
                            </button>

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-black px-2 text-gray-500">Ou entre com</span></div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-2 py-3 bg-[#09090b] border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-white text-sm font-medium">
                                    <Chrome className="w-4 h-4" /> Google
                                </button>
                                <button type="button" onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center gap-2 py-3 bg-[#09090b] border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-white text-sm font-medium">
                                    <Facebook className="w-4 h-4" /> Facebook
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                    placeholder="Seu nome"
                                    value={registerData.name}
                                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nome da Barbearia</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                    placeholder="Ex: Barber Shop"
                                    value={registerData.barbershopName}
                                    onChange={(e) => setRegisterData({ ...registerData, barbershopName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">E-mail</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                    placeholder="seu@email.com"
                                    value={registerData.email}
                                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Senha</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                    placeholder="Crie uma senha forte"
                                    value={registerData.password}
                                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(0,230,118,0.1)] mt-2"
                            >
                                {loading ? 'Criando conta...' : 'Começar Gratuitamente'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

