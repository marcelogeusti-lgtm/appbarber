import './globals.css';
import { Inter } from 'next/font/google';
import clsx from 'clsx';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Barbe-On - Sistema de Gestão para Barbearias',
    description: 'O sistema de gestão que sua barbearia merece',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={clsx(inter.className, 'min-h-screen bg-background font-sans antialiased')}>
                <main className="relative flex min-h-screen flex-col">
                    {children}
                </main>
            </body>
        </html>
    );
}
