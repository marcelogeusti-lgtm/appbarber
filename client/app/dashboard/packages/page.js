'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// "Pacotes" agora são planos não recorrentes (SubscriptionPlan com isRecurring=false),
// gerenciados em Planos & Assinaturas.
export default function PackagesRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/subscriptions');
    }, [router]);

    return (
        <div className="p-8 text-center text-muted-foreground animate-pulse font-black uppercase text-xs">
            Redirecionando para Planos & Pacotes...
        </div>
    );
}
