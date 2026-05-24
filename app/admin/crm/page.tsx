"use client";

import { useState, useEffect, useCallback } from "react";
import { Phone, MessageSquare, ChevronRight, Clock, Building2, Search } from "lucide-react";
import Link from "next/link";
import { getCRMLeads, updateLeadEtapa, addLeadNote, updateLeadInfo, type CRMLead, type PipelineEtapa } from "@/lib/supabase/crm";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";

const PIPELINE: { etapa: PipelineEtapa; label: string; color: string; bg: string }[] = [
    { etapa: "nuevo", label: "Nuevos", color: "bg-blue-500", bg: "bg-blue-50 border-blue-200" },
    { etapa: "contactado", label: "Contactados", color: "bg-amber-500", bg: "bg-amber-50 border-amber-200" },
    { etapa: "visitando", label: "Visitando", color: "bg-purple-500", bg: "bg-purple-50 border-purple-200" },
    { etapa: "negociando", label: "Negociando", color: "bg-orange-500", bg: "bg-orange-50 border-orange-200" },
    { etapa: "cerrado", label: "Cerrados", color: "bg-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
];

export default function CRMPage() {
    const [leads, setLeads] = useState<CRMLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
    const [noteText, setNoteText] = useState("");
    const [editingName, setEditingName] = useState(false);
    const [editName, setEditName] = useState("");

    const load = useCallback(async () => { setLoading(true); setLeads(await getCRMLeads()); setLoading(false); }, []);
    useEffect(() => { load(); }, [load]);

    const moveCard = async (id: string, newEtapa: PipelineEtapa) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, etapa: newEtapa } : l));
        await updateLeadEtapa(id, newEtapa);
        setSelectedLead(prev => prev?.id === id ? { ...prev, etapa: newEtapa } : prev);
    };

    const handleAddNote = async () => {
        if (!selectedLead || !noteText.trim()) return;
        const existing = selectedLead.notas || "";
        const newNote = `[${new Date().toLocaleString('es-CO')}] ${noteText.trim()}\n${existing}`;
        await addLeadNote(selectedLead.id, newNote);
        setSelectedLead(prev => prev ? { ...prev, notas: newNote } : null);
        setNoteText("");
    };

    const filtered = search ? leads.filter(l =>
        l.nombre.toLowerCase().includes(search.toLowerCase()) ||
        l.telefono.includes(search) ||
        (l.property_titulo || "").toLowerCase().includes(search.toLowerCase())
    ) : leads;

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-4">
            <AdminBreadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "CRM Pipeline" }]} />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Pipeline CRM</h1>
                    <p className="text-sm text-zinc-500 font-medium mt-0.5">{leads.length} leads en total</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar lead..." className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-red-500/20 w-48" />
                    </div>
                    <button onClick={load} className="px-3 py-2 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 rounded-lg hover:bg-zinc-200">Actualizar</button>
                </div>
            </div>

            {/* KANBAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 overflow-x-auto pb-2">
                {PIPELINE.map(col => {
                    const colLeads = filtered.filter(l => l.etapa === col.etapa);
                    return (
                        <div key={col.etapa} className="flex flex-col min-w-[220px]">
                            <div className={`flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg ${col.bg}`}>
                                <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                                <span className="text-xs font-black text-zinc-700 uppercase tracking-wider">{col.label}</span>
                                <span className="ml-auto text-xs font-bold text-zinc-500">{colLeads.length}</span>
                            </div>
                            <div className="space-y-2 flex-1">
                                {colLeads.map(lead => (
                                    <div key={lead.id} onClick={() => setSelectedLead(lead)} className={`bg-white dark:bg-zinc-900 rounded-xl border p-3 cursor-pointer hover:shadow-md hover:border-red-200 transition-all ${selectedLead?.id === lead.id ? 'ring-2 ring-red-500 border-red-300' : 'border-zinc-200/60'}`}>
                                        <p className="text-sm font-bold text-zinc-900 truncate mb-1 group-hover:text-red-600 transition-colors">{lead.nombre}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 mb-1"><Phone size={10} /> {lead.telefono}</div>
                                        {lead.property_titulo && <div className="flex items-center gap-1 text-[10px] text-zinc-400 truncate"><Building2 size={10} /> {lead.property_titulo.slice(0, 35)}</div>}
                                        <div className="flex items-center gap-1 mt-2 text-[9px] text-zinc-400"><Clock size={9} /> {new Date(lead.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* QUICK MOVE */}
            {selectedLead && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 p-4">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Mover a:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {PIPELINE.map(col => (
                            <button key={col.etapa} onClick={() => moveCard(selectedLead.id, col.etapa)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${selectedLead.etapa === col.etapa ? `${col.color} text-white` : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200'}`}>{col.label}</button>
                        ))}
                    </div>
                </div>
            )}

            {/* DETAIL PANEL */}
            {selectedLead && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                            {editingName && selectedLead ? (
                                <div className="flex items-center gap-2 mb-3">
                                    <input
                                        type="text" value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        onKeyDown={async e => {
                                            if (e.key === 'Enter') {
                                                await updateLeadInfo(selectedLead.id, { nombre: editName });
                                                setSelectedLead({ ...selectedLead, nombre: editName });
                                                setEditingName(false);
                                                load();
                                            }
                                            if (e.key === 'Escape') setEditingName(false);
                                        }}
                                        onBlur={async () => {
                                            if (editName.trim() && editName !== selectedLead.nombre) {
                                                await updateLeadInfo(selectedLead.id, { nombre: editName });
                                                setSelectedLead({ ...selectedLead, nombre: editName });
                                                load();
                                            }
                                            setEditingName(false);
                                        }}
                                        className="text-base font-black text-zinc-900 bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-red-500/20 w-full"
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <h3
                                    className="text-base font-black text-zinc-900 mb-3 cursor-pointer hover:text-red-600 transition-colors flex items-center gap-2"
                                    onClick={() => { setEditName(selectedLead?.nombre || ''); setEditingName(true); }}
                                    title="Click para editar"
                                >
                                    {selectedLead?.nombre}
                                    <span className="text-[10px] text-zinc-400 font-normal">✎</span>
                                </h3>
                            )}
                            <div className="space-y-2 text-sm">
                                {selectedLead.telefono && (
                                    <a href={`https://wa.me/57${selectedLead.telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-zinc-700 hover:text-green-600 font-bold">
                                        <Phone size={14} /> {selectedLead.telefono} <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">WhatsApp</span>
                                    </a>
                                )}
                                {selectedLead.email && <p className="flex items-center gap-2 text-zinc-500 text-sm"><MessageSquare size={14} /> {selectedLead.email}</p>}
                                <p className="flex items-center gap-2 text-zinc-400 text-xs"><Clock size={12} /> {new Date(selectedLead.created_at).toLocaleString('es-CO')}</p>
                            </div>
                            {selectedLead.property_titulo && (
                                <Link href={`/propiedades/${selectedLead.property_slug}`} target="_blank" className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-red-600 hover:underline">
                                    <Building2 size={12} /> {selectedLead.property_titulo} <ChevronRight size={11} />
                                </Link>
                            )}
                            {selectedLead.mensaje && (
                                <div className="mt-3">
                                    <h4 className="text-xs font-black text-zinc-500 uppercase tracking-wider mb-2">Historial de contacto</h4>
                                    <div className="text-xs text-zinc-600 space-y-1 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                                        {(selectedLead.mensaje || '').split('\n').filter(Boolean).map((line, i) => {
                                            const isPropertyLine = line.includes('Interesado en:') || line.includes('📌');
                                            return (
                                                <p key={i} className={isPropertyLine ? 'font-semibold text-zinc-800' : 'text-zinc-500'}>
                                                    {line}
                                                </p>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="lg:col-span-2">
                            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-wider mb-2">Notas</h4>
                            <div className="flex gap-2 mb-3">
                                <input type="text" value={noteText} onChange={e => setNoteText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddNote()} placeholder="Agregar nota..." className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/20" />
                                <button onClick={handleAddNote} className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">+</button>
                            </div>
                            <pre className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-sans bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 max-h-40 overflow-y-auto">{selectedLead.notas || 'Sin notas.'}</pre>
                            {selectedLead.mensaje && (
                                <div className="mt-3"><h4 className="text-xs font-black text-zinc-500 uppercase tracking-wider mb-1">Mensaje</h4><p className="text-sm text-zinc-600 italic bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">"{selectedLead.mensaje}"</p></div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
