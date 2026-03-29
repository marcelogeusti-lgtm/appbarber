'use client';
import { X, Save, Loader2 } from 'lucide-react';

export default function EditModal({
    isOpen,
    onClose,
    title = 'Editar',
    onSave,
    loading = false,
    saveLabel = 'Salvar',
    children
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-[#111827] border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <h2 className="text-xl font-black text-white uppercase tracking-tigher">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {children}
                </div>

                {/* Footer (only if onSave is provided) */}
                {onSave && (
                    <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 py-4 rounded-xl font-bold text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all uppercase tracking-wider"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onSave}
                            disabled={loading}
                            className="flex-1 py-4 bg-primary hover:bg-primary/90 active:bg-primary/70 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {saveLabel}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
