'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { getLeads, updateLeadStatus, Lead } from '@/lib/supabase/leads';
import { Calendar, User, Phone, MessageSquare, ExternalLink, ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const loadLeads = useCallback(async (showLoading: boolean = true) => {
        if (showLoading) {
            setLoading(true);
        }
        const data = await getLeads();
        setLeads(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        const initLeads = async () => {
            await loadLeads(false);
        };
        initLeads();
    }, [loadLeads]);

    async function handleStatusChange(id: string, newStatus: Lead['estado']) {
        setUpdatingId(id);
        const result = await updateLeadStatus(id, newStatus);
        if (result.success) {
            setLeads(leads.map(lead => lead.id === id ? { ...lead, estado: newStatus } : lead));
        }
        setUpdatingId(null);
    }

    const getStatusStyles = (status: Lead['estado']) => {
        switch (status) {
            case 'nuevo': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'contactado': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            case 'cerrado': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800';
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase leading-none mb-3">
                        Gestión de <span className="text-[#fb2c36]">Leads</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Administra las consultas de tus clientes potenciales.</p>
                </div>
                <button
                    onClick={() => { void loadLeads(); }}
                    className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 px-6 py-3 rounded-2xl font-bold transition-all"
                >
                    <Clock className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="w-12 h-12 border-4 border-[#fb2c36]/20 border-t-[#fb2c36] rounded-full animate-spin"></div>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Cargando consultas...</p>
                </div>
            ) : leads.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {leads.map((lead) => (
                        <div key={lead.id} className="group glass rounded-[2rem] border border-zinc-100 dark:border-zinc-800 p-6 transition-all hover:shadow-2xl hover:shadow-[#fb2c36]/5 hover:-translate-y-1">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Informacion del Lead */}
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-[#fb2c36]/10 flex items-center justify-center">
                                                <User className="w-6 h-6 text-[#fb2c36]" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">{lead.nombre}</h3>
                                                <p className="text-sm font-bold text-zinc-400">{new Date(lead.created_at).toLocaleDateString()} a las {new Date(lead.created_at).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyles(lead.estado)}`}>
                                            {lead.estado}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-transparent group-hover:border-zinc-200 transition-colors">
                                            <Phone className="w-5 h-5 text-zinc-400" />
                                            <span className="font-bold text-zinc-700 dark:text-zinc-300">{lead.telefono}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-transparent group-hover:border-zinc-200 transition-colors">
                                            <ExternalLink className="w-5 h-5 text-zinc-400" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black text-zinc-400">Propiedad de interés</span>
                                                <Link
                                                    href={`/propiedades/${lead.properties?.slug}`}
                                                    target="_blank"
                                                    className="font-bold text-[#fb2c36] hover:underline truncate max-w-[200px]"
                                                >
                                                    {lead.properties?.titulo}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare className="w-4 h-4 text-zinc-400" />
                                            <span className="text-[10px] uppercase font-black text-zinc-400">Consulta</span>
                                        </div>
                                        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed italic">
                                            "{lead.mensaje}"
                                        </p>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="lg:w-64 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-800 pt-6 lg:pt-0 lg:pl-8">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Actualizar Estado</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            {(['nuevo', 'contactado', 'cerrado'] as const).map((s) => (
                                                <button
                                                    key={s}
                                                    disabled={updatingId === lead.id || lead.estado === s}
                                                    onClick={() => handleStatusChange(lead.id, s)}
                                                    className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${lead.estado === s
                                                            ? 'bg-[#fb2c36] text-white shadow-lg shadow-[#fb2c36]/20'
                                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                                        } disabled:opacity-50`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <a
                                            href={`https://wa.me/${lead.telefono.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold shadow-xl shadow-green-500/10 transition-all active:scale-95"
                                        >
                                            <Phone className="w-4 h-4" />
                                            Llamar Asesor
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 glass rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="mx-auto w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-10 h-10 text-zinc-300" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-2">Sin leads registrados</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Las consultas aparecerán aquí una vez que los clientes completen el formulario.</p>
                </div>
            )}
        </div>
    );
}
