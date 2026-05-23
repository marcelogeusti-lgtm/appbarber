'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const FeatureFlagContext = createContext({
    flags: [],
    isEnabled: (key) => false,
    reloadFlags: () => { },
    loading: true
});

export function FeatureFlagProvider({ children }) {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userBarbershopId, setUserBarbershopId] = useState(null);

    useEffect(() => {
        // Get user once to know which scope to fetch checks for (though the API handles this via session usually)
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;
                setUserBarbershopId(bId);
            } catch (e) {
                console.error("Error parsing user for flags", e);
            }
        }
    }, []);

    const fetchFlags = async () => {
        try {
            const res = await api.get('/feature-flags');
            setFlags(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            // Silently fail for public pages or if unauthorized
            if (err.response?.status !== 401 && err.response?.status !== 403) {
                console.error("Failed to load feature flags", err);
            }
            setFlags([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userBarbershopId !== undefined) {
            fetchFlags();
        }
    }, [userBarbershopId]);

    const isEnabled = (key) => {
        const specific = flags.find(f => f.key === key && f.barbershopId === userBarbershopId);
        if (specific) return specific.enabled;

        const global = flags.find(f => f.key === key && f.barbershopId === null);
        if (global) return global.enabled;

        return false;
    };

    return (
        <FeatureFlagContext.Provider value={{ flags, isEnabled, reloadFlags: fetchFlags, loading }}>
            {children}
        </FeatureFlagContext.Provider>
    );
}

export function useFeatureFlag(key) {
    const { isEnabled, loading } = useContext(FeatureFlagContext);
    return { enabled: isEnabled(key), loading };
}

export function useFeatureFlags() {
    return useContext(FeatureFlagContext);
}
