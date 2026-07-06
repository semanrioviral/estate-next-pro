"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { submitLead } from "@/app/actions/leads";

interface PropertyContactFormProps {
    propertyId: string;
    propertyTitle: string;
}

export default function PropertyContactForm({ propertyId, propertyTitle }: PropertyContactFormProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) {
            setError("Nombre y teléfono son requeridos.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const result = await submitLead({
                nombre: name.trim(),
                telefono: phone.trim(),
                email: email.trim() || undefined,
                mensaje: message.trim() || `Interesado en: ${propertyTitle}`,
                property_id: propertyId,
            });
            if (result?.error) {
                setError(result.error);
            } else {
                setSent(true);
            }
        } catch {
            setError("Error al enviar. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="flex flex-col items-center text-center py-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                    <CheckCircle2 size={22} className="text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-zinc-900">¡Mensaje enviado!</p>
                <p className="text-xs text-zinc-500 mt-1">Te contactaremos pronto.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
                <label htmlFor={`pc-name-${propertyId}`} className="sr-only">Nombre completo (requerido)</label>
                <input
                    id={`pc-name-${propertyId}`}
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nombre completo *"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    required
                    aria-required="true"
                />
            </div>
            <div className="space-y-1">
                <label htmlFor={`pc-phone-${propertyId}`} className="sr-only">Teléfono / WhatsApp (requerido)</label>
                <input
                    id={`pc-phone-${propertyId}`}
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Teléfono / WhatsApp *"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    required
                    aria-required="true"
                />
            </div>
            <div className="space-y-1">
                <label htmlFor={`pc-email-${propertyId}`} className="sr-only">Correo electrónico (opcional)</label>
                <input
                    id={`pc-email-${propertyId}`}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Correo electrónico (opcional)"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
            </div>
            <div className="space-y-1">
                <label htmlFor={`pc-msg-${propertyId}`} className="sr-only">Mensaje</label>
                <textarea
                    id={`pc-msg-${propertyId}`}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={`Hola, me interesa esta propiedad...`}
                    rows={2}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                />
            </div>
            {error && <p role="alert" className="text-xs font-bold text-red-600">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors active:scale-[0.98] disabled:opacity-50"
            >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
                {loading ? "Enviando..." : "Quiero que me contacten"}
            </button>
        </form>
    );
}
