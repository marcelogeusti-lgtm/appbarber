'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, MessageSquare, Bell } from 'lucide-react';

export default function SettingsLayout({ children }) {
    const pathname = usePathname();

    const tabs = [
        { name: 'Geral', path: '/dashboard/settings', icon: Settings },
        { name: 'Notificações', path: '/dashboard/settings/notifications', icon: MessageSquare },
        // Future tabs: Services, Professionals, etc.
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <header className="bg-card p-8 rounded-[2.5rem] border border-border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-inner shadow-primary/20">
                        <Settings className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Configurações</h1>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Gerencie sua barbearia e preferências</p>
                    </div>
                </div>
            </header>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map(tab => {
                    const isActive = pathname === tab.path;
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.path}
                            href={tab.path}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all border ${isActive
                                ? 'bg-card text-primary border-primary/50 shadow-lg shadow-primary/10'
                                : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-card hover:text-foreground hover:border-border'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{tab.name}</span>
                        </Link>
                    )
                })}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </div>
    );
}
