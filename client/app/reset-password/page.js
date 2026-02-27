'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Link de redefinição inválido ou ausente.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.password !== passwordData.confirmPassword) {
            return setError('As senhas não coincidem.');
        }

        if (passwordData.password.length < 6) {
            return setError('A senha deve ter pelo menos 6 caracteres.');
        }

        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/reset-password', {
                token,
                password: passwordData.password
            });
            setMessage(res.data.message);
            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao redefinir senha. O link pode ter expirado.');
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
                        Defina sua <span className="text-primary">nova senha</span>.
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Escolha uma senha forte para manter sua conta segura.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-24 relative z-10 bg-white">
                <div className="max-w-md w-full mx-auto">
                    <div className="p-8 lg:p-10 bg-white border border-zinc-200 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        {success ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-zinc-900 mb-4">Senha Redefinida!</h2>
                                <p className="text-zinc-500 mb-8">
                                    Sua senha foi alterada com sucesso. Redirecionando para o login...
                                </p>
                                <Link
                                    href="/login"
                                    className="block w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-center"
                                >
                                    Fazer Login Agora
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-10">
                                    <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mx-auto mb-6">
                                        <Lock className="w-6 h-6 text-zinc-400" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-zinc-900 mb-2">Nova Senha</h2>
                                    <p className="text-zinc-500">
                                        Digite sua nova senha de acesso.
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium flex items-center gap-2 justify-center">
                                        <AlertCircle className="w-4 h-4" /> {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Nova Senha</label>
                                        <input
                                            type="password"
                                            required
                                            disabled={!token}
                                            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                            placeholder="••••••••"
                                            value={passwordData.password}
                                            onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Confirmar Nova Senha</label>
                                        <input
                                            type="password"
                                            required
                                            disabled={!token}
                                            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                            placeholder="••••••••"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !token}
                                        className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Salvando...' : 'Redefinir Senha'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
