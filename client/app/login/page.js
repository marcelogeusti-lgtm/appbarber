'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, LogIn, UserPlus, Scissors, Mail, Lock, User, Store } from 'lucide-react';
import api from '../../lib/api';

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
            const res = await api.post('/auth/login', loginData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao entrar. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/register', registerData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            router.push('/dashboard');
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
                <h2 className="text-center text-3xl font-black text-slate-900 dark:text-white tracking-tight">Barber On</h2>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    Sua barbearia no próximo nível 🚀
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
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    {activeTab === 'login' ? (
                        <form className="space-y-5" onSubmit={handleLoginSubmit}>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">E-mail</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition text-slate-900 dark:text-white"
                                        placeholder="seu@email.com"
                                        value={loginData.email}
                                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Senha</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition text-slate-900 dark:text-white"
                                        placeholder="••••••••"
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-5 px-4 border border-transparent rounded-[1.5rem] shadow-xl shadow-orange-500/20 text-lg font-black text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-95"
                            >
                                {loading ? 'Entrando...' : 'Entrar com E-mail'}
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-5" onSubmit={handleRegisterSubmit}>
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800 mb-6">
                                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase leading-relaxed text-center">
                                    🎉 Comece a gerenciar sua barbearia hoje mesmo!
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Seu Nome</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition text-slate-900 dark:text-white"
                                        placeholder="Seu nome completo"
                                        value={registerData.name}
                                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Nome da Barbearia</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Store className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition text-slate-900 dark:text-white"
                                        placeholder="Ex: Dom Geusti Barbearia"
                                        value={registerData.barbershopName}
                                        onChange={(e) => setRegisterData({ ...registerData, barbershopName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">E-mail</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition text-slate-900 dark:text-white"
                                        placeholder="seu@email.com"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Senha</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition text-slate-900 dark:text-white"
                                        placeholder="Crie uma senha forte"
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-5 px-4 border border-transparent rounded-[1.5rem] shadow-xl shadow-orange-500/20 text-lg font-black text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-95"
                            >
                                {loading ? 'Criando conta...' : 'Criar minha Barbearia'}
                            </button>
                        </form>
                    )}
                </div>
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-600 font-bold uppercase tracking-widest">
                        Acesso exclusivo para parceiros Barber On
                    </p>
                </div>
            </div>
        </div>
    );
}

