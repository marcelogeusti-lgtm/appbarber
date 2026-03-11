'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import WhatsAppHighlight from '../components/landing/WhatsAppHighlight';
import ProductShowcase from '../components/landing/ProductShowcase';
import Features from '../components/landing/Features';
import Pricing from '../components/landing/Pricing';
import MainDashboardShowcase from '../components/landing/MainDashboardShowcase';
import ProblemSolution from '../components/landing/ProblemSolution';
import CheckoutShowcase from '../components/landing/CheckoutShowcase';
import StatsCounter from '../components/landing/StatsCounter';
import Footer from '../components/landing/Footer';
import SideSocialProof from '../components/landing/SideSocialProof';

export default function Home() {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <div className="min-h-screen bg-white" />;
    }

    return (
        <main className="min-h-screen bg-white">
            <SideSocialProof />
            <Navbar />
            <Hero />
            <StatsCounter />
            <MainDashboardShowcase />
            <ProblemSolution />
            <CheckoutShowcase />
            <WhatsAppHighlight />
            <ProductShowcase />
            <Features />
            <Pricing />
            <Footer />
        </main>
    );
}
