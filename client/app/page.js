'use client';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import WhatsAppHighlight from '../components/landing/WhatsAppHighlight';
import ProductShowcase from '../components/landing/ProductShowcase';
import Features from '../components/landing/Features';
import Pricing from '../components/landing/Pricing';
import MainDashboardShowcase from '../components/landing/MainDashboardShowcase';
import CheckoutShowcase from '../components/landing/CheckoutShowcase';
import RollingNotificationFeed from '../components/landing/RollingNotificationFeed';
import SideSocialProof from '../components/landing/SideSocialProof';
import Footer from '../components/landing/Footer';

export default function Home() {
    return (
        <main className="min-h-screen bg-white">
            <SideSocialProof />
            <Navbar />
            <Hero />
            <MainDashboardShowcase />
            <CheckoutShowcase />
            <WhatsAppHighlight />
            <ProductShowcase />
            <Features />
            <Pricing />
            <Footer />
        </main>
    );
}
