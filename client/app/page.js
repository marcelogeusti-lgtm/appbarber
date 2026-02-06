import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import VideoSection from '../components/landing/VideoSection';
import Pricing from '../components/landing/Pricing';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';

export default function Home() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
            <Navbar />
            <Hero />
            <Features />
            <HowItWorks />
            <VideoSection />
            <Testimonials />
            <Pricing />
            <FAQ />
            <Footer />
        </main>
    );
}
