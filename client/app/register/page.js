'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'CLIENT', // Default
        barbershopName: '' // If Admin
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            router.push('/dashboard');
        } catch (err) {
            console.error('Register Error Detail:', err);
            const isLocalhost = api.defaults.baseURL.includes('localhost');
            const detail = err.response?.data?.message || err.message;

            let msg = `Erro no Registro: ${detail}`;
            if (isLocalhost && window.location.hostname !== 'localhost') {
                msg += '\n\nAVISO: O site está tentando conectar no "localhost". Verifique se a variável NEXT_PUBLIC_API_URL no Vercel está correta!';
            }
            alert(msg);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h2 className="text-3xl font-bold text-center">Criar uma conta</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input name="name" placeholder="Nome Completo" onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="password" type="password" placeholder="Senha" onChange={handleChange} className="w-full p-2 border rounded" required />

                    <select name="role" onChange={handleChange} className="w-full p-2 border rounded">
                        <option value="CLIENT">Eu sou um Cliente</option>
                        <option value="ADMIN">Sou Dono de Barbearia</option>
                    </select>

                    {formData.role === 'ADMIN' && (
                        <input name="barbershopName" placeholder="Nome da Sua Barbearia" onChange={handleChange} className="w-full p-2 border rounded" required />
                    )}

                    <button type="submit" className="w-full bg-primary text-white p-2 rounded hover:bg-primary/90">
                        Criar Conta
                    </button>
                </form>
            </div>
        </div>
    );
}
