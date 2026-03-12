'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import VCLSection from '../components/landing/VCLSection';
import StatsCounter from '../components/landing/StatsCounter';
import WhatsAppHighlight from '../components/landing/WhatsAppHighlight';
import ProductShowcase from '../components/landing/ProductShowcase';
import Features from '../components/landing/Features';
import Pricing from '../components/landing/Pricing';
import MainDashboardShowcase from '../components/landing/MainDashboardShowcase';
import ProblemSolution from '../components/landing/ProblemSolution';
import CheckoutShowcase from '../components/landing/CheckoutShowcase';
import Footer from '../components/landing/Footer';
import SideSocialProof from '../components/landing/SideSocialProof';
import ToastActivity from '../components/landing/ToastActivity';
import FixedCTA from '../components/landing/FixedCTA';

export default function Home() {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <div className="min-h-screen bg-white" />;
    }

    return (
        <main className="min-h-screen bg-white relative pb-20 md:pb-0 overflow-x-hidden">
            <SideSocialProof />
            <ToastActivity />
            <FixedCTA />
            <Navbar />

            <Hero />
            <StatsCounter />
            <VCLSection />
            <ProblemSolution />
            <ProductShowcase />
            <WhatsAppHighlight />
            <MainDashboardShowcase />
            <CheckoutShowcase />
            <Features />
            <Pricing />
            <Footer />
        </main>
    );
}
