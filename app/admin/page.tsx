import Link from 'next/link';
import { BarChart3, Building2, Clock3, Plus, Send, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const supabase = await createClient();

    const [
        propertiesCountRes,
        leadsCountRes,
        agentsCountRes,
        recentPropertiesRes,
        recentLeadsRes
    ] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('advisory_requests').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'agente'),
        supabase
            .from('properties')
            .select('id, titulo, slug, ciudad, barrio, precio, estado, created_at')
            .order('created_at', { ascending: false })
            .limit(6),
        supabase
            .from('advisory_requests')
            .select('id, nombre, estado, created_at')
            .order('created_at', { ascending: false })
            .limit(6)
    ]);

    const totalProperties = propertiesCountRes.count || 0;
    const totalLeads = leadsCountRes.count || 0;
    const totalAgents = agentsCountRes.count || 0;

    const recentProperties = recentPropertiesRes.data || [];
    const recentLeads = recentLeadsRes.data || [];

    return (
        <div className="space-y-6 md:space-y-8">
            <section className="rounded-2xl md:rounded-3xl border border-slate-200 bg-white p-5 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Panel de Control</p>
                        <h1 className="mt-2 text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Dashboard Comercial</h1>
                        <p className="mt-2 text-sm md:text-base text-slate-500 font-medium">Resumen operativo de propiedades, solicitudes y equipo.</p>
                    </div>
                    <div className="flex gap-2 md:gap-3">
                        <Link href="/admin/propiedades/nuevo" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-colors">
                            <Plus size={14} /> Nuevo inmueble
                        </Link>
                        <Link href="/admin/solicitudes" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors">
                            <Send size={14} /> Revisar leads
                        </Link>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Propiedades</p>
                        <Building2 className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-3 text-3xl font-black text-slate-900">{totalProperties}</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Solicitudes</p>
                        <Send className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-3 text-3xl font-black text-slate-900">{totalLeads}</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Agentes</p>
                        <Users className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-3 text-3xl font-black text-slate-900">{totalAgents}</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Conversión</p>
                        <BarChart3 className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-3 text-3xl font-black text-slate-900">
                        {totalProperties > 0 ? Math.round((totalLeads / totalProperties) * 100) : 0}%
                    </p>
                </article>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                <article className="rounded-2xl border border-slate-200 bg-white">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-lg font-black text-slate-900">Últimos inmuebles</h2>
                        <Link href="/admin/propiedades" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-600">Ver todos</Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentProperties.length > 0 ? recentProperties.map((property) => (
                            <div key={property.id} className="px-5 py-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-bold text-slate-900 leading-tight">{property.titulo}</p>
                                        <p className="mt-1 text-xs text-slate-500">{property.barrio}, {property.ciudad}</p>
                                    </div>
                                    <p className="text-sm font-black text-slate-900">${Number(property.precio).toLocaleString('es-CO')}</p>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{property.estado || 'Disponible'}</span>
                                    <Link href={`/admin/propiedades/editar/${property.id}`} className="text-xs font-bold text-red-600 hover:text-red-500">Editar</Link>
                                </div>
                            </div>
                        )) : (
                            <p className="px-5 py-8 text-sm text-slate-400">No hay inmuebles recientes.</p>
                        )}
                    </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-lg font-black text-slate-900">Solicitudes recientes</h2>
                        <Link href="/admin/solicitudes" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-600">Gestionar</Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentLeads.length > 0 ? recentLeads.map((lead) => (
                            <div key={lead.id} className="px-5 py-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-bold text-slate-900">{lead.nombre}</p>
                                    <p className="mt-1 text-xs text-slate-500 inline-flex items-center gap-1.5"><Clock3 className="h-3 w-3" />{new Date(lead.created_at).toLocaleDateString('es-CO')}</p>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest rounded-full px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200">{lead.estado || 'pendiente'}</span>
                            </div>
                        )) : (
                            <p className="px-5 py-8 text-sm text-slate-400">No hay solicitudes recientes.</p>
                        )}
                    </div>
                </article>
            </section>
        </div>
    );
}
