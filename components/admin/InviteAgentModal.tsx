"use client";

import { useState } from "react";
import { X, Mail, User, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { handleInviteAgent } from "@/app/admin/actions";

interface InviteAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InviteAgentModal({ isOpen, onClose }: InviteAgentModalProps) {
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        try {
            const result = await handleInviteAgent(email, fullName);

            if (result.error) {
                setStatus({ type: 'error', message: result.error });
            } else {
                setStatus({ type: 'success', message: "¡Invitación enviada con éxito! El agente recibirá un correo para configurar su cuenta." });
                // Reset form on success
                setEmail("");
                setFullName("");
                // Close after 2 seconds
                setTimeout(() => {
                    onClose();
                    setStatus(null);
                }, 3000);
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: "Ocurrió un error inesperado." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">Invitar <span className="text-red-600">Agente</span></h2>
                        <p className="text-sm text-zinc-500 mt-1">Envía una invitación formal por correo.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {status && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                            }`}>
                            {status.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                            <p className="text-sm font-medium">{status.message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                <input
                                    required
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Ej. Juan Pérez"
                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-xl transition-all outline-none font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="agente@ejemplo.com"
                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-xl transition-all outline-none font-bold"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || status?.type === 'success'}
                            className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${isLoading
                                    ? 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-200 active:scale-[0.98]'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Enviar Invitación
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Advice */}
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                    <AlertCircle size={14} className="text-zinc-400" />
                    <p className="text-[11px] text-zinc-500 italic">
                        El sistema creará automáticamente un perfil en la base de datos con el rol de &ldquo;agente&rdquo;.
                    </p>
                </div>
            </div>
        </div>
    );
}
