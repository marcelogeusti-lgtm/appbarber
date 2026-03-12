import './globals.css';
import { Inter } from 'next/font/google';
import clsx from 'clsx';
import Providers from './providers';
import { Toaster } from 'sonner';
import FcmManager from '../components/FcmManager';
import LoginModal from '../components/client-view/LoginModal';
import RegisterModal from '../components/client-view/RegisterModal';
import ForgotPasswordModal from '../components/client-view/ForgotPasswordModal';

const inter = Inter({ subsets: ['latin'] });

// Google Login Configuration Trigger Fix (Clean Env)
export const metadata = {
    title: 'NEXT - Sistema de Gestão para Barbearias',
    description: 'O sistema de gestão que sua barbearia merece',
    manifest: '/manifest.json',
    icons: {
        icon: '/icon.png',
        shortcut: '/icon.png',
        apple: '/apple-icon.png',
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={clsx(inter.className, 'min-h-screen bg-background antialiased')}>
                <main className="relative flex min-h-screen flex-col">
                    <Providers>
                        <FcmManager />
                        <LoginModal />
                        <RegisterModal />
                        <ForgotPasswordModal />
                        {children}
                        <Toaster richColors position="top-center" />
                    </Providers>
                </main>
            </body>
        </html>
    );
}
