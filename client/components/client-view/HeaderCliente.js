'use client';
import { useState, useEffect } from 'react';
import { Menu, Bell, Search, Loader2 } from 'lucide-react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import api from '../../lib/clientApi';

export default function HeaderCliente({ onMenuOpen }) {
    const { user } = useClientAuth();
    const [nextAppointment, setNextAppointment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchNextAppointment();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchNextAppointment = async () => {
        try {
            const res = await api.get('/appointments/me');
            const apps = res.data || [];
            const now = new Date();
            const futureApps = apps
                .filter(a => (a.status === 'PENDING' || a.status === 'CONFIRMED') && new Date(a.date) >= now)
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            if (futureApps.length > 0) {
                setNextAppointment(futureApps[0]);
            }
        } catch (err) {
            console.error('Err header fetch:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatNextApp = () => {
        if (!nextAppointment) return 'Nenhum agendamento pendente';
        const date = new Date(nextAppointment.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
        const time = nextAppointment.time || '';
        return `Próximo: ${date} às ${time} - ${nextAppointment.barbershop?.commercialName || nextAppointment.barbershop?.name || 'Minha Barbearia'}`;
    };

    return (
        <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 py-3 px-4 md:px-8">
            <div className="flex items-center justify-between gap-4">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onMenuOpen}
                    className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Left: Greeting */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg md:text-xl font-bold text-white truncate">
                        Olá, {user?.name?.split(' ')[0] || 'Visitante'} 👋
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        {loading ? (
                            <Loader2 className="w-3 h-3 text-slate-600 animate-spin" />
                        ) : (
                            <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate uppercase tracking-wider">
                                {formatNextApp()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1 md:gap-3">
                    <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all">
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-[#050505]"></span>
                    </button>
                </div>
            </div>
        </header>
    );
}
