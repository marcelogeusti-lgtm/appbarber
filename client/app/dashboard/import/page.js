'use client';
import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, Download, FileText, Loader2, Info } from 'lucide-react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function ImportPage() {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState({ clients: [], appointments: [] });
    const [isParsing, setIsParsing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const downloadTemplate = () => {
        const headers = "name,phone,email,notes,is_appointment,date,time,service_name,professional_name,status\n" +
            "João Silva,11999999999,joao@email.com,Nota cliente,nao,,,,, \n" +
            "Maria Souza,11888888888,,,sim,2026-05-10,14:30,Corte M,Marcio,CONFIRMED";
        const blob = new Blob([headers], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "modelo_importacao_appbarber.csv";
        a.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFile(file);
        parseFile(file);
    };

    const parseFile = async (selectedFile) => {
        setIsParsing(true);
        // Usaremos PapaParse dinamicamente para não quebrar no SSR ou caso não tenha npm import
        try {
            const Papa = (await import('papaparse')).default;
            
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const rows = results.data;
                    const clients = [];
                    const appointments = [];

                    rows.forEach((row, i) => {
                        // Linha tem que ter telefone pelo menos para ser válida
                        if (!row.phone) return;

                        if (row.is_appointment && row.is_appointment.toLowerCase() === 'sim') {
                            appointments.push({
                                client_phone: row.phone,
                                client_name: row.name,
                                date: row.date,
                                time: row.time,
                                service_name: row.service_name,
                                professional_name: row.professional_name,
                                status: row.status
                            });
                        } else {
                            clients.push({
                                name: row.name,
                                phone: row.phone,
                                email: row.email,
                                notes: row.notes
                            });
                        }
                    });

                    setParsedData({ clients, appointments });
                    setIsParsing(false);
                    setStep(3); // Preview
                },
                error: (error) => {
                    toast.error('Erro ao ler CSV: ' + error.message);
                    setIsParsing(false);
                }
            });
        } catch (err) {
            toast.error("Por favor, execute 'npm install papaparse' no terminal para ativar o modo de leitura CSV.");
            setIsParsing(false);
        }
    };

    const confirmImport = async () => {
        if (parsedData.clients.length === 0 && parsedData.appointments.length === 0) {
            return toast.error("Nenhum dado válido encontrado para importar.");
        }
        
        setIsSubmitting(true);
        try {
            const res = await api.post('/import/process', parsedData);
            setResult(res.data);
            setStep(5);
            toast.success("Importação concluída!");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Falha na importação. Verifique os dados.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const downloadErrorReport = () => {
        if (!result || !result.errors || result.errors.length === 0) return;
        let content = "TIPO,LINHA_ORIGINAL,ERRO\n";
        result.errors.forEach(e => {
            content += `${e.type},${e.row},"${e.error}"\n`;
        });
        const blob = new Blob([content], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = "relatorio_erros_importacao.csv";
        a.click();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Copying requirement */}
            <div className="bg-card rounded-xl p-8 border border-border">
                <h1 className="text-2xl font-black uppercase text-foreground mb-2">Trazer Meus Dados</h1>
                <p className="text-lg text-primary font-bold">Mude de sistema sem perder seus clientes ou horários. Leva menos de 2 minutos.</p>
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">Use esta ferramenta para subir sua base de clientes antigos e seus compromissos futuros. Nossa IA organiza e mescla tudo automaticamente para você.</p>
            </div>

            {/* Steps Container */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 hidden md:flex">
                {[1, 2, 3, 5].map((s, idx) => (
                    <div key={s} className={`h-2 rounded-full flex-1 ${step >= s ? 'bg-primary' : 'bg-muted border border-border'}`} />
                ))}
            </div>

            {/* STEP 1 & 2: Download & Upload */}
            {step <= 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card p-8 rounded-xl border border-border flex flex-col items-center justify-center text-center hover:border-primary/50 transition-all">
                        <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-4">
                            <Download className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">1. Baixe o Modelo Padrão</h3>
                        <p className="text-sm text-muted-foreground mb-6">Utilize nossa planilha oficial para garantir que todas as colunas sejam lidas perfeitamente pelo sistema.</p>
                        <button onClick={downloadTemplate} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                            Download Modelo CSV <FileText className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="bg-card p-8 rounded-xl border border-dashed border-primary/40 flex flex-col items-center justify-center text-center relative hover:bg-primary/5 transition-all">
                        <input
                            type="file"
                            accept=".csv" // Futuramente .xlsx
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
                            {isParsing ? <Loader2 className="w-8 h-8 animate-spin" /> : <UploadCloud className="w-8 h-8" />}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">2. Suba a Planilha Preenchida</h3>
                        <p className="text-sm text-muted-foreground mb-6">Arraste seu arquivo CSV para cá ou clique para procurar no computador.</p>
                        <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-black uppercase tracking-widest text-[10px] pointer-events-none">
                            Selecionar Arquivo
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3 & 4: Preview and Confirm */}
            {step === 3 && (
                <div className="bg-card rounded-xl border border-border p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-white">3. Pré-visualização dos Dados</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Identificamos <span className="font-bold text-primary">{parsedData.clients.length}</span> clientes e <span className="font-bold text-primary">{parsedData.appointments.length}</span> agendamentos.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => { setStep(1); setFile(null); }} className="text-sm text-muted-foreground hover:text-white px-4 py-2">
                                Cancelar
                            </button>
                            <button onClick={confirmImport} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Confirmar Importação
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-primary font-black uppercase tracking-widest text-[9px]">
                                    <th className="py-3 px-4">Tipo</th>
                                    <th className="py-3 px-4">Nome / Cliente</th>
                                    <th className="py-3 px-4">Contato Oficial</th>
                                    <th className="py-3 px-4">Data / Hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Preview primeirso 5 clientes e 5 agend */}
                                {parsedData.clients.slice(0, 5).map((c, i) => (
                                    <tr key={`c-${i}`} className="border-b border-border/50 hover:bg-white/5">
                                        <td className="py-3 px-4"><span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded text-xs font-bold">Cliente</span></td>
                                        <td className="py-3 px-4 text-white font-medium">{c.name}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{c.phone}</td>
                                        <td className="py-3 px-4 text-muted-foreground">-</td>
                                    </tr>
                                ))}
                                {parsedData.appointments.slice(0, 5).map((a, i) => (
                                    <tr key={`a-${i}`} className="border-b border-border/50 hover:bg-white/5">
                                        <td className="py-3 px-4"><span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-xs font-bold">Agenda</span></td>
                                        <td className="py-3 px-4 text-white font-medium">{a.client_name || 'Desconhecido'}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{a.client_phone}</td>
                                        <td className="py-3 px-4 text-white font-bold">{a.date} às {a.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(parsedData.clients.length > 5 || parsedData.appointments.length > 5) && (
                            <div className="text-center py-4 text-xs text-muted-foreground bg-muted/50 rounded-b-xl border border-t-0 border-border">
                                Exibindo apenas as primeiras 10 linhas para verificação. A importação em massa lerá todos os dados silenciosamente.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* STEP 5: Feedback Post-Import */}
            {step === 5 && result && (
                <div className="bg-card rounded-xl border border-border p-8 text-center max-w-2xl mx-auto mt-12">
                    <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">Importação Concluída!</h2>
                    <p className="text-muted-foreground mb-8">Nossos robôs finalizaram a leitura do seu arquivo e conectaram tudo no banco de dados.</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-[#09090b] border border-border p-6 rounded-xl">
                            <p className="text-[10px] font-black uppercase text-primary mb-1">Clientes Adicionados</p>
                            <p className="text-4xl text-white font-bold">{result.successCount?.clients || 0}</p>
                        </div>
                        <div className="bg-[#09090b] border border-border p-6 rounded-xl">
                            <p className="text-[10px] font-black uppercase text-primary mb-1">Agendamentos Criados</p>
                            <p className="text-4xl text-white font-bold">{result.successCount?.appointments || 0}</p>
                        </div>
                    </div>

                    {result.errors && result.errors.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3 text-red-500 text-left">
                                <AlertTriangle className="w-6 h-6" />
                                <div>
                                    <p className="font-bold">Houve erros em {result.errors.length} linhas.</p>
                                    <p className="text-xs opacity-80">Geralmente por telefones faltando ou nomes de barbeiros errados.</p>
                                </div>
                            </div>
                            <button onClick={downloadErrorReport} className="bg-red-500 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">
                                Baixar Erros
                            </button>
                        </div>
                    )}

                    <div className="mt-8">
                        <button onClick={() => window.location.reload()} className="text-sm text-primary hover:underline font-bold">
                            Voltar para o Início
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
