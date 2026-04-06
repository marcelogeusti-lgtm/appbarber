'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    User, Mail, ChevronRight, Settings,
    Key, MapPin, Heart, CreditCard, UserPlus,
    Package, ShieldCheck, Clock, MessageSquare,
    FileText, LogOut, Loader2, ArrowLeft,
    Lock, Phone, ArrowRight, LogIn, Star
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

    // 2FA State
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [twoFactorMethod, setTwoFactorMethod] = useState('');
    const [mfaToken, setMfaToken] = useState('');

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
        const result = await login(email, password, twoFactorRequired ? mfaToken : null);

        if (!result?.success) {
            if (result?.requires2FA) {
                setTwoFactorRequired(true);
                setTwoFactorMethod(result.method);
                setLocalLoading(false);
                return;
            }

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
            <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#050505] to-black text-white font-sans flex flex-col items-center pt-12 pb-32 px-6 overflow-x-hidden">
                <div className="w-full max-w-sm">
                    <button
                        onClick={() => router.push('/home')}
                        className="w-10 h-10 glass-premium rounded-xl mb-8 flex items-center justify-center text-slate-400 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="glass-premium rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border-white/5">
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] rounded-full" />
                        
                        {/* FLOATING ACTION BUTTON: SEARCH / LOGO ICON (CLEAN & MINIMAL STYLE) */}
                        <div className="relative -top-6">
                            <Link
                                href="/search"
                                className="w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-95 overflow-hidden bg-white/5 border border-white/5"
                            >
                                <img src="/logos/logo_icon.png" alt="Search" className="w-13 h-13 object-contain opacity-90 hover:opacity-100 transition-opacity" />
                            </Link>
                        </div>

                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tight">
                                {activeTab === 'login' ? 'Bem-vindo' : 'Junte-se a nós'}
                            </h2>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                {activeTab === 'login' ? 'Acesse seu painel premium' : 'Crie sua conta exclusiva'}
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="p-1 glass-premium rounded-2xl border-white/5 mb-8 flex">
                            <button
                                onClick={() => { setActiveTab('login'); setError(''); }}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'login' ? 'bg-white/5 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Entrar
                            </button>
                            <button
                                onClick={() => { setActiveTab('register'); setError(''); }}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'register' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Cadastrar
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl mb-6 text-center">
                                {error}
                            </div>
                        )}

                        {activeTab === 'login' ? (
                            <form onSubmit={handleLoginSubmit} className="space-y-5">
                                {twoFactorRequired ? (
                                    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                                        <div className="text-center mb-4">
                                            <div className="w-16 h-16 glass-premium rounded-full flex items-center justify-center mx-auto mb-4 border-primary/20">
                                                <ShieldCheck className="w-8 h-8 text-primary" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Verificação em duas etapas via <strong>{twoFactorMethod}</strong>
                                            </p>
                                        </div>

                                        <input
                                            type="text"
                                            required
                                            maxLength="6"
                                            className="w-full glass-premium border-white/10 rounded-2xl py-5 px-4 text-center text-3xl font-mono tracking-[0.5em] text-white focus:outline-none focus:border-primary/50 transition shadow-inner"
                                            placeholder="000000"
                                            value={mfaToken}
                                            onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
                                        />

                                        <button
                                            type="submit"
                                            disabled={localLoading || mfaToken.length !== 6}
                                            className="w-full bg-primary text-black font-black uppercase tracking-[0.2em] py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 text-[10px]"
                                        >
                                            {localLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirmar e Entrar'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => { setTwoFactorRequired(false); setMfaToken(''); }}
                                            className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[9px] text-slate-500 font-black ml-1 uppercase tracking-widest">Email ou Telefone</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition" />
                                                <input
                                                    type="text"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full glass-premium border-white/5 rounded-2xl py-4 pl-11 pr-4 text-white placeholder-slate-700 focus:outline-none focus:border-primary/30 transition text-sm font-medium"
                                                    placeholder="seu@email.com"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center ml-1">
                                                <label className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Senha de Acesso</label>
                                                <button type="button" onClick={openForgotPasswordModal} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Esqueceu?</button>
                                            </div>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition" />
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full glass-premium border-white/5 rounded-2xl py-4 pl-11 pr-4 text-white placeholder-slate-700 focus:outline-none focus:border-primary/30 transition text-sm font-medium"
                                                    placeholder="••••••••"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={localLoading}
                                            className="w-full bg-primary text-black font-black py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-4 text-[10px] uppercase tracking-[0.2em]"
                                        >
                                            {localLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar Agora'}
                                        </button>
                                    </>
                                )}
                            </form>
                        ) : (
                            <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] text-slate-500 font-black ml-1 uppercase tracking-widest">Nome Completo</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full glass-premium border-white/5 rounded-2xl py-4 pl-11 pr-4 text-white placeholder-slate-700 focus:outline-none focus:border-primary/30 transition text-sm font-medium"
                                            placeholder="Ex: João Silva"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] text-slate-500 font-black ml-1 uppercase tracking-widest">Seu melhor Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full glass-premium border-white/5 rounded-2xl py-4 pl-11 pr-4 text-white placeholder-slate-700 focus:outline-none focus:border-primary/30 transition text-sm font-medium"
                                            placeholder="seu@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] text-slate-500 font-black ml-1 uppercase tracking-widest">Telefone Móvel</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full glass-premium border-white/5 rounded-2xl py-4 pl-11 pr-4 text-white placeholder-slate-700 focus:outline-none focus:border-primary/30 transition text-sm font-medium"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] text-slate-500 font-black ml-1 uppercase tracking-widest">Senha Segura</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary transition" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full glass-premium border-white/5 rounded-2xl py-4 pl-11 pr-4 text-white placeholder-slate-700 focus:outline-none focus:border-primary/30 transition text-sm font-medium"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={localLoading}
                                    className="w-full bg-primary text-black font-black py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-4 text-[10px] uppercase tracking-[0.2em]"
                                >
                                    {localLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Começar Agora'}
                                </button>
                            </form>
                        )}

                        <div className="relative my-10">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.3em]"><span className="bg-[#0A0A0B] px-4 text-slate-600">Ou continue com</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <button
                                onClick={() => handleSocialLogin('google')}
                                className="flex items-center justify-center gap-2 glass-premium hover:bg-white/5 border-white/5 text-slate-400 hover:text-white py-4 rounded-2xl transition font-black text-[9px] uppercase tracking-widest active:scale-95 shadow-sm"
                            >
                                <GoogleIcon /> Google
                            </button>
                            <button
                                onClick={() => handleSocialLogin('facebook')}
                                className="flex items-center justify-center gap-2 glass-premium hover:bg-white/5 border-white/5 text-slate-400 hover:text-white py-4 rounded-2xl transition font-black text-[9px] uppercase tracking-widest active:scale-95 shadow-sm"
                            >
                                <FacebookIcon /> Facebook
                            </button>
                        </div>
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
            title: 'Perfil',
            items: [
                { icon: User, label: 'Meus Dados', sub: 'Nome, e-mail e avatar', href: '/profile/edit' },
                { icon: Key, label: 'Segurança', sub: '2FA e senhas de acesso', href: '/profile/access' },
                { icon: MapPin, label: 'Localização', sub: 'Endereços de atendimento', href: '/profile/address' },
            ]
        },
        {
            title: 'Serviços',
            items: [
                { icon: Heart, label: 'Meus Favoritos', sub: 'Barbearias salvas', href: '/favorites' },
                { icon: CreditCard, label: 'Formas de Pagamento', sub: 'Cartões e carteira', href: '/cards' },
                { icon: UserPlus, label: 'Planos e Assinaturas', sub: 'Seu status premium', href: '/subscriptions' },
                { icon: Package, label: 'Pacotes Ativos', sub: 'Saldos e validades', href: '/packages' },
                { icon: Clock, label: 'Histórico Completo', sub: 'Agendamentos passados', href: '/history' },
            ]
        },
        {
            title: 'Suporte',
            items: [
                { icon: Settings, label: 'Preferências', sub: 'Notificações e tema', href: '/profile/preferences' },
                { icon: MessageSquare, label: 'Canal de Ajuda', sub: 'Suporte especializado', href: '/support' },
                { icon: FileText, label: 'Termos Legais', sub: 'Privacidade e uso', href: '/terms' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#050505] to-black text-white font-sans pb-32 pt-10 px-5 max-w-xl lg:max-w-6xl mx-auto overflow-x-hidden">

            {/* Header: User Profile */}
            <div className="flex items-center justify-between mb-12 px-1">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-[2rem] border-2 border-white/5 p-1 glass-premium shadow-2xl relative group">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-[1.8rem]" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-[1.8rem] text-3xl font-black text-primary">
                                {user.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-xl border-4 border-[#080809] flex items-center justify-center shadow-lg">
                            <Star className="w-3 h-3 text-black fill-current" />
                        </span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter leading-tight uppercase italic">{user.name}</h1>
                        <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mt-1 glow-blue">Membro Diamante</p>
                    </div>
                </div>
                <button onClick={() => router.push('/profile/edit')} className="w-12 h-12 glass-premium rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-lg active:scale-90">
                    <Settings className="w-6 h-6" />
                </button>
            </div>

            {/* Menu Groups */}
            <div className="space-y-10">
                {menuSections.map((section, sIdx) => (
                    <div key={sIdx}>
                        <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 ml-4">{section.title}</h2>
                        <div className="glass-premium border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            {section.items.map((item, iIdx) => (
                                <button
                                    key={iIdx}
                                    onClick={() => router.push(item.href)}
                                    className={`w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all group active:opacity-60 ${iIdx !== section.items.length - 1 ? 'border-b border-white/5' : ''}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl glass-premium flex items-center justify-center text-slate-500 group-hover:text-primary transition-all group-hover:scale-105 shadow-inner border-white/5">
                                            <item.icon className="w-5 h-5 transition-colors" strokeWidth={2} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[14px] font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight">{item.label}</p>
                                            <p className="text-[9px] text-slate-500 font-bold group-hover:text-slate-400 transition-colors uppercase tracking-widest mt-0.5">{item.sub}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-800 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sign Out Section */}
            <div className="mt-16 text-center px-1">
                <button
                    onClick={() => {
                        logout();
                        router.push('/home');
                    }}
                    className="w-full py-5 rounded-[2rem] glass-premium border-red-500/10 text-red-500 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                    Encerrar Sessão
                </button>
                <div className="mt-8 flex flex-col gap-1 items-center opacity-30">
                    <img src="/logos/logo_full.png" className="h-4 brightness-0 invert" alt="" />
                    <p className="text-[8px] text-slate-400 uppercase font-bold tracking-[0.4em]">Advanced Client Experience • v2.0</p>
                </div>
            </div>
        </div>
    );
}
