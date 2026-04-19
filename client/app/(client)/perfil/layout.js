'use client';
import ProfileSidebar from '../../../components/client-view/ProfileSidebar';

export default function ProfileLayout({ children }) {
    return (
        <div className="relative min-h-[calc(100vh-73px)] bg-[#050505] overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row max-w-7xl mx-auto h-full">
                <ProfileSidebar />
                <main className="flex-1 p-6 lg:p-12 overflow-y-auto custom-scrollbar z-10">
                    <div className="max-w-4xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
