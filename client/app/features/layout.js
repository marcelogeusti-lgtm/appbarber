import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

export default function FeaturesLayout({ children }) {
    return (
        <div className="min-h-screen bg-white relative flex flex-col">
            <Navbar />
            <main className="flex-1 pt-24 pb-20">
                {children}
            </main>
            <Footer />
        </div>
    );
}
