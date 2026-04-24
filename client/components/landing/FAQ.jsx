'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
    {
        q: "Preciso cadastrar cartão de crédito para testar?",
        a: "Não! O teste é 100% gratuito e não exigimos nenhum dado financeiro. Você só paga se decidir continuar após o período de teste."
    },
    {
        q: "O sistema funciona no celular?",
        a: "Sim, o NEXT é totalmente responsivo e funciona perfeitamente em celulares, tablets e computadores."
    },
    {
        q: "Como funciona a migração de dados?",
        a: "Possuímos uma ferramenta de importação fácil e, nos planos Pro e Empire, nossa equipe auxilia em todo o processo de migração."
    },
    {
        q: "Posso cancelar quando quiser?",
        a: "Com certeza. Não há fidelidade ou multas. Você pode cancelar sua assinatura a qualquer momento diretamente pelo painel."
    },
    {
        q: "Vocês oferecem suporte?",
        a: "Sim! Oferecemos suporte via chat, e-mail e WhatsApp (para planos Pro e Empire) em horário comercial."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section id="faq" className="py-24 bg-[#050505]">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 tracking-tight">Dúvidas Frequentes</h2>
                    <p className="text-gray-400">Tudo que você precisa saber antes de começar.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className={`border rounded-xl transition-all duration-300 ${openIndex === i ? 'border-primary/50 bg-[#0F1115]' : 'border-white/5 bg-[#09090b]'}`}>
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full text-left p-6 flex justify-between items-center"
                            >
                                <span className="text-lg font-bold text-white">{faq.q}</span>
                                {openIndex === i ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-gray-500" />}
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-40 opacity-100 p-6 pt-0' : 'max-h-0 opacity-0'}`}>
                                <p className="text-gray-400 leading-relaxed text-sm lg:text-base">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
