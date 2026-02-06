'use client';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: "Carlos Silva",
        role: "Barbearia Dom Carlos",
        text: "O sistema mudou completamente a gestão da minha barbearia. O agendamento online reduziu em 30% as mensagens no WhatsApp."
    },
    {
        name: "André Souza",
        role: "Studio 88",
        text: "Simplesmente incrível. O controle financeiro é preciso e os clientes adoram a facilidade de agendar pelo link."
    },
    {
        name: "Felipe Mendes",
        role: "The Gentleman Barber",
        text: "O suporte é sensacional e a plataforma não para de evoluir. Melhor investimento que fiz para o meu negócio."
    }
];

export default function Testimonials() {
    return (
        <section className="py-24 bg-black border-y border-white/5">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Depoimentos</h2>
                    <h3 className="text-4xl font-bold text-white">Quem usa, recomenda.</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-[#09090b] border border-white/5 relative">
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-4 h-4 text-yellow-500 fill-yellow-500" />)}
                            </div>
                            <p className="text-gray-300 mb-6 italic leading-relaxed">"{t.text}"</p>
                            <div>
                                <p className="text-white font-bold">{t.name}</p>
                                <p className="text-xs text-primary font-bold uppercase tracking-wider">{t.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
