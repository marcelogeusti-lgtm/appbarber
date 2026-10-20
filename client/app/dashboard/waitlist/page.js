'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// A Lista de Espera agora vive como aba da Agenda.
export default function WaitlistRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard/schedule?tab=waitlist');
    }, [router]);
    return null;
}
