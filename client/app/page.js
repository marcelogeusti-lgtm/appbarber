'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Marquee from '../components/landing/Marquee';
import VCLSection from '../components/landing/VCLSection';
import ComparisonMatrix from '../components/landing/ComparisonMatrix';
import PerspectiveCTA from '../components/landing/PerspectiveCTA';
import Testimonials from '../components/landing/Testimonials';
import Pricing from '../components/landing/Pricing';
import MainDashboardShowcase from '../components/landing/MainDashboardShowcase';
import HowItWorks from '../components/landing/HowItWorks';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';

export default function Home() {
    // hasMounted logic removed to restore proper SSR hydration

    return (
        <main className="min-h-screen bg-[#050505] text-white relative pb-20 md:pb-0 [overflow-x:clip] selection:bg-primary/30">
            {/* Ultra-Premium Cinematic Grain Texture */}
            <div className="fixed inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="relative z-10">
                <Navbar />
                <Hero />
                <Marquee />
                <VCLSection />
                <MainDashboardShowcase />
                <HowItWorks />
                <Testimonials />
                <ComparisonMatrix />
                <Pricing />
                <FAQ />
                <PerspectiveCTA />
                <Footer />
            </div>
        </main>
    );
}
