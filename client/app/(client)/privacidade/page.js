'use client';
import { 
    Shield, Lock, Eye, Database, Share2, UserCheck, 
    Smartphone, Globe, Info, Mail
} from 'lucide-react';

const sections = [
    {
        id: 'coleta',
        title: '1. Coleta de Informações',
        icon: <Database className="w-5 h-5 text-primary" />,
        content: `Coletamos dados necessários para a prestação de nossos serviços, tais como:\n- **Dados de Cadastro**: Nome, e-mail, telefone e dados da empresa.\n- **Dados de Uso**: Endereço IP, tipo de navegador, páginas visitadas e tempo de permanência.\n- **Dados de Agendamento**: Informações inseridas pelos clientes finais nas páginas de agendamento das barbearias.`
    },
    {
        id: 'finalidade',
        title: '2. Finalidade do Tratamento',
        icon: <Eye className="w-5 h-5 text-blue-500" />,
        content: `Seus dados são utilizados para:\n- Prover e manter as funcionalidades da plataforma.\n- Processar pagamentos e assinaturas.\n- Enviar notificações de agendamento (via WhatsApp/E-mail).\n- Melhorar a experiência do usuário e segurança do sistema.`
    },
    {
        id: 'compartilhamento',
        title: '3. Compartilhamento de Dados',
        icon: <Share2 className="w-5 h-5 text-emerald-500" />,
        content: `O NEXT não vende dados pessoais. Compartilhamos informações apenas com parceiros essenciais:\n- **Gateways de Pagamento**: Para processar cobranças.\n- **Serviços de Infraestrutura**: Servidores de nuvem (AWS/Vercel).\n- **Serviços de Notificação**: APIs de envio de mensagens.`
    },
    {
        id: 'seguranca',
        title: '4. Segurança da Informação',
        icon: <Lock className="w-5 h-5 text-amber-500" />,
        content: `Implementamos protocolos de segurança rigorosos, incluindo criptografia SSL/TLS e firewalls de aplicação. O acesso aos dados é restrito a colaboradores autorizados e treinados em práticas de privacidade.`
    },
    {
        id: 'direitos',
        title: '5. Seus Direitos (LGPD)',
        icon: <UserCheck className="w-5 h-5 text-purple-500" />,
        content: `Como titular dos dados, você tem o direito de:\n- Confirmar a existência de tratamento.\n- Acessar, corrigir ou anonimizar seus dados.\n- Solicitar a portabilidade dos dados.\n- Revogar o consentimento a qualquer momento.`
    },
    {
        id: 'cookies',
        title: '6. Política de Cookies',
        icon: <Globe className="w-5 h-5 text-rose-500" />,
        content: `Utilizamos cookies para manter sua sessão ativa e analisar o tráfego do site. Você pode gerenciar as preferências de cookies através das configurações do seu navegador.`
    }
];

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col gap-4 text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <Lock className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Política <span className="text-primary">de Privacidade</span>
                </h1>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
                    Conformidade LGPD • Atualizado em 19 de Abril de 2026
                </p>
                <div className="h-1 w-20 bg-primary/20 mx-auto rounded-full mt-4" />
            </div>

            {/* Intro text */}
            <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
                <p className="text-slate-400 text-lg leading-relaxed mb-0 relative z-10">
                    Sua privacidade é nossa prioridade absoluta. Esta política detalha como o 
                    <strong className="text-white"> NEXT</strong> coleta, usa e protege suas informações pessoais e os dados 
                    de seus clientes, em total transparência com a 
                    <strong className="text-white"> Lei Geral de Proteção de Dados (LGPD)</strong>.
                </p>
            </div>

            {/* Sections List */}
            <div className="grid gap-6">
                {sections.map((section, idx) => (
                    <div 
                        key={section.id} 
                        className="bg-[#111] border border-white/5 rounded-[2rem] p-8 md:p-10 space-y-6 hover:border-white/10 transition-all group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="p-3.5 bg-white/5 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                {section.icon}
                            </div>
                            <div>
                                <span className="text-primary/40 text-[10px] font-black uppercase tracking-widest block mb-1">
                                    Seção {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                </span>
                                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-none">
                                    {section.title}
                                </h2>
                            </div>
                        </div>
                        <p className="text-slate-400 text-base md:text-lg leading-relaxed whitespace-pre-line border-l-2 border-white/5 pl-6 group-hover:border-primary/20 transition-all">
                            {section.content}
                        </p>
                    </div>
                ))}
            </div>

            {/* DPO Contact Info */}
            <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-10 text-center">
                <div className="flex justify-center mb-4">
                    <Mail className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Encarregado de Dados (DPO)</h3>
                <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
                    Para exercer seus direitos ou tirar dúvidas sobre o tratamento de seus dados pessoais, entre em contato 
                    diretamente com nosso Encarregado através do e-mail abaixo:
                </p>
                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white text-sm font-black rounded-xl transition-all border border-white/5 tracking-widest">
                    PRIVACIDADE@CORTECONEXAO.COM.BR
                </button>
            </div>
        </div>
    );
}
