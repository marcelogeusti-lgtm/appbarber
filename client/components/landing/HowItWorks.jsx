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

                {/* Device Mockup Section */}
                <div className="mt-20 relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full -z-10" />
                    <div className="relative mx-auto max-w-5xl">
                        <div className="aspect-[21/9] rounded-xl bg-slate-900/50 border border-white/10 backdrop-blur-sm overflow-hidden shadow-2xl relative group">
                            {/* Fake Dashboard UI */}
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 p-8 flex items-center justify-center">
                                <div className="text-center z-10">
                                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold mb-4 border border-primary/20">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                        DASHBOARD EM TEMPO REAL
                                    </div>
                                    <h3 className="text-4xl font-bold text-white mb-2">Visão Total do Seu Negócio</h3>
                                    <p className="text-slate-400">Acompanhe agendamentos, financeiro e equipe em um só lugar.</p>
                                </div>
                                {/* Abstract UI Lines - Grid Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent"></div>
                            </div>

                            {/* Floating Stats Cards */}
                            <div className="absolute top-12 left-12 bg-black/80 backdrop-blur-md p-4 pr-8 rounded-xl border border-white/10 shadow-2xl animate-float">
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <div className="text-green-500 font-bold">$</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400">Faturamento Hoje</div>
                                        <div className="text-xl font-bold text-white">R$ 1.250,00</div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-12 right-12 bg-black/80 backdrop-blur-md p-4 pr-8 rounded-xl border border-white/10 shadow-2xl animate-float-delayed">
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <div className="text-blue-500 font-bold">12</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400">Agendamentos</div>
                                        <div className="text-xl font-bold text-white">Próximas 2h</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    )
}
