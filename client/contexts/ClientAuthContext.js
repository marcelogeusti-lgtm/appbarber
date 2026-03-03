'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/clientApi';
import { auth, googleProvider, facebookProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

const ClientAuthContext = createContext({});

export function ClientAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        const storedToken = localStorage.getItem('clientToken');
        if (storedToken) {
            try {
                // Verify with backend
                const res = await api.get('/auth/me');
                if (res.data.role === 'CLIENT') {
                    setUser(res.data);
                    // Update stored user just in case
                    localStorage.setItem('clientUser', JSON.stringify(res.data));
                } else {
                    // Invalid role (e.g. Pro token leaking)
                    logout();
                }
            } catch (error) {
                console.error('Session verification failed:', error);
                logout();
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password, context: 'CLIENT' });

            // Backend now handles context checks, but double check here
            if (res.data.user.role !== 'CLIENT' && !res.data.user.authUserId) { // authUserId check for Loose Client
                // Strict check: server should reject, but frontend safety:
                // throw new Error('Acesso restrito a clientes.');
            }

            const { token, user } = res.data;
            persistSession(token, user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erro ao realizar login.'
            };
        }
    };

    const register = async (data) => {
        try {
            const res = await api.post('/auth/register', { ...data, role: 'CLIENT' });
            const { token, user } = res.data;
            persistSession(token, user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erro ao criar conta.'
            };
        }
    };

    const googleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const { email, displayName, photoURL, uid } = result.user;

            // Backend Sync
            return await socialBackendSync({
                email,
                name: displayName,
                avatarUrl: photoURL,
                provider: 'GOOGLE',
                providerId: uid
            });
        } catch (error) {
            console.error('Google Auth Error:', error);
            return { success: false, message: 'Erro ao autenticar com Google.' };
        }
    };

    const facebookLogin = async () => {
        if (!auth.config?.apiKey || auth.config.apiKey.includes('YOUR_API_KEY')) {
            return { success: false, message: 'Erro de configuração: Chaves do Firebase não definidas.' };
        }
        try {
            const result = await signInWithPopup(auth, facebookProvider);
            const { email, displayName, photoURL, uid } = result.user;
            return await socialBackendSync({
                email,
                name: displayName,
                avatarUrl: photoURL,
                provider: 'FACEBOOK',
                providerId: uid
            });
        } catch (error) {
            console.error('Facebook Auth Error:', error);
            return { success: false, message: 'Erro ao autenticar com Facebook.' };
        }
    };

    const socialBackendSync = async (payload) => {
        try {
            const res = await api.post('/auth/social-login', { ...payload, context: 'CLIENT' });
            const { token, user } = res.data;
            persistSession(token, user);

            // Redirect to home after login
            // Redirect to home or stay on page
            // router.push('/home'); // REMOVED: keep context

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Falha na comunicação com servidor.'
            };
        }
    };

    const persistSession = (token, userData) => {
        localStorage.setItem('clientToken', token);
        localStorage.setItem('clientUser', JSON.stringify(userData));
        setUser(userData);
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(false);
        setIsForgotPasswordModalOpen(false);
    };

    const logout = () => {
        localStorage.removeItem('clientToken');
        localStorage.removeItem('clientUser');
        localStorage.removeItem('user'); // Also clear generic user to prevent cross-pollution
        setUser(null);
        // User stays on page, interface updates to logged-out state via context
    };

    const openLoginModal = () => { setIsLoginModalOpen(true); setIsRegisterModalOpen(false); setIsForgotPasswordModalOpen(false); };
    const closeLoginModal = () => setIsLoginModalOpen(false);

    const openRegisterModal = () => { setIsRegisterModalOpen(true); setIsLoginModalOpen(false); setIsForgotPasswordModalOpen(false); };
    const closeRegisterModal = () => setIsRegisterModalOpen(false);

    const openForgotPasswordModal = () => { setIsForgotPasswordModalOpen(true); setIsLoginModalOpen(false); };
    const closeForgotPasswordModal = () => setIsForgotPasswordModalOpen(false);

    return (
        <ClientAuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            googleLogin,
            facebookLogin,
            logout,
            isLoginModalOpen,
            openLoginModal,
            closeLoginModal,
            isRegisterModalOpen,
            openRegisterModal,
            closeRegisterModal,
            isForgotPasswordModalOpen,
            openForgotPasswordModal,
            closeForgotPasswordModal
        }}>
            {children}
        </ClientAuthContext.Provider>
    );
}

export const useClientAuth = () => useContext(ClientAuthContext);
