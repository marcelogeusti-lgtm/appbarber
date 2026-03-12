'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, MessageSquare, Bell } from 'lucide-react';

export default function SettingsLayout({ children }) {
    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 md:px-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </div>
    );
}
