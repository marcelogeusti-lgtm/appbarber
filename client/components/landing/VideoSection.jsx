'use client';
import { Play } from 'lucide-react';

export default function VideoSection() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10" />

            <div className="container px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-glow">
                        Case de <span className="text-primary">Sucesso</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-[800px] mx-auto">
                        Veja como barbearias de todo o Brasil estão transformando sua gestão com nossa plataforma.
                    </p>
                </div>

                {/* Video Container */}
                <div className="relative max-w-5xl mx-auto group cursor-pointer">
                    {/* Border Gradient */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-primary rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>

                    {/* Main Video Box */}
                    <div className="relative rounded-xl bg-slate-900 aspect-video flex items-center justify-center overflow-hidden border border-white/10 shadow-2xl">
                        {/* Overlay Image (Placeholder) */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                        {/* Play Button */}
                        <div className="relative z-10 w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                                <Play className="w-6 h-6 text-black fill-black ml-1" />
                            </div>
                        </div>

                        {/* Text Overlay */}
                        <div className="absolute bottom-8 left-8 z-10 text-left">
                            <p className="text-white font-bold text-2xl mb-1">A Revolução na Gestão</p>
                            <p className="text-white/60">Assista ao depoimento completo</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
