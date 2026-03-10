'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';
import { safeSetItem } from '../../lib/storage';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect to main login page with register tab active is usually better, but keeping standalone just in case
    // For consistency, I will just redirect to /login which now handles both nicely.
    // However, I'll provide a standalone simple version here just in case they land here directly.

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN', // Focusing on SaaS Owners based on prompt
        barbershopName: ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/register', formData);
            const userData = { ...res.data.user, barbershopId: res.data.barbershop?.id };

            safeSetItem('token', res.data.token);
            safeSetItem('user', JSON.stringify(userData));

            router.push('/dashboard');
        } catch (err) {
            console.error('Register error:', err);
            setError(err.response?.data?.message || err.message || 'Erro ao criar conta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#09090b] border border-white/5 rounded-3xl p-8 shadow-2xl">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </Link>

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Criar Conta</h2>
                    <p className="text-gray-400">Junte-se a milhares de barbearias.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <input name="name" placeholder="Nome Completo" onChange={handleChange} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary/50" required />
                    </div>
                    <div>
                        <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary/50" required />
                    </div>
                    <div>
                        <input name="barbershopName" placeholder="Nome da Barbearia" onChange={handleChange} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary/50" required />
                    </div>
                    <div>
                        <input name="password" type="password" placeholder="Senha" onChange={handleChange} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary/50" required />
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,230,118,0.2)]">
                        {loading ? 'Criando...' : 'Criar Conta Grátis'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">
                        Já tem conta? <Link href="/login" className="text-primary hover:underline font-bold">Entrar</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
