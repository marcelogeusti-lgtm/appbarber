'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import CashierPanel from '../../components/CashierPanel';
import NewOrderModal from '../../components/NewOrderModal';
import NewTransactionModal from '../../components/NewTransactionModal';

import { SocketProvider } from '../../contexts/SocketContext';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isCashierOpen, setIsCashierOpen] = useState(false);
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
    const [isTransactionOpen, setIsTransactionOpen] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const userData = localStorage.getItem('user');
                if (userData) {
                    setUser(JSON.parse(userData));
                    setLoading(false);
                } else {
                    // Token exists but no user data? Invalid state.
                    localStorage.removeItem('token');
                    router.push('/login');
                }
            } catch (err) {
                console.error('Error parsing user data in layout:', err);
                localStorage.clear();
                router.push('/login');
            }
        };

        checkAuth();
    }, [router]);

    const logout = () => {
        localStorage.clear();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    const isSubscriptionActive = () => {
        if (user?.role === 'CLIENT' || user?.role === 'SUPER_ADMIN') return true;
        const shop = user?.barbershop || user?.workedBarbershop || user?.ownedBarbershops?.[0];
        return shop?.subscriptionStatus === 'ACTIVE';
    };

    const isLocked = !isSubscriptionActive();

    return (
        <SocketProvider>
            <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-emerald-500/30">
                {/* Sidebar Component */}
                <Sidebar user={user} isLocked={isLocked} logout={logout} />

                {/* Cashier Panel */}
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

                {/* New Order Modal */}
                <NewOrderModal
                    isOpen={isNewOrderOpen}
                    onClose={() => setIsNewOrderOpen(false)}
                    user={user}
                />

                {/* New Transaction Modal */}
                <NewTransactionModal
                    isOpen={isTransactionOpen}
                    onClose={() => setIsTransactionOpen(false)}
                    user={user}
                    type="EXPENSE"
                    onSuccess={() => {
                        // Could trigger a refresh if we had a global context, but panel refreshes on open
                    }}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-screen relative">
                    <TopBar
                        user={user}
                        isLocked={isLocked}
                        onMobileMenuClick={() => { }}
                        onOpenCashier={() => setIsCashierOpen(true)}
                    />

                    <main className="flex-1 p-8 md:p-12 overflow-x-hidden relative">
                        {isLocked ? (
                            <div className="absolute inset-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-sm flex items-center justify-center p-8">
                                <div className="bg-[#111827] border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
                                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <LogOut className="w-10 h-10 text-red-500" />
                                    </div>
                                    <h2 className="text-2xl font-black text-white mb-2">Assinatura Inativa</h2>
                                    <p className="text-slate-400 mb-8 leading-relaxed">
                                        Sua assinatura está inativa ou vencida. Para continuar utilizando os recursos administrativos, por favor regularize seu plano.
                                    </p>
                                    <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
                                        Regularizar Agora
                                    </button>
                                    <p className="mt-4 text-[10px] text-slate-600 uppercase tracking-widest">
                                        Dúvidas? Entre em contato com o suporte.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            children
                        )}
                    </main>
                </div>
            </div>
        </SocketProvider>
    );
}
