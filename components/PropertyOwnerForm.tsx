'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Loader2, User, Phone, MapPin, Building, Calculator, MessageSquare } from 'lucide-react';
import { createLead } from '@/lib/supabase/leads';

interface PropertyOwnerFormProps {
    defaultCity?: string;
    whatsappNumber: string;
}

export default function PropertyOwnerForm({
    defaultCity = 'Los Patios',
    whatsappNumber
}: PropertyOwnerFormProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        tipo_propiedad: 'Casa',
        direccion: '',
        ciudad: defaultCity,
        valor_estimado: '',
        mensaje: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        const mensajeFinal = `Interés en vender ${formData.tipo_propiedad} en ${formData.direccion}, ${formData.ciudad}. Valor estimado: ${formData.valor_estimado}. ${formData.mensaje}`;

        const result = await createLead({
            nombre: formData.nombre,
            telefono: formData.telefono,
            mensaje: mensajeFinal,
            tipo_lead: 'propietario',
            direccion: formData.direccion,
            ciudad: formData.ciudad
        });

        if (result.success) {
            setStatus('success');
            setTimeout(() => {
                const whatsappText = `Hola, quiero vender mi propiedad:\n- Tipo: ${formData.tipo_propiedad}\n- Ubicación: ${formData.direccion}, ${formData.ciudad}\n- Mi nombre es: ${formData.nombre}\n- Teléfono: ${formData.telefono}`;
                const dynamicWhatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;
                window.open(dynamicWhatsappUrl, '_blank');
            }, 2000);
        } else {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-white rounded-[2.5rem] border border-green-500/30 p-10 shadow-2xl text-center">
                <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-3xl font-black text-zinc-900 mb-4">¡Solicitud Registrada!</h3>
                <p className="text-zinc-500 font-medium mb-8 leading-relaxed">
                    Un experto en valoración se pondrá en contacto contigo a la brevedad. Redirigiendo a WhatsApp...
                </p>
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 animate-progress"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[3rem] border border-zinc-100 p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#fb2c36]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#fb2c36] transition-colors" />
                            <input
                                required
                                type="text"
                                placeholder="Juan Pérez"
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 font-bold focus:ring-2 focus:ring-[#fb2c36]/20 focus:border-[#fb2c36] transition-all outline-none"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Teléfono</label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#fb2c36] transition-colors" />
                            <input
                                required
                                type="tel"
                                placeholder="322 000 0000"
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 font-bold focus:ring-2 focus:ring-[#fb2c36]/20 focus:border-[#fb2c36] transition-all outline-none"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Tipo Propiedad */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Tipo de Inmueble</label>
                        <div className="relative group">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#fb2c36] transition-colors" />
                            <select
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 font-bold focus:ring-2 focus:ring-[#fb2c36]/20 focus:border-[#fb2c36] transition-all outline-none appearance-none"
                                value={formData.tipo_propiedad}
                                onChange={(e) => setFormData({ ...formData, tipo_propiedad: e.target.value })}
                            >
                                <option>Casa</option>
                                <option>Apartamento</option>
                                <option>Lote / Terreno</option>
                                <option>Local Comercial</option>
                            </select>
                        </div>
                    </div>

                    {/* Ciudad */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Ciudad</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#fb2c36] transition-colors" />
                            <select
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 font-bold focus:ring-2 focus:ring-[#fb2c36]/20 focus:border-[#fb2c36] transition-all outline-none appearance-none"
                                value={formData.ciudad}
                                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                            >
                                <option>Los Patios</option>
                                <option>Cúcuta</option>
                                <option>Villa del Rosario</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Dirección */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Dirección o Sector</label>
                    <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#fb2c36] transition-colors" />
                        <input
                            required
                            type="text"
                            placeholder="Ej: Barrio La Sabana, Calle 3 #4-5"
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 font-bold focus:ring-2 focus:ring-[#fb2c36]/20 focus:border-[#fb2c36] transition-all outline-none"
                            value={formData.direccion}
                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        />
                    </div>
                </div>

                {/* Valor Estimado */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Valor Estimado (Opcional)</label>
                    <div className="relative group">
                        <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#fb2c36] transition-colors" />
                        <input
                            type="text"
                            placeholder="Ej: 250 Millones"
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 font-bold focus:ring-2 focus:ring-[#fb2c36]/20 focus:border-[#fb2c36] transition-all outline-none"
                            value={formData.valor_estimado}
                            onChange={(e) => setFormData({ ...formData, valor_estimado: e.target.value })}
                        />
                    </div>
                </div>

                {/* Mensaje */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Información Adicional</label>
                    <div className="relative group">
                        <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-zinc-400 group-focus-within:text-[#fb2c36] transition-colors" />
                        <textarea
                            rows={3}
                            placeholder="Cuéntanos más sobre tu propiedad..."
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 font-bold focus:ring-2 focus:ring-[#fb2c36]/20 focus:border-[#fb2c36] transition-all outline-none resize-none"
                            value={formData.mensaje}
                            onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                        />
                    </div>
                </div>

                {status === 'error' && (
                    <p className="text-red-500 font-bold text-xs text-center">Ocurrió un error. Intenta de nuevo.</p>
                )}

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-[#fb2c36] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {status === 'loading' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <span>Iniciar Proceso de Venta</span>
                            <Send className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
