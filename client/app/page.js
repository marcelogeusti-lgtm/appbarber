'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/login');
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl"></div>
                <p className="text-white font-bold uppercase tracking-widest text-xs">Acessando Barber On...</p>
            </div>
        </div>
    );
}
