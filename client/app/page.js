'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';

export default function Home() {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <div className="min-h-screen bg-[#050505]" />;
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
            <Navbar />
            <Hero />
        </main>
    );
}
