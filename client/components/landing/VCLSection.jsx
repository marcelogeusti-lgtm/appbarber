'use client';
import { Play } from 'lucide-react';

export default function VCLSection() {
    return (
        <section className="py-24 bg-white relative overflow-hidden border-y border-gray-50">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h2 className="text-3xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                        Veja como barbearias estão organizando <br className="hidden md:block" />
                        <span className="text-primary italic">agenda e faturamento</span> com o NEXT
                    </h2>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl bg-gray-900 group cursor-pointer border-8 border-gray-50">
                        {/* Placeholder image for the video */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 to-gray-800 opacity-90 transition-opacity duration-500 group-hover:opacity-70" />
                        <img
                            src="https://images.unsplash.com/photo-1543781525-2e1180b6a153?auto=format&fit=crop&w=1600&h=900"
                            alt="Múltiplos barbeiros trabalhando"
                            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 group-hover:scale-105 transition-transform duration-700"
                        />

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_60px_rgba(37,99,235,0.6)] group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
                                <Play className="w-10 h-10 fill-current ml-2" />
                            </div>
                        </div>

                        {/* Fictional progress bar */}
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/20">
                            <div className="w-1/3 h-full bg-primary relative">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
