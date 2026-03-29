import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, User, Scissors, Clock, FileText, Pencil, CheckCircle, DollarSign, CreditCard, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { useClientAuth } from '../contexts/ClientAuthContext';
import api from '../lib/api';
import { XCircle, Loader2 } from 'lucide-react';

export default function AppointmentDetailsModal({
    isOpen,
    onClose,
    appointment,
    onEdit,
    onComplete,
    onRefresh // Callback to refresh parent data if needed
}) {
    const { user } = useClientAuth();
    const [showPaymentSelector, setShowPaymentSelector] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    const isProfessional = user?.role !== 'CLIENT';

    useEffect(() => {
        setMounted(true);
        if (isOpen) setShowPaymentSelector(false);
    }, [isOpen, appointment]);

    const handleFinishClick = () => {
        if (appointment.paymentStatus === 'PAID') {
            if (confirm('Pagamento já realizado anteriormente. Finalizar o atendimento?')) {
                onComplete(appointment.id);
            }
        } else {
            setShowPaymentSelector(true);
        }
    };

    const handlePaymentSelect = (method) => {
        // Here we could implement more complex logic like entering amount, but for now strict strict to just method selection as requested for flow
        onComplete(appointment.id, method);
    };

    const handleCancel = async () => {
        if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
        
        setIsCancelling(true);
        try {
            await api.patch(`/appointments/${appointment.id}/status`, { status: 'CANCELLED' });
            alert('Agendamento cancelado com sucesso.');
            if (onRefresh) onRefresh();
            onClose();
        } catch (error) {
            console.error('Error cancelling:', error);
            alert('Erro ao cancelar agendamento: ' + (error.response?.data?.message || 'Erro interno'));
        } finally {
            setIsCancelling(false);
        }
    };

    if (!isOpen || !appointment || !mounted) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-[#111827] border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <h2 className="text-lg font-black text-white uppercase tracking-tighter">
                        Detalhes do Agendamento
                    </h2>
                    <div className="flex gap-2">
                        {isProfessional && onEdit && (
                            <button
                                onClick={onEdit}
                                className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                                title="Editar"
                            >
                                <Pencil className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${appointment.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            appointment.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            }`}>
                            {appointment.status === 'CONFIRMED' ? 'Confirmado' :
                                appointment.status === 'CANCELLED' ? 'Cancelado' :
                                    appointment.status === 'PENDING' ? 'Pendente' : appointment.status}
                        </span>
                    </div>

                    {/* Main Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cliente</p>
                                <p className="text-white font-bold">{appointment.client?.name || 'Cliente não identificado'}</p>
                                <p className="text-xs text-slate-400">{appointment.client?.phone}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Data
                                </p>
                                <p className="text-white font-bold text-sm">
                                    {format(new Date(appointment.date), "dd 'de' MMMM", { locale: ptBR })}
                                </p>
                            </div>
                            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Horário
                                </p>
                                <p className="text-white font-bold text-sm">
                                    {format(new Date(appointment.date), 'HH:mm')}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <Scissors className="w-3 h-3" /> Serviço
                            </p>
                            <p className="text-white font-bold">{appointment.service?.name}</p>
                            <p className="text-xs text-emerald-500 font-bold mt-1">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(appointment.service?.price || 0)}
                            </p>
                        </div>

                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <User className="w-3 h-3" /> Profissional
                            </p>
                            <p className="text-white font-bold">{appointment.professional?.name || appointment.summaryProName || 'Sem preferência'}</p>
                        </div>
                    </div>

                    {/* Notes */}
                    {appointment.notes && (
                        <div className="bg-yellow-500/5 p-4 rounded-2xl border border-yellow-500/10">
                            <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Notas
                            </p>
                            <p className="text-slate-300 text-xs italic">
                                "{appointment.notes}"
                            </p>
                        </div>
                    )}

                    {/* Actions Footer - Finalization Flow */}
                    {(appointment.status === 'CONFIRMED' || appointment.status === 'PENDING' || appointment.status === 'SCHEDULED') && (
                        <div className="pt-4 mt-2 border-t border-slate-800">
                            {isProfessional ? (
                                !showPaymentSelector ? (
                                    <button
                                        onClick={handleFinishClick}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Finalizar Atendimento
                                    </button>
                                ) : (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selecione o Pagamento</p>
                                            <button onClick={() => setShowPaymentSelector(false)} className="text-[10px] text-red-400 hover:text-red-300 uppercase font-black">Cancelar</button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button onClick={() => handlePaymentSelect('CASH')} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl flex flex-col items-center gap-2 border border-slate-700 hover:border-emerald-500 transition-colors">
                                                <DollarSign className="w-6 h-6 text-emerald-500" />
                                                <span className="text-[9px] font-bold uppercase text-slate-300">Dinheiro</span>
                                            </button>
                                            <button onClick={() => handlePaymentSelect('PIX')} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl flex flex-col items-center gap-2 border border-slate-700 hover:border-emerald-500 transition-colors">
                                                <Zap className="w-6 h-6 text-emerald-500" />
                                                <span className="text-[9px] font-bold uppercase text-slate-300">Pix</span>
                                            </button>
                                            <button onClick={() => handlePaymentSelect('CREDIT_CARD')} className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl flex flex-col items-center gap-2 border border-slate-700 hover:border-emerald-500 transition-colors">
                                                <CreditCard className="w-6 h-6 text-emerald-500" />
                                                <span className="text-[9px] font-bold uppercase text-slate-300">Cartão</span>
                                            </button>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <button
                                    onClick={handleCancel}
                                    disabled={isCancelling}
                                    className="w-full py-4 rounded-2xl border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Cancelar Agendamento
                                </button>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
