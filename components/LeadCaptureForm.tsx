'use client';

import React, { useState } from 'react';
import { MessageCircle, Send, CheckCircle2, Loader2, User, Phone, MessageSquare } from 'lucide-react';
import { createLead } from '@/lib/supabase/leads';

interface LeadCaptureFormProps {
    propertyId: string;
    propertyTitle: string;
    whatsappNumber: string;
    propertyUrl: string;
    isShort?: boolean;
}

export default function LeadCaptureForm({
    propertyId,
    propertyTitle,
    whatsappNumber,
    propertyUrl,
    isShort = false
}: LeadCaptureFormProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        mensaje: `Hola, estoy interesado en la propiedad: ${propertyTitle}`
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        const result = await createLead({
            property_id: propertyId,
            nombre: formData.nombre,
            telefono: formData.telefono,
            mensaje: formData.mensaje,
        });

        if (result.success) {
            setStatus('success');

            // Optionally redirect to WhatsApp after a short delay
            setTimeout(() => {
                const whatsappText = `${formData.mensaje}\n\nMi nombre es: ${formData.nombre}\nTeléfono: ${formData.telefono}\nEnlace: ${propertyUrl}`;
                const dynamicWhatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;
                window.open(dynamicWhatsappUrl, '_blank');
            }, 1500);
        } else {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-white rounded-3xl border border-green-500/20 p-8 shadow-xl text-center animate-in fade-in zoom-in duration-500">
                <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-black text-text-primary mb-2">¡Solicitud Enviada!</h3>
                <p className="text-text-secondary font-medium mb-6">
                    Hemos registrado tu interés. En unos segundos serás redirigido a WhatsApp para una respuesta inmediata.
                </p>
                <div className="w-full h-1.5 bg-bg-alt rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 animate-progress"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-border-clean p-8 shadow-xl shadow-text-primary/5 relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 blur-3xl transition-transform duration-700 group-hover:scale-150"></div>

            <div className="relative">
                <div className="mb-8">
                    <span className="text-text-muted font-bold text-[10px] uppercase tracking-widest mb-2 block">Asistencia Inmediata</span>
                    <h3 className="text-2xl font-black text-text-primary tracking-tight">Solicitar Detalles</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nombre */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Nombre Completo</label>
                        <div className="relative group/field">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-text-muted group-focus-within/field:text-brand transition-colors" />
                            </div>
                            <input
                                required
                                type="text"
                                placeholder="Ej: Juan Pérez"
                                className="w-full bg-bg-alt border border-border-clean rounded-2xl py-4 pl-12 pr-4 text-text-primary font-bold placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">WhatsApp / Teléfono</label>
                        <div className="relative group/field">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Phone className="h-4 w-4 text-text-muted group-focus-within/field:text-brand transition-colors" />
                            </div>
                            <input
                                required
                                type="tel"
                                placeholder="Ej: 300 123 4567"
                                className="w-full bg-bg-alt border border-border-clean rounded-2xl py-4 pl-12 pr-4 text-text-primary font-bold placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Mensaje - Ocultar si isShort es true */}
                    {!isShort && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Consulta Adicional</label>
                            <div className="relative group/field">
                                <div className="absolute top-4 left-4 pointer-events-none">
                                    <MessageSquare className="h-4 w-4 text-text-muted group-focus-within/field:text-brand transition-colors" />
                                </div>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full bg-bg-alt border border-border-clean rounded-2xl py-4 pl-12 pr-4 text-text-primary font-bold placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand transition-all resize-none"
                                    value={formData.mensaje}
                                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <p className="text-brand text-[10px] font-bold text-center animate-shake">
                            Ocurrió un error. Por favor intenta de nuevo.
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="btn-primary w-full h-16 group/btn"
                    >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                            {status === 'loading' ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Enviar consulta ahora</span>
                                    <Send className="h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </div>
                    </button>

                    <p className="text-[10px] text-text-muted font-medium text-center leading-relaxed">
                        Sus datos están protegidos. Uno de nuestros expertos lo contactará en breve para brindarle asesoría técnica y legal.
                    </p>
                </form>
            </div>
        </div>
    );
}
