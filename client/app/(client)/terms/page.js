'use client';
import { FileText, Shield, CheckCircle } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-white tracking-tight">Termos de Uso</h1>
                <p className="text-slate-500 text-sm font-medium">Última atualização: 27 de Fevereiro, 2026</p>
            </div>

            <div className="prose prose-invert max-w-none space-y-6">
                <div className="bg-[#111] border border-white/5 rounded-3xl p-8 space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        1. Aceitação dos Termos
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Ao acessar e utilizar o aplicativo **AppBarber**, você concorda em cumprir e vincular-se aos seguintes termos e condições de uso. Este serviço é destinado a facilitar o agendamento de serviços de barbearia entre clientes e profissionais independentes.
                    </p>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-3xl p-8 space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-500" />
                        2. Privacidade e Dados
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Sua privacidade é importante para nós. Coletamos apenas as informações necessárias para gerenciar seus agendamentos, como nome, e-mail e telefone. Seus dados nunca são compartilhados com terceiros para fins publicitários sem seu consentimento explícito.
                    </p>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-3xl p-8 space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        3. Cancelamentos e No-Show
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Cada estabelecimento possui sua própria política de cancelamento. Recomendamos cancelar com pelo menos 2 horas de antecedência. O não comparecimento sem aviso prévio pode resultar em restrições para futuros agendamentos.
                    </p>
                </div>
            </div>
        </div>
    );
}
