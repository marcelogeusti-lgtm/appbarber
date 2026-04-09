'use client';
import { useQuery } from '@tanstack/react-query';
import {
    Copy, ExternalLink, Scissors, CheckCircle, ShoppingBag, ArrowRight, Calendar as CalendarIcon, TrendingUp, DollarSign, Globe, Users as UsersIcon, Loader2, PlayCircle, BookOpen, Hand
} from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';
import { safeGetItem } from '../../lib/storage';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const [publicUrl, setPublicUrl] = useState('');

    const getUser = () => {
        if (typeof window === 'undefined') return null;
        return safeGetItem('user', true);
    };

    const user = getUser();
    const bId = user?.barbershopId || user?.barbershop?.id || user?.ownedBarbershops?.[0]?.id;

    // Fetch Fresh Barbershop Data (including slug)
    const { data: barbershop } = useQuery({
        queryKey: ['barbershop-me', bId],
        queryFn: async () => {
            const res = await api.get('/barbershops/me');
            return res.data;
        },
        enabled: !!bId,
    });

    useEffect(() => {
        if (barbershop?.slug) {
            setPublicUrl(`${window.location.origin}/${barbershop.slug}`);
        } else if (user?.barbershop?.slug) {
            setPublicUrl(`${window.location.origin}/${user.barbershop.slug}`);
        }
    }, [barbershop, user]);

    // React Query for Stats
    const { data: stats, isLoading, isError, refetch } = useQuery({
        queryKey: ['dashboardStats', bId],
        queryFn: async () => {
            const res = await api.get(`/dashboard/stats?barbershopId=${bId}`);
            return {
                revenueToday: res.data.revenueToday || 0,
                appointmentsToday: res.data.appointmentsToday || 0,
                clientsTotal: res.data.clientsTotal || 0,
                openCommands: res.data.openCommands || 0,
                onboarding: res.data.onboarding || { hasServices: false, hasGateway: false, hasNfe: false }
            };
        },
        enabled: !!bId,
        staleTime: 30000,
    });

    if (!user || isLoading) return <DashboardSkeleton />;
    if (isError) return <div className="p-8 text-center text-red-500">Erro ao carregar dados.</div>;

    const copyToClipboard = () => {
        if (!publicUrl) return;
        navigator.clipboard.writeText(publicUrl);
        alert('Link copiado!');
    };

    const shopName = barbershop?.commercialName || barbershop?.name || user?.barbershop?.name || user?.name || 'Minha Barbearia';

    const onboarding_completed = Boolean(
        user?.name && 
        barbershop?.phone && 
        (barbershop?.name || barbershop?.commercialName) && 
        stats?.onboarding?.hasServices
    );

    const renderWelcomeHeader = () => (
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 mb-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-4 flex items-center gap-3">
                    <Hand className="w-8 h-8" /> Bem-vindo(a) ao {shopName}
                </h1>
                <p className="text-sm font-medium opacity-90 leading-relaxed">
                    Gerencie sua empresa, agende clientes e receba pagamentos automaticamente.
                    Siga os passos abaixo para ativar seu sistema completo em menos de 2 minutos.
                </p>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
                <Globe size={240} />
            </div>
        </div>
    );

    const renderStandardHeader = () => (
        <div className="bg-card rounded-xl p-6 border border-border flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 uppercase tracking-tighter">
                        Olá, {shopName}
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Gestão Ativa</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Link
                    href="/search"
                    target="_blank"
                    className="h-9 px-4 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-primary/10"
                >
                    Marketplace <ExternalLink className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );

    const renderEducationalBlock = () => (
        <div className="bg-card rounded-xl p-8 border border-border space-y-6 flex-1">
            <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Como o sistema funciona:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mb-3">1</div>
                    <h4 className="font-bold text-sm">Compartilhe o link</h4>
                    <p className="text-xs text-muted-foreground">Coloque na bio do Instagram ou envie no WhatsApp.</p>
                </div>
                <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mb-3">2</div>
                    <h4 className="font-bold text-sm">O cliente agenda</h4>
                    <p className="text-xs text-muted-foreground">Eles escolhem o serviço e o horário sozinhos, 24h.</p>
                </div>
                <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mb-3">3</div>
                    <h4 className="font-bold text-sm">O sistema organiza</h4>
                    <p className="text-xs text-muted-foreground">Você acompanha as métricas, recebe e gerencia aqui.</p>
                </div>
            </div>
        </div>
    );

    const renderSupportBlock = () => (
        <div className="bg-muted p-8 rounded-xl flex flex-col justify-between border border-border h-full">
            <div>
                <h3 className="text-lg font-black uppercase tracking-tighter mb-2">Central de Ajuda</h3>
                <p className="text-xs text-muted-foreground mb-6">Acesse tutoriais interativos e suporte especializado sempre que precisar.</p>
            </div>
            <Link href="/dashboard/tutorials" className="w-full bg-card hover:bg-card/80 border border-border text-foreground py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all text-center">
                Ver Tutoriais
            </Link>
        </div>
    );

    const renderMetrics = () => {
        if (!onboarding_completed) return null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard title="Faturamento Hoje" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.revenueToday)} icon={DollarSign} />
                <StatCard title="Agendamentos" value={stats?.appointmentsToday} icon={CalendarIcon} />
                <StatCard title="Clientes" value={stats?.clientsTotal} icon={UsersIcon} />
                <StatCard title="Comandas Abertas" value={stats?.openCommands} icon={ShoppingBag} color="text-amber-500" />
            </div>
        );
    };

    return (
        <div className="bg-background text-foreground space-y-6 animate-in fade-in duration-500 pb-12 w-full max-w-6xl mx-auto">
            {!onboarding_completed ? renderWelcomeHeader() : renderStandardHeader()}

            {!onboarding_completed && (
                <div className="mb-8">
                    <OnboardingChecklist 
                        isProfileComplete={Boolean(user?.name && barbershop?.phone && barbershop?.name)} 
                        hasServices={stats?.onboarding?.hasServices} 
                        stats={stats} 
                    />
                </div>
            )}

            {renderMetrics()}

            {onboarding_completed && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <ActionBox icon={Scissors} title="Gerenciar Serviços" desc="Adicione novos cortes, barbas e tratamentos." href="/dashboard/services" />
                   <ActionBox icon={CheckCircle} title="Configurações Fiscais" desc="Ative sua emissão de nota fiscal automática." href="/dashboard/finance/nfes" />
               </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {onboarding_completed && (
                    <div className="lg:col-span-2 bg-card rounded-xl p-8 border border-border space-y-6">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Seu Link de Agendamento</h3>
                            <p className="text-sm text-muted-foreground mb-4">Compartilhe este link em seu Instagram e WhatsApp para receber agendamentos automáticos.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-muted rounded-xl border border-border px-4 py-3 flex items-center relative group">
                                <span className="text-xs font-mono text-slate-500 truncate mr-8">{publicUrl || 'Carregando...'}</span>
                                <button onClick={copyToClipboard} className="absolute right-2 p-2 hover:bg-card rounded-lg text-muted-foreground hover:text-primary"><Copy className="w-4 h-4" /></button>
                            </div>
                            <a href={publicUrl} target="_blank" rel="noreferrer" className="bg-slate-900 border border-slate-800 text-white px-6 rounded-xl flex items-center justify-center hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest">Abrir</a>
                        </div>
                    </div>
                )}
                
                {!onboarding_completed && (
                    <div className="lg:col-span-2 flex">
                        {renderEducationalBlock()}
                    </div>
                )}

                <div className="flex flex-col h-full">
                    {renderSupportBlock()}
                </div>
            </div>
        </div>
    );
}

