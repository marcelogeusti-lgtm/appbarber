'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/clientApi';

const ClientAuthContext = createContext({});

export function ClientAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        // Load session from storage on mount
        const storedUser = localStorage.getItem('clientUser');
        const storedToken = localStorage.getItem('clientToken');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });

            if (res.data.user.role !== 'CLIENT') {
                throw new Error('Apenas contas de clientes podem acessar esta área.');
            }

            const { token, user } = res.data;

            localStorage.setItem('clientToken', token);
            localStorage.setItem('clientUser', JSON.stringify(user));

            setUser(user);
            setIsLoginModalOpen(false); // Close modal on success
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Erro ao realizar login'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientUser');
        setUser(null);
        // No redirect, just clear state
    };

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    return (
        <ClientAuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            isLoginModalOpen,
            openLoginModal,
            closeLoginModal
        }}>
            {children}
        </ClientAuthContext.Provider>
    );
}

export const useClientAuth = () => useContext(ClientAuthContext);
