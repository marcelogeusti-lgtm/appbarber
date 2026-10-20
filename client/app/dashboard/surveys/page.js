'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// A Pesquisa (NPS) agora fica dentro de Avaliações, na aba "NPS".
export default function SurveysRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/reviews?tab=nps');
    }, [router]);

    return <div className="p-8 text-center animate-pulse uppercase text-xs font-black text-muted-foreground">Redirecionando...</div>;
}
