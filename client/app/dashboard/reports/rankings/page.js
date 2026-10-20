'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Os rankings foram unificados na página de Análise (Gestão de Negócio).
export default function RankingsRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard/owner');
    }, [router]);
    return null;
}
