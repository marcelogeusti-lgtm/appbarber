'use client';
import { useTranslation } from '../../contexts/LanguageContext';

export default function Marquee() {
    const { t } = useTranslation();

    // Features row (moves left, primary color dot)
    const features = [
        "Agenda 24/7",
        "Link na Bio",
        "Recepcionista Virtual",
        "Pix Antecipado",
        "Gestão de Comissões",
        "Lembretes no WhatsApp",
        "Relatórios Financeiros",
        "Controle de Estoque",
        "Fidelização Automática",
        "NPS Sigiloso"
    ];

    // Niches row (moves right, white dot)
    const niches = [
        "Barbearias",
        "Salões de Beleza",
        "Estúdios de Tatuagem",
        "Clínicas de Estética",
        "Design de Sobrancelha",
        "Esmalterias",
        "Spas",
        "Barbearias Premium",
        "Redes e Franquias",
        "Maquiadores"
    ];

    return (
        <section className="overflow-hidden border-y border-white/[0.04] bg-[#050505] select-none py-2">
            
            {/* Row 1 - Features (Moving Left) */}
            <div className="flex overflow-hidden border-b border-white/[0.04]">
                <div className="flex shrink-0" style={{ animation: 'marqueeLeft 40s linear infinite' }}>
                    {[...features, ...features, ...features].map((item, idx) => (
                        <div key={`f-${idx}`} className="flex items-center gap-4 shrink-0 px-8 py-4 border-r border-white/[0.04]">
                            <span className="h-1.5 w-1.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(77,114,228,0.8)]" style={{ background: '#4d72e4' }}></span>
                            <span className="text-[13px] whitespace-nowrap tracking-wide text-white/70 font-medium">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Row 2 - Niches (Moving Right) */}
            <div className="flex overflow-hidden border-b border-white/[0.04]">
                <div className="flex shrink-0" style={{ animation: 'marqueeRight 35s linear infinite' }}>
                    {[...niches, ...niches, ...niches].map((item, idx) => (
                        <div key={`n-${idx}`} className="flex items-center gap-4 shrink-0 px-8 py-4 border-r border-white/[0.04]">
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}></span>
                            <span className="text-[13px] whitespace-nowrap tracking-wide text-white/50 font-medium">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

        </section>
    );
}
