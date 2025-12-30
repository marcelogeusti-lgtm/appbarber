'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) router.push('/login');

        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
    }, [router]);

    const logout = () => {
        localStorage.clear();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:block">
                <div className="p-6">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Corte & Conexão</h2>
                    <div className="bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest inline-block mt-1">
                        {user.role === 'ADMIN' ? '🏢 Dono de Unidade' : user.role === 'SUPER_ADMIN' ? '👑 Gestor Geral' : '✂️ Profissional'}
                    </div>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Visão Geral</Link>

                    {user.role === 'SUPER_ADMIN' && (
                        <Link href="/dashboard/super-admin" className="block px-4 py-2 rounded bg-orange-500 text-white font-bold hover:bg-orange-600 mb-4 italic">👑 Gestão do Sistema</Link>
                    )}

                    {(user.role === 'ADMIN' || user.role === 'BARBER') && (
                        <>
                            <Link href="/dashboard/schedule" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Agenda da Equipe</Link>
                            <Link href="/dashboard/professionals" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Gerenciar Equipe</Link>
                            <Link href="/dashboard/services" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Meus Serviços</Link>
                            <Link href="/dashboard/finance" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Financeiro</Link>
                            <Link href="/dashboard/whatsapp" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Automação WhatsApp</Link>
                        </>
                    )}

                    {user.role === 'CLIENT' && (
                        <Link href="/dashboard/appointments" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">Meus Agendamentos</Link>
                    )}

                    <button onClick={logout} className="w-full text-left block px-4 py-2 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-10">Sair do Sistema</button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white dark:bg-gray-800 shadow px-6 flex items-center justify-between md:hidden">
                    <span className="font-black uppercase text-sm tracking-tighter">Corte & Conexão</span>
                    <button onClick={logout} className="text-xs font-bold text-red-500">Sair</button>
                </header>
                <main className="p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
