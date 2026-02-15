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
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Invitar Nuevo Agente</h2>
                        <p className="text-sm text-gray-500 mt-1">Envía una invitación formal por correo.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-900 shadow-sm"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {status && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            {status.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                            <p className="text-sm font-medium">{status.message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    required
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Ej. Juan Pérez"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="agente@ejemplo.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || status?.type === 'success'}
                            className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
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
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                    <AlertCircle size={14} className="text-gray-400" />
                    <p className="text-[11px] text-gray-500 italic">
                        El sistema creará automáticamente un perfil en la base de datos con el rol de "agente".
                    </p>
                </div>
            </div>
        </div>
    );
}
