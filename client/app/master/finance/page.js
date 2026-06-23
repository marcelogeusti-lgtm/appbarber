'use client';
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

export default function MasterFinance() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">Financeiro Global</h1>
                <p className="text-white/40 text-sm font-medium mt-1">Gestão de repasses, faturamento e integrações com Gateways.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Saldo Disponível (Gateway)</p>
                        <h3 className="text-3xl font-black text-white">R$ 14.520,00</h3>
                    </div>
                </div>

                <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Entradas (Mês Atual)</p>
                        <h3 className="text-3xl font-black text-emerald-500">R$ 3.840,00</h3>
                    </div>
                </div>

                <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                            <ArrowDownRight className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Repasses Pendentes</p>
                        <h3 className="text-3xl font-black text-red-500">R$ 890,00</h3>
                    </div>
                </div>
            </div>

            {/* Empty State / Coming Soon */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/20">
                    <DollarSign className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Painel de Split de Pagamentos</h2>
                <p className="text-white/40 text-sm max-w-md mx-auto mb-8">
                    A integração profunda com a API do gateway para listar todas as transações, estornos e realizar o Split de Pagamentos está em desenvolvimento.
                </p>
                <button className="bg-primary/10 text-primary border border-primary/20 font-bold px-6 py-3 rounded-xl uppercase text-xs tracking-widest">
                    Configurar Credenciais do Gateway
                </button>
            </div>
        </div>
    );
}
