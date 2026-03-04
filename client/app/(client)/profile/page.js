'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    User, Mail, ChevronRight, Settings,
    Key, MapPin, Heart, CreditCard, UserPlus,
    Package, ShieldCheck, Clock, MessageSquare,
    FileText, LogOut, Loader2, ArrowLeft,
    Lock, Phone, ArrowRight, LogIn
} from 'lucide-react';
import { useClientAuth } from '../../../contexts/ClientAuthContext';

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

export default function ProfileMenuPage() {
    const router = useRouter();
    const { user, loading, logout, login, register, googleLogin, facebookLogin, openForgotPasswordModal } = useClientAuth();

    // Local Auth State
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState('');

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-primary">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLocalLoading(true);
        const result = await login(email, password);
        if (!result?.success) {
            setError(result?.message || 'Erro ao realizar login');
            setLocalLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLocalLoading(true);
        const result = await register({ name, email, password, phone });
        if (!result?.success) {
            setError(result?.message || 'Erro ao criar conta');
            setLocalLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        setError('');
        setLocalLoading(true);
        const result = provider === 'google' ? await googleLogin() : await facebookLogin();
        if (!result?.success) {
            setError(result?.message || `Erro ao autenticar com ${provider}`);
            setLocalLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center pt-12 pb-32 px-6">
                <div className="w-full max-w-sm">
                    <button
                        onClick={() => router.push('/home')}
                        className="p-3 bg-white/5 rounded-full mb-8 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto mb-4 overflow-hidden rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <img src="/logos/logo_icon.png" alt="AppBarber" className="w-10 h-10 object-contain brightness-125" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {activeTab === 'login' ? 'Acessar conta' : 'Criar conta'}
                            </h2>
                            <p className="text-slate-500 text-xs">
                                {activeTab === 'login' ? 'Faça login para gerenciar seus agendamentos' : 'Cadastre-se para agendar seus cortes'}
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="p-1 bg-[#1A1A1A] rounded-xl border border-white/5 mb-6 flex">
                            <button
                                onClick={() => { setActiveTab('login'); setError(''); }}
                                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'login' ? 'bg-[#222] text-white shadow-sm border border-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <LogIn className="w-3.5 h-3.5" /> Entrar
                                </div>
                            </button>
                            <button
                                onClick={() => { setActiveTab('register'); setError(''); }}
                                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'register' ? 'bg-primary text-black shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <UserPlus className="w-3.5 h-3.5" /> Cadastrar
                                </div>
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl mb-6 text-center">
                                {error}
                            </div>
                        )}

                        {activeTab === 'login' ? (
                            <form onSubmit={handleLoginSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-wider">Email ou telefone</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition" />
                                        <input
                                            type="text"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition text-sm"
                                            placeholder="Seu email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Senha</label>
                                        <button type="button" onClick={openForgotPasswordModal} className="text-[10px] text-primary hover:underline">Esqueceu?</button>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={localLoading}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-sm"
                                >
                                    {localLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Acessar Painel'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleRegisterSubmit} className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-wider">Nome Completo</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition text-sm"
                                            placeholder="Seu nome"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-wider">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition text-sm"
                                            placeholder="seu@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-wider">Telefone</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition text-sm"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-wider">Senha</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition text-sm"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={localLoading}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-sm"
                                >
                                    {localLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Conta'}
                                </button>
                            </form>
                        )}

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-[#111111] px-3 text-slate-500">Ou continue com</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                onClick={() => handleSocialLogin('google')}
                                className="flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#222] border border-white/5 text-slate-300 hover:text-white py-3 rounded-xl transition font-medium text-xs shadow-sm"
                            >
                                <GoogleIcon /> Google
                            </button>
                            <button
                                onClick={() => handleSocialLogin('facebook')}
                                className="flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#222] border border-white/5 text-slate-300 hover:text-white py-3 rounded-xl transition font-medium text-xs shadow-sm"
                            >
                                <FacebookIcon /> Facebook
                            </button>
                        </div>

                        <p className="mt-6 text-center text-[10px] text-slate-600 font-medium">
                            Ao continuar, você concorda com nossos{' '}
                            <Link href="/terms" className="underline hover:text-slate-400 transition-colors">Termos de Uso</Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // If logged in, potentially redirect or show mobile menu
    useEffect(() => {
        if (user && window.innerWidth >= 1024) {
            router.replace('/profile/edit');
        }
    }, [user, router]);

    const menuSections = [
        {
            items: [
                { icon: User, label: 'Meus Dados', sub: 'Altere as informações do seu perfil', href: '/profile/edit' },
                { icon: Key, label: 'Meus Acessos', sub: 'Visualize e altere os métodos de login', href: '/profile/access' },
                { icon: MapPin, label: 'Endereço', sub: 'Altere seu endereço', href: '/profile/address' },
            ]
        },
        {
            items: [
                { icon: Heart, label: 'Favoritos', sub: 'Meus Favoritos', href: '/favorites' },
                { icon: CreditCard, label: 'Meus cartões', sub: 'Gerencie seus cartões', href: '/cards' },
                { icon: UserPlus, label: 'Assinaturas', sub: 'Acompanhe suas assinaturas', href: '/subscriptions' },
                { icon: Package, label: 'Pacotes', sub: 'Acompanhe seus pacotes', href: '/packages' },
                { icon: ShieldCheck, label: 'Segurança', sub: 'Altere sua senha de acesso', href: '/profile/security' },
                { icon: Clock, label: 'Histórico', sub: 'Visualize seu histórico de agendamentos', href: '/history' },
            ]
        },
        {
            items: [
                { icon: Settings, label: 'Preferências', sub: 'Personalize sua experiência no aplicativo', href: '/profile/preferences' },
                { icon: MessageSquare, label: 'Ouvidoria', sub: 'Envie sua sugestão, elogio ou reclamação', href: '/support' },
                { icon: FileText, label: 'Termos de uso', sub: 'Acesse nossos termos de uso', href: '/terms' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans pb-32 pt-10 px-6 max-w-xl lg:max-w-6xl mx-auto overflow-x-hidden">

            {/* Header: User Profile */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full border-4 border-white/5 p-1 bg-slate-900 shadow-2xl relative">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-full text-3xl font-black text-primary">
                                {user.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#050505]"></span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight leading-tight">{user.name}</h1>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Cliente Premium</p>
                    </div>
                </div>
                <button onClick={() => router.push('/profile/edit')} className="p-3 bg-white/5 rounded-[1.5rem] border border-white/5 text-slate-400 hover:text-white transition-all shadow-lg active:scale-90">
                    <Settings className="w-6 h-6" />
                </button>
            </div>

            {/* Menu Groups */}
            <div className="space-y-8">
                {menuSections.map((section, sIdx) => (
                    <div key={sIdx} className="bg-[#0A0A0B] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        {section.items.map((item, iIdx) => (
                            <button
                                key={iIdx}
                                onClick={() => router.push(item.href)}
                                className={`w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all group active:opacity-60 ${iIdx !== section.items.length - 1 ? 'border-b border-white/5' : ''}`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary transition-all group-hover:scale-110 shadow-inner">
                                        <item.icon className="w-6 h-6 transition-colors" strokeWidth={1.5} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[15px] font-black text-slate-200 group-hover:text-white transition-colors">{item.label}</p>
                                        <p className="text-[10px] text-slate-600 font-bold group-hover:text-slate-400 transition-colors uppercase tracking-[0.05em] mt-0.5">{item.sub}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-800 group-hover:text-primary transition-all group-hover:translate-x-1.5" />
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            {/* Sign Out Section */}
            <div className="mt-16 text-center">
                <button
                    onClick={() => {
                        logout();
                        router.push('/home');
                    }}
                    className="text-red-500/60 hover:text-red-500 font-black text-xs uppercase tracking-[0.3em] py-6 px-12 transition-all hover:scale-110 active:scale-95"
                >
                    Sair da conta
                </button>
                <p className="text-[9px] text-slate-800 uppercase font-black tracking-widest mt-4">AppBarber Cliente • v2.0.0</p>
            </div>
        </div>
    );
}
