'use client';

const steps = [
    {
        num: "01",
        title: "Crie sua conta",
        desc: "Cadastro rápido em menos de 2 minutos. Sem cartão de crédito."
    },
    {
        num: "02",
        title: "Configure sua barbearia",
        desc: "Defina seus serviços, preços e horários de funcionamento."
    },
    {
        num: "03",
        title: "Divulgue seu link",
        desc: "Compartilhe seu link de agendamento e veja sua agenda encher automaticamente."
    }
]

export default function HowItWorks() {
    return (
        <section id="start" className="py-24 bg-black border-t border-white/5">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row justify-between items-end mb-16">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl font-bold text-white mb-4">Comece agora em 3 passos</h2>
                        <p className="text-gray-400 text-lg">A simplicidade que você buscava.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relaltive">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[60%] left-[20%] w-[60%] h-[2px] bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 z-0" />

                    {steps.map((step, i) => (
                        <div key={i} className="relative z-10 bg-[#09090b] p-8 rounded-3xl border border-white/5">
                            <span className="text-6xl font-black text-white/5 absolute top-4 right-6">{step.num}</span>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mb-6 border border-primary/20">
                                {i + 1}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-gray-400">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
