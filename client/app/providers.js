'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { FeatureFlagProvider } from '../contexts/FeatureFlagContext';

import FcmManager from '../components/FcmManager';

export default function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Aumentado para 5 minutos para evitar loading na troca rápida de abas
                staleTime: 5 * 60 * 1000,
                gcTime: 10 * 60 * 1000, // Garbage collection time (mantém dados antigas na RAM por 10 min)
                refetchOnWindowFocus: true, // Recarrega se o usuário sair e voltar pro navegador (Bom para ver status pagos)
                retry: 1, // Não insistir muito se o net cair (evita travamentos ruins)
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <FeatureFlagProvider>
                <FcmManager />
                {children}
            </FeatureFlagProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
