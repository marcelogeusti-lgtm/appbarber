'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, AlertTriangle, Calendar } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import CashierPanel from '../../components/CashierPanel';
import NewOrderModal from '../../components/NewOrderModal';
import NewTransactionModal from '../../components/NewTransactionModal';
import SupportChat from '../../components/SupportChat';

import { SocketProvider } from '../../contexts/SocketContext';
import { safeGetItem, safeRemoveItem, safeClear } from '../../lib/storage';

import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isCashierOpen, setIsCashierOpen] = useState(false);
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
    const [isTransactionOpen, setIsTransactionOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            try {
                const token = safeGetItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const userData = safeGetItem('user');
                if (userData) {
                    setUser(JSON.parse(userData));
                    setLoading(false);
                } else {
                    safeClear();
                    router.push('/login');
                }
            } catch (err) {
                console.error('Error parsing user data in layout:', err);
                safeClear();
                router.push('/login');
            }
        };

        checkAuth();
    }, [router]);

    // Centralized Barbershop Data using React Query
    const { data: barbershopData } = useQuery({
        queryKey: ['barbershop-me'],
        queryFn: async () => {
            const res = await api.get('/barbershops/me');
            return res.data;
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 30, // 30 minutes cache for shop metadata
    });

    // Proactive Google Calendar Status Check
    const { data: googleStatus } = useQuery({
        queryKey: ['google-calendar-status'],
        queryFn: async () => {
            const res = await api.get('/integration/google/status');
            return res.data;
        },
        enabled: !!user && (user.role === 'ADMIN' || user.role === 'BARBER'),
        staleTime: 1000 * 60 * 60, // Check once per hour
    });

    // PROTECT ADMIN ROUTES
    useEffect(() => {
        if (user?.role === 'CLIENT') {
            router.push('/inicio');
        }
    }, [user, router]);

    const logout = () => {
        safeClear();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-background text-foreground font-sans">
                {/* Skeleton Sidebar */}
                <aside className="w-64 border-r border-border bg-card hidden lg:flex flex-col p-6 opacity-50 animate-pulse">
                    <div className="w-24 h-8 bg-muted rounded-lg mb-10"></div>
                    <div className="space-y-3 flex-1">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="w-full h-10 bg-muted rounded-xl"></div>
                        ))}
                    </div>
                </aside>

                <div className="flex-1 flex flex-col min-h-screen">
                    {/* Skeleton TopBar */}
                    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 md:px-8 opacity-50 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-muted rounded-full"></div>
                            <div className="space-y-2 hidden md:block">
                                <div className="w-32 h-3 bg-muted rounded"></div>
                                <div className="w-20 h-2 bg-muted rounded"></div>
                            </div>
                        </div>
                        <div className="w-20 h-8 bg-muted rounded-lg"></div>
                    </header>
                    <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </main>
                </div>
            </div>
        );
    }

    if (!user) return null;

    // Use query data if available, fallback to user object
    const currentBarbershop = barbershopData || user?.barbershop || user?.workedBarbershop || user?.ownedBarbershops?.[0];

    const isSubscriptionActive = () => {
        if (user?.role === 'SUPER_ADMIN' || user?.isMaster || user?.role === 'CLIENT') return true;
        
        const shop = currentBarbershop;
        if (!shop) return false;

        // SaaS NEXT State Machine
        if (shop.subscriptionStatus === 'ACTIVE') return true;
        if (shop.subscriptionStatus === 'TRIAL') {
            if (shop.trialEndsAt) {
                return new Date() < new Date(shop.trialEndsAt);
            }
            return true; 
        }
        if (shop.subscriptionStatus === 'OVERDUE') {
            // Overdue has a grace period (handled by backend usually, but here we can show a warning)
            return true; // Still allow access if just OVERDUE, but with warning
        }
        
        return false; // BLOCKED or anything else
    };

    const isLocked = !isSubscriptionActive();
    const isOverdue = currentBarbershop?.subscriptionStatus === 'OVERDUE';

    return (
        <SocketProvider>
            <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
                <Sidebar
                    user={user}
                    barbershop={currentBarbershop}
                    isLocked={isLocked}
                    logout={logout}
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                />

                <CashierPanel
                    isOpen={isCashierOpen}
                    onClose={() => setIsCashierOpen(false)}
                    user={user}
                    onOpenNewOrder={() => {
                        setIsCashierOpen(false);
                        setIsNewOrderOpen(true);
                    }}
                    onOpenNewExpense={() => {
                        setIsCashierOpen(false);
                        setIsTransactionOpen(true);
                    }}
                />

                <NewOrderModal
                    isOpen={isNewOrderOpen}
                    onClose={() => setIsNewOrderOpen(false)}
                    user={user}
                />

                <NewTransactionModal
                    isOpen={isTransactionOpen}
                    onClose={() => setIsTransactionOpen(false)}
                    user={user}
                    type="EXPENSE"
                    onSuccess={() => {}}
                />

                <div className="flex-1 flex flex-col min-h-screen relative w-full">
                    <TopBar
                        user={user}
                        barbershop={currentBarbershop}
                        isLocked={isLocked}
                        onMobileMenuClick={() => setIsMobileMenuOpen(true)}
                        onOpenCashier={() => setIsCashierOpen(true)}
                    />

                    <main className="flex-1 p-4 md:p-6 overflow-x-hidden relative">
                        {/* Overdue Warning Banner */}
                        {isOverdue && !isLocked && (
                            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center animate-bounce">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="font-black text-red-900 uppercase tracking-widest text-xs">Pagamento em Atraso</p>
                                        <p className="text-xs text-red-700 font-medium">Sua conta será bloqueada em breve. Regularize sua assinatura para evitar interrupções.</p>
                                    </div>
                                </div>
                                <button className="bg-red-600 text-white font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-xl shadow-lg shadow-red-500/30 hover:scale-105 transition-all">
                                    Regularizar Master
                                </button>
                            </div>
                        )}

                        {/* Proactive Connection Banner */}
                        {!loading && googleStatus && googleStatus.error && !localStorage.getItem('hide-google-banner') && (
                            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-amber-900 uppercase tracking-tight">Sincronização Google Pendente</p>
                                        <p className="text-xs text-amber-700">Sua agenda do Google pode não estar sincronizando corretamente. Por favor, reconecte sua conta.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => router.push('/dashboard/settings?tab=integracoes')}
                                        className="bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                                    >
                                        Reconectar
                                    </button>
                                    <button 
                                        onClick={() => {
                                            localStorage.setItem('hide-google-banner', 'true');
                                            // Force re-render would be needed here, but for now it will hide on next load
                                        }}
                                        className="p-2 text-amber-400 hover:text-amber-600 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}

                        {isLocked ? (
                            <div className="absolute inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center p-8 overflow-hidden">
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] -mr-[250px] -mt-[250px]" />
                                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-destructive/10 blur-[150px] -ml-[250px] -mb-[250px]" />
                                
                                <div className="bg-card border border-border/50 p-12 rounded-[3.5rem] max-w-xl w-full text-center shadow-2xl relative z-10">
                                    <div className="w-20 h-20 bg-destructive/10 rounded-[2rem] border border-destructive/20 flex items-center justify-center mx-auto mb-8 shadow-inner">
                                        <Shield className="w-10 h-10 text-destructive" />
                                    </div>
                                    <h2 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter">Acesso Restrito</h2>
                                    <p className="text-muted-foreground font-medium mb-10 leading-relaxed text-sm italic">
                                        Detectamos que sua assinatura <b>NEXT Diamond</b> expirou ou foi suspensa pela rede master. A governança do orquestrador restringiu os acessos administrativos para esta unidade.
                                    </p>
                                    <div className="space-y-4">
                                        <button className="w-full bg-primary text-primary-foreground font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                            Regularizar Assinatura
                                        </button>
                                        <button 
                                            onClick={logout}
                                            className="w-full bg-background border border-border text-muted-foreground font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl hover:bg-muted transition-all"
                                        >
                                            Sair da Conta
                                        </button>
                                    </div>
                                    <div className="mt-10 pt-8 border-t border-border/50">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black italic opacity-60">SaaS NEXT Dashboard orquestrator v2.4</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            children
                        )}
                    </main>
                </div>
                <SupportChat />
            </div>
        </SocketProvider>
    );
}
