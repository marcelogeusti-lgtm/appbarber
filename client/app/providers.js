'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { ClientAuthProvider } from '../contexts/ClientAuthContext';
import { FeatureFlagProvider } from '../contexts/FeatureFlagContext';
import FcmManager from '../components/FcmManager';

export default function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,
                gcTime: 10 * 60 * 1000,
                refetchOnWindowFocus: true,
                retry: 1,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <ClientAuthProvider>
                <FeatureFlagProvider>
                    <FcmManager />
                    {children}
                </FeatureFlagProvider>
            </ClientAuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
