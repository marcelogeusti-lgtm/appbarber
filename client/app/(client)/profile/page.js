'use client';
import { useState, useEffect } from 'react';
import { User, Settings, LogOut, ChevronRight, Heart, MapPin, Shield, CreditCard, File } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const menuItems = [
        { icon: User, label: 'Meus Dados', href: '#' },
        { icon: MapPin, label: 'Endereços', href: '#' },
        { icon: Heart, label: 'Favoritos', href: '#' },
        { icon: CreditCard, label: 'Meus Cartões', href: '#' },
        { icon: Settings, label: 'Preferências', href: '/profile/preferences' },
        { icon: Shield, label: 'Segurança', href: '#' },
        { icon: File, label: 'Termos de Uso', href: '#' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans pb-10">
            <header className="p-6 pt-10 flex items-center gap-4 border-b border-slate-900 bg-slate-950">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center font-black text-3xl text-slate-500 border-4 border-slate-900 shadow-xl">
                    {user?.name?.charAt(0) || <User />}
                </div>
                <div>
                    <h1 className="text-xl font-black text-white">{user?.name}</h1>
                    <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
                    <button className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Editar Perfil</button>
                </div>
            </header>

            <div className="p-6 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2 mb-2">Conta</p>
                {menuItems.slice(0, 4).map((item, i) => (
                    <button key={i} className="w-full bg-slate-900/50 p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-slate-800 hover:bg-slate-900 transition group">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition">
                                <item.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-200">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                ))}

                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2 mt-6 mb-2">Geral</p>
                {menuItems.slice(4).map((item, i) => (
                    <button key={i} onClick={() => item.href !== '#' && router.push(item.href)} className="w-full bg-slate-900/50 p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-slate-800 hover:bg-slate-900 transition group">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition">
                                <item.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-200">{item.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                ))}

                <button onClick={handleLogout} className="w-full p-4 mt-8 rounded-2xl flex items-center justify-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 transition">
                    <LogOut className="w-4 h-4" /> Sair da Conta
                </button>
            </div>

            <p className="text-center text-[10px] text-slate-700 font-medium py-6">Versão 1.0.0</p>
        </div>
    );
}
