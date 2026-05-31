'use client';
import { 
    Shield, Lock, Eye, Database, Share2, UserCheck, 
    Smartphone, Globe, Info, Mail
} from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { useTranslation } from '../../contexts/LanguageContext';

export default function PrivacyPage() {
    const { t } = useTranslation();

    const sections = [
        {
            title: t('privacy.section1_title') || "1. Informações que Coletamos",
            icon: <Database className="w-6 h-6 text-emerald-400" />,
            content: t('privacy.section1_content') || "**Dados do Estabelecimento:** Nome fantasia, CNPJ, endereço, telefone, e-mail e dados de faturamento.\\n**Dados dos Clientes Finais:** Nome, telefone, histórico de agendamentos e preferências de serviço (coletados pelo Estabelecimento utilizando o sistema NEXT).\\n**Dados de Uso:** Logs de acesso, endereço IP, tipo de navegador e métricas de interação com a plataforma para fins de diagnóstico e melhoria."
        },
        {
            title: t('privacy.section2_title') || "2. Como Utilizamos seus Dados",
            icon: <Eye className="w-6 h-6 text-emerald-400" />,
            content: t('privacy.section2_content') || "Os dados são utilizados estritamente para:\\n- Fornecer, operar e manter os serviços do sistema NEXT;\\n- Processar transações financeiras e emitir notas fiscais;\\n- Enviar avisos administrativos, atualizações técnicas e alertas de segurança;\\n- Melhorar nossos algoritmos e interface de usuário através de dados anonimizados."
        },
        {
            title: t('privacy.section3_title') || "3. Compartilhamento de Informações",
            icon: <Share2 className="w-6 h-6 text-emerald-400" />,
            content: t('privacy.section3_content') || "O NEXT **não vende, aluga ou comercializa** dados pessoais. As informações só são compartilhadas com:\\n- **Fornecedores de infraestrutura:** (ex: AWS, Google Cloud) que possuem rigorosos contratos de confidencialidade;\\n- **Gateways de Pagamento:** (ex: Stripe, Mercado Pago, Pagar.me) estritamente para processamento financeiro;\\n- **Autoridades Judiciais:** mediante ordem legal expressa e fundamentada."
        },
        {
            title: t('privacy.section4_title') || "4. Segurança e Proteção",
            icon: <Shield className="w-6 h-6 text-emerald-400" />,
            content: t('privacy.section4_content') || "Empregamos os mais altos padrões de segurança do mercado:\\n- **Criptografia:** Todos os dados são trafegados via SSL/TLS 256 bits;\\n- **Backups:** Rotinas diárias de backup armazenadas em data centers geograficamente redundantes;\\n- **Acesso Restrito:** Apenas engenheiros autorizados possuem acesso a bancos de dados, e toda interação é auditada."
        },
        {
            title: t('privacy.section5_title') || "5. Seus Direitos (LGPD)",
            icon: <UserCheck className="w-6 h-6 text-emerald-400" />,
            content: t('privacy.section5_content') || "Garantimos todos os direitos previstos na Lei Geral de Proteção de Dados (Lei 13.709/2018):\\n- Acesso e portabilidade dos dados (exportáveis diretamente via painel);\\n- Correção de dados incompletos ou inexatos;\\n- Exclusão de dados (o 'direito ao esquecimento'), ressalvadas as obrigações legais de guarda para fins fiscais e de auditoria."
        },
        {
            title: t('privacy.section6_title') || "6. Responsabilidade do Estabelecimento",
            icon: <Lock className="w-6 h-6 text-emerald-400" />,
            content: t('privacy.section6_content') || "É de inteira responsabilidade do Estabelecimento (Controlador) obter o **consentimento** de seus clientes finais para o envio de mensagens (WhatsApp/SMS) e registro de suas informações no sistema NEXT (Operador). O NEXT fornece a infraestrutura, mas a legalidade da coleta na ponta é do usuário."
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-32">
                
                {/* Header */}
                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-6">
                        <Lock className="w-4 h-4" />
                        {t('privacy.subtitle') || "Transparência e Proteção de Dados • LGPD"}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        {t('privacy.title') || "Política de Privacidade"}
                    </h1>
                    <p className="text-lg text-white/60 leading-relaxed max-w-3xl" dangerouslySetInnerHTML={{__html: t('privacy.intro') || "A privacidade dos seus dados e dos dados dos seus clientes é o pilar da <strong className=\"text-white\">StarApp Sistemas LTDA ME</strong>. Este documento detalha de forma transparente como coletamos, armazenamos, processamos e protegemos as informações trafegadas no ecossistema <strong className=\"text-white\">NEXT</strong>."}}>
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-8">
                    {sections.map((section, index) => (
                        <div key={index} className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="shrink-0">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-black border border-white/10">
                                        {section.icon}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-4 text-white">
                                        {section.title}
                                    </h3>
                                    <div className="text-white/60 leading-relaxed text-[15px] space-y-4">
                                        {section.content.split('\\n').map((paragraph, i) => (
                                            <p key={i} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer DPO */}
                <div className="mt-16 p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <Info className="w-5 h-5 text-emerald-400" />
                            {t('privacy.dpo_title') || "Fale com nosso DPO"}
                        </h3>
                        <p className="text-white/60 text-sm max-w-lg">
                            {t('privacy.dpo_desc') || "Para exercer seus direitos LGPD, solicitar exportação de dados ou dúvidas sobre privacidade, acione nosso Encarregado de Dados (DPO)."}
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 items-end">
                        <a href="mailto:dpo@nextsistemas.com" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-black border border-white/10 hover:border-emerald-500/30 text-white font-medium transition-colors w-full md:w-auto">
                            <Mail className="w-4 h-4 text-emerald-400" />
                            dpo@nextsistemas.com
                        </a>
                        <a href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold transition-colors w-full md:w-auto hover:bg-emerald-400">
                            Voltar para o Início
                        </a>
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
}
