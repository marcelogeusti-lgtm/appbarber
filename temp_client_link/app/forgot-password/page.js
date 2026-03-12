'use client';
import { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao processar solicitação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex relative overflow-hidden">
            {/* Left Side - Visual (Dark Theme) */}
            <div className="hidden lg:flex w-1/2 bg-[#09090b] relative items-center justify-center overflow-hidden border-r border-white/5">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="relative z-10 max-w-lg px-12">
                    <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                        Recupere seu acesso <span className="text-primary">rapidamente</span>.
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Enviaremos um link de redefinição de senha para o seu e-mail cadastrado.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-24 relative z-10 bg-white">
                <Link href="/login" className="absolute top-8 left-8 text-zinc-500 hover:text-zinc-900 flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar ao login
                </Link>

                <div className="max-w-md w-full mx-auto">
                    <div className="p-8 lg:p-10 bg-white border border-zinc-200 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        {submitted ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-zinc-900 mb-4">Verifique seu e-mail</h2>
                                <p className="text-zinc-500 mb-8">
                                    {message || 'Enviamos as instruções de recuperação para o seu e-mail.'}
                                </p>
                                <Link
                                    href="/login"
                                    className="block w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-center"
                                >
                                    Ir para Login
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-10">
                                    <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mx-auto mb-6">
                                        <Mail className="w-6 h-6 text-zinc-400" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-zinc-900 mb-2">Esqueceu a senha?</h2>
                                    <p className="text-zinc-500">
                                        Digite seu e-mail para receber o link de recuperação.
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium text-center">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">E-mail</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
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
