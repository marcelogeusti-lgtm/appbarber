'use client';
import { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, Download, FileText, Loader2, Info, ArrowRight, Settings2, Table as TableIcon } from 'lucide-react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function ImportPage() {
    const [step, setStep] = useState(1); // 1: Upload, 2: Mapping, 3: Preview, 5: Result
    const [file, setFile] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [mapping, setMapping] = useState({
        name: '',
        phone: '',
        email: '',
        date: '',
        time: '',
        service_name: '',
        professional_name: '',
        status: ''
    });
    const [rawData, setRawData] = useState([]);
    const [parsedData, setParsedData] = useState({ clients: [], appointments: [] });
    const [isParsing, setIsParsing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const downloadTemplate = () => {
        const content = "nome,telefone,email,data,hora,servico,profissional,status\nJoão Silva,11999999999,joao@email.com,2026-05-10,14:30,Corte,Marcio,CONFIRMADO";
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "modelo_appbarber.csv";
        a.click();
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        setFile(selectedFile);
        
        setIsParsing(true);
        try {
            const Papa = (await import('papaparse')).default;
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.meta && results.meta.fields) {
                        setHeaders(results.meta.fields);
                        setRawData(results.data);
                        
                        // Auto-mapping inteligente
                        const newMapping = { ...mapping };
                        results.meta.fields.forEach(h => {
                            const low = h.toLowerCase();
                            if (low.includes('nome') || low.includes('name')) newMapping.name = h;
                            if (low.includes('tel') || low.includes('phone') || low.includes('cel')) newMapping.phone = h;
                            if (low.includes('email') || low.includes('mail')) newMapping.email = h;
                            if (low.includes('data') || low.includes('date')) newMapping.date = h;
                            if (low.includes('hora') || low.includes('time')) newMapping.time = h;
                            if (low.includes('serv') || low.includes('service')) newMapping.service_name = h;
                            if (low.includes('prof') || low.includes('barb')) newMapping.professional_name = h;
                            if (low.includes('status')) newMapping.status = h;
                        });
                        setMapping(newMapping);
                        setStep(2); // Vai para mapeamento
                    }
                    setIsParsing(false);
                }
            });
        } catch (err) {
            toast.error("Erro ao processar arquivo.");
            setIsParsing(false);
        }
    };

    const applyMapping = () => {
        if (!mapping.name || !mapping.phone) {
            return toast.error("Nome e Telefone são obrigatórios para mapear.");
        }

        const clients = [];
        const appointments = [];

        rawData.forEach(row => {
            const phone = row[mapping.phone];
            if (!phone) return;

            const baseData = {
                name: row[mapping.name],
                phone: phone,
                email: row[mapping.email],
                notes: 'Importado via Mapping'
            };

            clients.push(baseData);

            if (row[mapping.date] && row[mapping.time]) {
                appointments.push({
                    client_phone: phone,
                    client_name: row[mapping.name],
                    date: row[mapping.date],
                    time: row[mapping.time],
                    service_name: row[mapping.service_name],
                    professional_name: row[mapping.professional_name],
                    status: row[mapping.status]
                });
            }
        });

        setParsedData({ clients, appointments });
        setStep(3); // Preview
    };

    const confirmImport = async () => {
        setIsSubmitting(true);
        try {
            const res = await api.post('/import/process', parsedData);
            setResult(res.data);
            setStep(5);
            toast.success("Importação concluída!");
        } catch (error) {
            toast.error(error.response?.data?.error || "Falha na importação.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Glass Header */}
            <div className="bg-card/50 backdrop-blur-xl rounded-xl p-10 border border-border/50 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-primary/20 transition-all duration-1000"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
                            <UploadCloud className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Importador de Dados Pro</h1>
                    </div>
                    <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
                        Migre sua base de clientes e agenda de qualquer sistema. <span className="text-primary font-bold">Nosso motor inteligente</span> organiza tudo automaticamente.
                    </p>
                </div>
            </div>

            {/* Stepper Moderno */}
            <div className="flex items-center justify-between px-4">
                {[
                    { s: 1, label: 'Upload', icon: UploadCloud },
                    { s: 2, label: 'Mapeamento', icon: Settings2 },
                    { s: 3, label: 'Revisão', icon: TableIcon },
                    { s: 5, label: 'Sucesso', icon: CheckCircle }
                ].map((item, idx) => (
                    <div key={item.s} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= item.s ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                            {step > item.s ? <CheckCircle className="w-4 h-4" /> : item.s === 5 ? <CheckCircle className="w-4 h-4" /> : item.s}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${step >= item.s ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
                        {idx < 3 && <div className={`w-12 h-[2px] mx-2 rounded-full ${step > item.s ? 'bg-primary' : 'bg-muted'}`} />}
                    </div>
                ))}
            </div>

            {/* STEP 1: UPLOAD */}
            {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-card p-10 rounded-xl border border-border hover:border-primary/30 transition-all group flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Download className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">Baixar Modelo</h3>
                        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">Se você prefere organizar os dados antes, use nossa planilha oficial.</p>
                        <button onClick={downloadTemplate} className="w-full py-4 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all">
                            Baixar CSV <FileText className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="bg-primary/5 p-10 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary transition-all group flex flex-col items-center text-center relative overflow-hidden">
                        <input type="file" accept=".csv" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="w-20 h-20 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            {isParsing ? <Loader2 className="w-10 h-10 animate-spin" /> : <UploadCloud className="w-10 h-10" />}
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">Subir Arquivo</h3>
                        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">Arraste sua lista (CSV) aqui. <br/>Não importa os nomes das colunas!</p>
                        <div className="w-full py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20">
                            Selecionar CSV
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: MAPPING */}
            {step === 2 && (
                <div className="bg-card rounded-xl border border-border p-10 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3 mb-8">
                        <Settings2 className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold">Mapear Colunas</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        {Object.keys(mapping).map(field => (
                            <div key={field} className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                    {field === 'name' ? 'Nome do Cliente*' : 
                                     field === 'phone' ? 'Telefone*' : 
                                     field === 'email' ? 'E-mail' :
                                     field === 'date' ? 'Data do Agend.' :
                                     field === 'time' ? 'Hora do Agend.' :
                                     field === 'service_name' ? 'Nome do Serviço' :
                                     field === 'professional_name' ? 'Profissional' : 'Status'}
                                     {(field === 'name' || field === 'phone') && <span className="text-red-500">*</span>}
                                </label>
                                <select 
                                    value={mapping[field]} 
                                    onChange={e => setMapping({...mapping, [field]: e.target.value})}
                                    className="w-full h-12 bg-muted border border-border rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
                                >
                                    <option value="">Não importar</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4">
                        <button onClick={() => setStep(1)} className="px-6 py-3 text-sm font-bold text-muted-foreground hover:text-foreground">Voltar</button>
                        <button onClick={applyMapping} className="px-10 py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 flex items-center gap-3">
                            Ver Preview <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: PREVIEW */}
            {step === 3 && (
                <div className="bg-card rounded-xl border border-border p-10 animate-in zoom-in-95 duration-500">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold">Revisar Importação</h3>
                            <p className="text-sm text-muted-foreground mt-1">Identificamos <span className="text-primary font-bold">{parsedData.clients.length}</span> clientes.</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setStep(2)} className="px-6 py-3 text-sm font-bold text-muted-foreground">Ajustar Mapeamento</button>
                            <button onClick={confirmImport} disabled={isSubmitting} className="px-10 py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 flex items-center gap-3">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Iniciar Importação
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden border border-border rounded-xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted">
                                <tr className="text-[10px] font-black uppercase text-primary tracking-widest">
                                    <th className="p-4">Nome</th>
                                    <th className="p-4">Telefone</th>
                                    <th className="p-4">Data/Hora</th>
                                    <th className="p-4">Serviço</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {parsedData.clients.slice(0, 5).map((c, i) => {
                                    const apt = parsedData.appointments.find(a => a.client_phone === c.phone);
                                    return (
                                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4 font-bold">{c.name}</td>
                                            <td className="p-4 text-muted-foreground">{c.phone}</td>
                                            <td className="p-4 font-medium text-primary">{apt ? `${apt.date} ${apt.time}` : '-'}</td>
                                            <td className="p-4 text-xs font-bold uppercase">{apt?.service_name || '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="p-4 bg-muted/50 text-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                            Mostrando apenas os primeiros 5 registros
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 5: SUCCESS */}
            {step === 5 && result && (
                <div className="bg-card rounded-xl border border-border p-12 text-center max-w-3xl mx-auto shadow-2xl relative overflow-hidden animate-in zoom-in-90 duration-700">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                    <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20 shadow-lg shadow-green-500/5">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-4xl font-black text-foreground mb-4 tracking-tight">Missão Cumprida!</h2>
                    <p className="text-muted-foreground text-lg mb-10 font-medium">Sua base de dados foi processada e integrada com sucesso.</p>
                    
                    <div className="grid grid-cols-2 gap-6 mb-10">
                        <div className="bg-muted/50 p-8 rounded-xl border border-border group hover:border-primary/30 transition-all">
                            <p className="text-[10px] font-black uppercase text-primary mb-2 tracking-widest">Clientes</p>
                            <p className="text-5xl text-foreground font-black tracking-tighter">{result.successCount?.clients || 0}</p>
                        </div>
                        <div className="bg-muted/50 p-8 rounded-xl border border-border group hover:border-primary/30 transition-all">
                            <p className="text-[10px] font-black uppercase text-primary mb-2 tracking-widest">Agendamentos</p>
                            <p className="text-5xl text-foreground font-black tracking-tighter">{result.successCount?.appointments || 0}</p>
                        </div>
                    </div>

                    <button onClick={() => window.location.href = '/dashboard'} className="px-12 py-5 bg-foreground text-background rounded-xl font-black uppercase tracking-widest text-[12px] hover:scale-105 transition-all shadow-2xl shadow-black/20">
                        Acessar Painel Agora
                    </button>
                </div>
            )}
        </div>
    );
}
