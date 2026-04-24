'use client';
import { Play } from 'lucide-react';
import LEDCardWrapper from './LEDCardWrapper';

export default function VCLSection() {
    return (
        <section className="py-24 bg-[#050505] relative overflow-hidden border-y border-white/5">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tighter">
                        Veja como barbearias estão organizando <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent italic">agenda e faturamento</span> com o NEXT
                    </h2>
                </div>

                <div className="max-w-5xl mx-auto relative group">
                    <LEDCardWrapper className="w-full">
                        <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-[#0A0A0B] group/video cursor-pointer border border-white/10 h-full">
                            {/* Decorative Glow behind video */}
                            <div className="absolute -inset-10 bg-primary/10 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            
                            {/* Placeholder image for the video */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 to-gray-800 opacity-90 transition-opacity duration-500 group-hover:opacity-70" />
                            <img
                                src="https://images.unsplash.com/photo-1543781525-2e1180b6a153?auto=format&fit=crop&w=1600&h=900"
                                alt="Múltiplos barbeiros trabalhando"
                                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 group-hover:scale-105 transition-transform duration-700"
                            />

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center relative z-20">
                                <div className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.2)] group-hover/video:scale-110 group-hover/video:bg-primary group-hover/video:text-white transition-all duration-500">
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
                    </LEDCardWrapper>
                </div>
            </div>
        </section>
    );
}
