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
            // Check specific flags enabled for this user context
            // actually the rollout controller usually returns ALL flags for super admin
            // but for a normal user we might need a checking endpoint.
            // However, to keep it simple and efficient, let's assume we fetch "configuration" 
            // matching the user's view.

            // For the frontend, we often want to know "What features are ON for me?"
            // The existing `featureFlag.controller.js` `getFlags` returns flags based on the user's scope.

            const res = await api.get('/feature-flags');
            // Note: Ensure /feature-flags maps to featureFlag.controller.getFlags

            setFlags(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to load feature flags", err);
            // Fallback to empty
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
        // Logic: 
        // 1. Is there a flag with this key?
        // 2. Is it enabled globally (barbershopId === null) OR enabled checks for my barbershop?
        // The API `getFlags` should return the resolved state or list of explicit flags.

        // If the API returns a list of ALL flags (global + specific), we need to resolve precedence here.
        // Precedence: Specific Barbershop > Global

        // Find specific flag for this barbershop
        const specific = flags.find(f => f.key === key && f.barbershopId === userBarbershopId);
        if (specific) return specific.enabled;

        // Find global flag
        const global = flags.find(f => f.key === key && f.barbershopId === null);
        if (global) return global.enabled;

        // Default to false if no flag exists
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
