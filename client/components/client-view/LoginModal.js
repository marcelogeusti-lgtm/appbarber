'use client';
import { useState } from 'react';
import { X, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useClientAuth } from '../../contexts/ClientAuthContext';

export default function LoginModal() {
    const {
        isLoginModalOpen,
        closeLoginModal,
        login,
        googleLogin,
        facebookLogin,
        openRegisterModal,
        openForgotPasswordModal
    } = useClientAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 2FA State
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [twoFactorMethod, setTwoFactorMethod] = useState('');
    const [mfaToken, setMfaToken] = useState('');

    if (!isLoginModalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password, twoFactorRequired ? mfaToken : null);

        if (!result.success) {
            if (result.requires2FA) {
                setTwoFactorRequired(true);
                setTwoFactorMethod(result.method);
                setLoading(false);
                return;
            }
            setError(result.message);
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        setError('');
        // NOTE: We don't set local loading state because the popup is external, 
        // but we could if we wanted to show a spinner while waiting for popup close.
        const result = provider === 'google' ? await googleLogin() : await facebookLogin();

        if (!result.success) {
            setError(result.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={closeLoginModal}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                <button
                    onClick={closeLoginModal}
                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Acessar conta</h2>
                    <p className="text-slate-500 text-sm">Faça login para gerenciar seus agendamentos</p>
                </div>

                {/* Social Login */}
                <div className="space-y-4 mb-6">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Continuar com</p>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#222] border border-white/5 hover:border-white/20 text-white p-3 rounded-xl transition font-medium text-xs"
                        >
                            <img src="https://cdn.simpleicons.org/google/white" alt="Google" className="w-4 h-4" />
                            Google
                        </button>
                        <button
                            onClick={() => handleSocialLogin('facebook')}
                            className="flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#222] border border-white/5 hover:border-white/20 text-white p-3 rounded-xl transition font-medium text-xs"
                        >
                            <img src="https://cdn.simpleicons.org/facebook/white" alt="Facebook" className="w-4 h-4" />
                            Facebook
                        </button>
                        <button
                            onClick={() => handleSocialLogin('apple')}
                            className="flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#222] border border-white/5 hover:border-white/20 text-white p-3 rounded-xl transition font-medium text-xs"
                        >
                            <img src="https://cdn.simpleicons.org/apple/white" alt="Apple" className="w-4 h-4" />
                            Apple
                        </button>
                    </div>
                </div>

                <div className="relative flex items-center gap-4 mb-6">
                    <div className="h-px bg-white/5 flex-1" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ou</span>
                    <div className="h-px bg-white/5 flex-1" />
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl mb-4 text-center">
                        {error}
                    </div>
                )}

                {twoFactorRequired ? (
                    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-300">
                        <div className="text-center mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-sm text-slate-300">
                                Código enviado por <strong>{twoFactorMethod === 'EMAIL' ? 'E-mail' : 'SMS/WhatsApp'}</strong>.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-wider text-center block">Código de Acesso</label>
                            <input
                                type="text"
                                required
                                maxLength="6"
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-4 px-4 text-center text-2xl font-mono tracking-[0.5em] text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                                placeholder="000 000"
                                value={mfaToken}
                                onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || mfaToken.length !== 6}
                            className="w-full bg-primary/90 hover:bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar e Entrar'}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setTwoFactorRequired(false); setMfaToken(''); }}
                            className="w-full text-center text-[11px] text-slate-500 hover:text-white mt-4 outline-none transition-colors"
                        >
                            Cancelar
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 font-bold ml-1">Email ou telefone <span className="text-red-500">*</span></label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition" />
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                                    placeholder="Informe o email ou telefone"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 font-bold ml-1">Senha <span className="text-red-500">*</span></label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                                    placeholder="Informe sua senha"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={openForgotPasswordModal}
                                className="text-xs text-slate-500 hover:text-white font-medium transition-colors"
                            >
                                Recuperar senha
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary/90 hover:bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Acessar
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                )}

                <p className="mt-8 text-center text-sm text-slate-500">
                    Não possui uma conta?{' '}
                    <button
                        type="button"
                        onClick={openRegisterModal}
                        className="text-primary hover:text-primary/80 font-bold underline decoration-primary/20 underline-offset-4"
                    >
                        Cadastre-se
                    </button>
                </p>

                <p className="mt-8 text-center text-[10px] text-slate-600 font-medium">
                    Acessando você concorda com o{' '}
                    <Link href="/terms" className="underline hover:text-slate-400 transition-colors">termo de uso</Link>
                </p>
            </div>
        </div>
    );
}
