'use client';
import { useState } from 'react';
import { X, Mail, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import api from '../../lib/clientApi';

export default function ForgotPasswordModal() {
    const { isForgotPasswordModalOpen, closeForgotPasswordModal, openLoginModal } = useClientAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!isForgotPasswordModalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao enviar email de recuperação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={closeForgotPasswordModal}
            />

            <div className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                <button
                    onClick={closeForgotPasswordModal}
                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Recuperar Senha</h2>
                    <p className="text-slate-500 text-sm">Digite seu email para receber o link</p>
                </div>

                {success ? (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-white font-bold text-lg">Email enviado!</h3>
                            <p className="text-slate-400 text-sm">Verifique sua caixa de entrada (e spam) para redefinir sua senha.</p>
                        </div>
                        <button
                            onClick={openLoginModal}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition"
                        >
                            Voltar para o Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs text-slate-400 font-bold ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary/90 hover:bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Enviar Link
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
