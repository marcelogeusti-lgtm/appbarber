'use client';
import { X, Check } from 'lucide-react';

export default function ProblemSolutionNeo() {
    return (
        <section className="py-24 bg-white px-6 md:px-12">
            <div className="container mx-auto">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Problem Card */}
                    <div className="bg-[#f4f4f5] border-2 border-dashed border-gray-400 p-10 rounded-[3xl] opacity-70">
                        <h3 className="font-cabinet font-extrabold text-3xl mb-8 uppercase text-gray-500">O Caos Atual 😫</h3>
                        <ul className="space-y-6">
                            {[
                                'Agendas perdidas em papel',
                                'Clientes esquecendo horários',
                                'Zero controle do faturamento',
                                'Sem histórico de serviços'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 font-satoshi font-medium text-lg text-gray-400">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                        <X className="w-5 h-5" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Solution Card */}
                    <div className="bg-[#ffe17c] neo-border neo-shadow-md p-10 rounded-[3xl]">
                        <h3 className="font-cabinet font-extrabold text-3xl mb-8 uppercase">A Solução NEXT 🚀</h3>
                        <ul className="space-y-6">
                            {[
                                'Agendamento 24h automático',
                                'Lembretes via WhatsApp',
                                'Dashboard financeiro real-time',
                                'Fidelização por inteligência'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 font-satoshi font-bold text-lg">
                                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                                        <Check className="w-5 h-5 text-white" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
