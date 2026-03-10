'use client';
import { Star } from 'lucide-react';

const testimonials = [
    { name: 'Ricardo Silva', role: 'Dono do Barber Shop', content: 'O NEXT mudou o jogo pra mim. Agendamento automático é vida!', rating: 5 },
    { name: 'Ana Beatriz', role: 'Gerente Comercial', content: 'Interface linda e muito fácil de usar. Meus clientes adoram.', rating: 5 },
    { name: 'Marcos Paulo', role: 'Barbeiro Autônomo', content: 'O controle financeiro me ajudou a sair do vermelho em 3 meses.', rating: 5 },
];

export default function TestimonialsNeo() {
    return (
        <section className="py-24 bg-[#b7c6c2] px-6">
            <div className="container mx-auto">
                <h2 className="font-cabinet font-extrabold text-5xl lg:text-7xl mb-16 text-center uppercase tracking-tighter">
                    O que dizem os <br /> <span className="text-white">GIGANTES</span>.
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="bg-white neo-border neo-shadow-sm p-10 flex flex-col items-start transition-transform hover:-rotate-1"
                            style={{
                                borderTopRightRadius: '3rem',
                                borderBottomLeftRadius: '3rem',
                                borderTopLeftRadius: '2px',
                                borderBottomRightRadius: '2px'
                            }}
                        >
                            <div className="flex gap-1 mb-6">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-[#ffbc2e] text-[#ffbc2e]" />
                                ))}
                            </div>
                            <p className="font-satoshi font-bold text-xl mb-8 flex-1 italic">"{t.content}"</p>
                            <div>
                                <h4 className="font-cabinet font-extrabold text-lg uppercase">{t.name}</h4>
                                <p className="font-satoshi font-medium text-gray-500 text-sm">{t.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