// Subcomponents

function OnboardingChecklist({ isProfileComplete, hasServices, stats }) {
    const steps = [
        {
            title: 'Configurar Perfil Básico',
            completed: isProfileComplete,
            href: '/dashboard/owner',
            required: true
        },
        {
            title: 'Criar Mínimo de 1 Serviço',
            completed: hasServices,
            href: '/dashboard/services',
            required: true
        },
        {
            title: 'Habilitar Agendamento',
            completed: isProfileComplete && hasServices, // Auto-complete if basics are there
            href: '/dashboard/settings',
            required: true
        },
        {
            title: 'Configurar Pagamentos Pix/Cartão',
            completed: stats?.onboarding?.hasGateway,
            href: '/dashboard/settings',
            required: false
        },
        {
            title: 'Configurar Notas Fiscais (NFS-e)',
            completed: stats?.onboarding?.hasNfe,
            href: '/dashboard/finance/nfes',
            required: false
        }
    ];

    const completedCount = steps.filter(s => s.completed).length;

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                            🚀 Configure seu Sistema
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">Siga os passos abaixo, alguns são essenciais.</p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                        {completedCount} de {steps.length} Concluídos
                    </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-2 transition-all duration-500 rounded-full" style={{ width: `${(completedCount / steps.length) * 100}%` }}></div>
                </div>
            </div>
            <div className="divide-y divide-border">
                {steps.map((step, idx) => (
                    <Link key={idx} href={step.href} className="flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors group">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 ${step.completed ? 'bg-primary border-primary text-white' : 'border-border text-muted-foreground'}`}>
                            {step.completed ? <CheckCircle className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                        </div>
                        <div className="flex-1">
                            <h4 className={`text-sm font-bold ${step.completed ? 'text-muted-foreground line-through' : 'text-foreground group-hover:text-primary transition-colors'}`}>
                                {step.title}
                            </h4>
                        </div>
                        <div>
                            {!step.required && <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mr-4 hidden md:inline">Opcional</span>}
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color = "text-primary" }) {
    return (
        <div className="bg-card p-6 rounded-xl border border-border group hover:border-primary/30 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-muted border border-border group-hover:border-primary/20`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{title}</p>
            <h4 className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">{value}</h4>
        </div>
    );
}

function ActionBox({ icon: Icon, title, desc, href }) {
    return (
        <Link href={href} className="flex items-center gap-5 p-6 bg-card border border-border rounded-xl hover:border-primary/40 group transition-all">
            <div className="p-4 bg-muted rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="text-sm font-black uppercase text-foreground mb-0.5">{title}</h4>
                <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ArrowRight className="ml-auto w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
        </Link>
    );
}
