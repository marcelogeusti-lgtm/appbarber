'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import VCLSection from '../components/landing/VCLSection';
import StatsCounter from '../components/landing/StatsCounter';
import WhatsAppHighlight from '../components/landing/WhatsAppHighlight';
import ProductShowcase from '../components/landing/ProductShowcase';
import HowItWorks from '../components/landing/HowItWorks';
import ComparisonMatrix from '../components/landing/ComparisonMatrix';
import PerspectiveCTA from '../components/landing/PerspectiveCTA';
import PremiumExperience from '../components/landing/PremiumExperience';
import Features from '../components/landing/Features';
import Pricing from '../components/landing/Pricing';
import MainDashboardShowcase from '../components/landing/MainDashboardShowcase';
import ProblemSolution from '../components/landing/ProblemSolution';
import CheckoutShowcase from '../components/landing/CheckoutShowcase';
import Footer from '../components/landing/Footer';

export default function Home() {
    // hasMounted logic removed to restore proper SSR hydration

    return (
        <main className="min-h-screen bg-[#050505] text-white relative pb-20 md:pb-0 overflow-x-hidden selection:bg-primary/30">
            {/* Ultra-Premium Cinematic Grain Texture */}
            <div className="fixed inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="relative z-10">
                <Navbar />
                <Hero />
                <StatsCounter />
                <ProblemSolution />
                <VCLSection />
                <ProductShowcase />
                <HowItWorks />
                <MainDashboardShowcase />
                <WhatsAppHighlight />
                <ComparisonMatrix />
                <PremiumExperience />
                <CheckoutShowcase />
                <Features />
                <Pricing />
                <PerspectiveCTA />
                <Footer />
            </div>
        </main>
    );
}
