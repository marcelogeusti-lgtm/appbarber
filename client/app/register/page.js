'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';
import { safeSetItem } from '../../lib/storage';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN', // SaaS Owners
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
        <div className="min-h-screen bg-white flex">
            {/* Left Side - Image & Value Proposition (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-black flex-col justify-center p-12 overflow-hidden">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 z-0 opacity-40"
                    style={{
                        backgroundImage: "url('/img/barber-bg-dark.jpg')", // Placeholder for a nice barber background
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />

                <div className="relative z-20 max-w-lg mx-auto w-full">
                    <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                        Gerencie sua barbearia com <span className="text-primary">inteligência</span>.
                    </h1>

                    <div className="space-y-4 mt-8">
                        <div className="flex items-center gap-3 text-gray-300 text-lg">
                            <CheckCircle2 className="w-6 h-6 text-primary/80" />
                            <span>Agenda automática</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300 text-lg">
                            <CheckCircle2 className="w-6 h-6 text-primary/80" />
                            <span>Controle financeiro</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300 text-lg">
                            <CheckCircle2 className="w-6 h-6 text-primary/80" />
                            <span>Site personalizado</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300 text-lg">
                            <CheckCircle2 className="w-6 h-6 text-primary/80" />
                            <span>Marketing integrado</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-gray-50/50">
                <div className="absolute top-8 left-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Voltar ao site
                    </Link>
                </div>

                <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 shadow-xl border border-gray-100 mt-12 lg:mt-0">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Crie sua conta grátis</h2>
                        <p className="text-sm text-gray-500">Comece a usar o sistema em menos de 2 minutos.</p>
                    </div>

                    {/* Tab Switcher (Visual Output like reference) */}
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                        <Link href="/login" className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                            Entrar
                        </Link>
                        <div className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold bg-primary text-white shadow-sm">
                            Criar Conta
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nome Completo</label>
                            <input
                                name="name"
                                placeholder="Seu nome"
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nome da Empresa</label>
                            <input
                                name="barbershopName"
                                placeholder="Ex: Minha Barbearia ou Salão"
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">E-mail</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="seu@email.com"
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Senha</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="Crie uma senha forte"
                                onChange={handleChange}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-sm mt-2 text-sm"
                        >
                            {loading ? 'Criando...' : 'Começar Gratuitamente'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-[11px] text-gray-400">
                            Ao criar uma conta, você concorda com nossos<br />
                            <Link href="/termos" className="underline hover:text-gray-600">Termos de Uso</Link> e <Link href="/privacidade" className="underline hover:text-gray-600">Política de Privacidade</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
