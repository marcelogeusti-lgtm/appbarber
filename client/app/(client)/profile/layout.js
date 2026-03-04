'use client';
import ProfileSidebar from '../../../components/client-view/ProfileSidebar';

export default function ProfileLayout({ children }) {
    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-73px)] bg-[#050505] max-w-7xl mx-auto">
            <ProfileSidebar />
            <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
