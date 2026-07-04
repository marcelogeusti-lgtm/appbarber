'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { safeGetItem, safeSetItem } from '../lib/storage';

const BarbershopContext = createContext({});

export function BarbershopProvider({ children }) {
    const [ownedBarbershops, setOwnedBarbershops] = useState([]);
    const [currentBarbershopId, setCurrentBarbershopId] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadOwnedBarbershops = useCallback(async () => {
        try {
            const res = await api.get('/barbershops/mine');
            setOwnedBarbershops(res.data || []);
        } catch (error) {
            console.error('[BarbershopContext] Failed to load owned barbershops:', error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        try {
            const userData = safeGetItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                setCurrentBarbershopId(user?.barbershopId || user?.workedBarbershopId || user?.barbershop?.id || null);
            }
        } catch (error) {
            console.error('[BarbershopContext] Failed to read current user:', error.message);
        }
        loadOwnedBarbershops();
    }, [loadOwnedBarbershops]);

    // Re-issues the JWT scoped to the chosen unit, then reloads so every
    // dashboard page (most of which read the token/user directly from
    // localStorage on their own) picks up the new barbershop context.
    const switchBarbershop = async (barbershopId) => {
        if (barbershopId === currentBarbershopId) return;
        const res = await api.post('/auth/switch-barbershop', { barbershopId });
        safeSetItem('token', res.data.token);

        const userData = safeGetItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            user.barbershopId = barbershopId;
            user.workedBarbershopId = barbershopId;
            safeSetItem('user', JSON.stringify(user));
        }

        window.location.reload();
    };

    const createBarbershop = async ({ name, address, phone }) => {
        const res = await api.post('/barbershops', { name, address, phone });
        await loadOwnedBarbershops();
        return res.data;
    };

    return (
        <BarbershopContext.Provider value={{
            ownedBarbershops,
            currentBarbershopId,
            loading,
            switchBarbershop,
            createBarbershop,
            refetch: loadOwnedBarbershops
        }}>
            {children}
        </BarbershopContext.Provider>
    );
}

export function useBarbershops() {
    return useContext(BarbershopContext);
}
