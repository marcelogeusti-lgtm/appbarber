'use client';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';

export default function FixedCTA() {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className={`fixed bottom-0 left-0 w-full z-40 md:bottom-6 md:right-6 md:left-auto md:w-auto transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'
                }`}
        >
            <Link href="/register">
                <button className="w-full md:w-auto bg-gray-900 text-white p-4 md:px-8 md:py-4 md:rounded-full font-bold shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-[0_10px_40px_rgba(0,0,0,0.2)] hover:bg-black hover:scale-105 transition-all flex items-center justify-center gap-2 border md:border-2 border-gray-800 backdrop-blur-sm">
                    {t('group4.fixedCta.ctaButton')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1" />
                </button>
            </Link>
        </div>
    );
}
