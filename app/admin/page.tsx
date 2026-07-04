import Link from 'next/link';
import { Building2, Clock3, Plus, Send, Users, TrendingUp, ArrowRight, AlertTriangle, Activity, Eye, KanbanSquare, Phone, Target } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import { getMostViewedProperties } from '@/lib/supabase/properties';
import { getCRMMetrics } from '@/lib/supabase/crm';
import LeadTrendChart from '@/components/admin/LeadTrendChart';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const supabase = await createClient();

    const [propertiesRes, leadsRes, agentsRes, pendingRes, recentProps, recentLeadsRes, statusRes, viewsRes, crmMetrics, leadsTrendRes] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('advisory_requests').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'agente'),
        supabase.from('advisory_requests').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente'),
        supabase.from('properties').select('id, titulo, slug, ciudad, barrio, precio, estado, imagen_principal, created_at, updated_at').order('updated_at', { ascending: false }).limit(5),
        supabase.from('advisory_requests').select('id, nombre, email, estado, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('properties').select('estado').not('estado', 'is', null),
        supabase.from('property_views').select('id', { count: 'exact', head: true }),
        getCRMMetrics().catch(() => ({ total: 0, pipeline: { nuevo: 0, contactado: 0, visitando: 0, negociando: 0, cerrado: 0 }, agentes: [] })),
        supabase.from('advisory_requests').select('created_at').gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()).order('created_at', { ascending: true }),
    ]);

    const totalProps = propertiesRes.count || 0;
    const totalLeads = crmMetrics.total || (leadsRes.count || 0);
    const totalAgents = agentsRes.count || 0;
    const pendingLeads = pendingRes.count || 0;
    const totalViews = viewsRes.count || 0;
    const recentProperties = recentProps.data || [];
    const recentLeads = recentLeadsRes.data || [];
    const pipeline = crmMetrics.pipeline;

    let mostViewed: any[] = [];
    try { mostViewed = await getMostViewedProperties(4); } catch { mostViewed = []; }

    const statusCounts: Record<string, number> = {};
    (statusRes.data || []).forEach((p: any) => { const s = p.estado || 'Sin estado'; statusCounts[s] = (statusCounts[s] || 0) + 1; });
    const statusEntries = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);

    const alerts: { message: string; href?: string }[] = [];
    if (pendingLeads > 0) alerts.push({ message: `${pendingLeads} lead${pendingLeads !== 1 ? 's' : ''} sin contacto`, href: '/admin/crm' });
    const noPhotoProps = recentProperties.filter((p: any) => !p.imagen_principal).length;
    if (noPhotoProps > 0) alerts.push({ message: `${noPhotoProps} propiedade${noPhotoProps !== 1 ? 's' : ''} sin foto`, href: '/admin/propiedades' });

    // ── Lead trend (weekly + monthly) ──
    const rawDates = (leadsTrendRes.data || []) as { created_at: string }[];
    const now = new Date();

    // Weekly: last 12 weeks
    const weeklyBuckets: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
        const m = new Date(now);
        m.setDate(now.getDate() - now.getDay() + 1 - 7 * i);
        const key = m.toISOString().slice(0, 10);
        weeklyBuckets[key] = 0;
    }
    for (const item of rawDates) {
        const d = new Date(item.created_at);
        const mon = new Date(d);
        mon.setDate(d.getDate() - d.getDay() + 1);
        const key = mon.toISOString().slice(0, 10);
        if (key in weeklyBuckets) weeklyBuckets[key]++;
    }
    const weeklyTrend = Object.entries(weeklyBuckets).map(([iso, count]) => {
        const d = new Date(iso + 'T12:00:00');
        return { label: d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }), count };
    });

    // Monthly: last 12 months
    const monthlyBuckets: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
        monthlyBuckets[key] = 0;
    }
    for (const item of rawDates) {
        const d = new Date(item.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key in monthlyBuckets) monthlyBuckets[key]++;
    }
    const monthlyTrend = Object.entries(monthlyBuckets).map(([iso, count]) => {
        const d = new Date(iso + '-01T12:00:00');
        return { label: d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }), count };
    });

    const totalTrendLeads = rawDates.length;

    return (
        <div className="space-y-6">
            <AdminBreadcrumbs items={[{ label: 'Dashboard' }]} />

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Dashboard CRM</h1>
                    <p className="text-sm text-zinc-500 font-medium mt-0.5">
                        {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/propiedades/nuevo" className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors">
                        <Plus size={14} /> Nuevo inmueble
                    </Link>
                    <Link href="/admin/crm" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 transition-colors">
                        <KanbanSquare size={13} /> Pipeline
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: 'Propiedades', value: totalProps, icon: Building2, accent: 'red' },
                    { label: 'Leads totales', value: totalLeads, icon: Send, accent: 'blue' },
                    { label: 'Visitas', value: totalViews, icon: Eye, accent: 'emerald' },
                    { label: 'Agentes', value: totalAgents, icon: Users, accent: 'purple' },
                    { label: 'Pipeline activo', value: pipeline.nuevo + pipeline.contactado + pipeline.visitando + pipeline.negociando, icon: KanbanSquare, accent: 'amber' },
                    { label: 'Cerrados', value: pipeline.cerrado, icon: Target, accent: 'zinc' },
                ].map(kpi => (
                    <div key={kpi.label} className="relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 p-4 overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-2 rounded-lg ${
                                kpi.accent === 'red' ? 'bg-red-50 text-red-600' :
                                kpi.accent === 'blue' ? 'bg-blue-50 text-blue-600' :
                                kpi.accent === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                kpi.accent === 'purple' ? 'bg-purple-50 text-purple-600' :
                                kpi.accent === 'amber' ? 'bg-amber-50 text-amber-600' :
                                'bg-zinc-100 text-zinc-600'
                            }`}><kpi.icon size={15} /></div>
                        </div>
                        <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{kpi.value}</p>
                        <p className="text-[10px] font-bold uppercase text-zinc-400 mt-0.5">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* Pipeline Bar */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                    <KanbanSquare size={16} className="text-red-500" />
                    <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50">Pipeline de leads</h2>
                    <Link href="/admin/crm" className="ml-auto text-xs font-bold text-zinc-400 hover:text-red-600 flex items-center gap-1">Ver CRM <ArrowRight size={11} /></Link>
                </div>
                <div className="flex h-8 rounded-lg overflow-hidden">
                    {[
                        { label: 'Nuevos', count: pipeline.nuevo, color: 'bg-blue-500' },
                        { label: 'Contactados', count: pipeline.contactado, color: 'bg-amber-500' },
                        { label: 'Visitando', count: pipeline.visitando, color: 'bg-purple-500' },
                        { label: 'Negociando', count: pipeline.negociando, color: 'bg-orange-500' },
                        { label: 'Cerrados', count: pipeline.cerrado, color: 'bg-emerald-500' },
                    ].map(seg => {
                        const total = pipeline.nuevo + pipeline.contactado + pipeline.visitando + pipeline.negociando + pipeline.cerrado;
                        const w = total > 0 ? (seg.count / total) * 100 : 0;
                        return w > 0 ? (
                            <div key={seg.label} className={`${seg.color} flex items-center justify-center text-white text-[10px] font-bold`} style={{ width: `${Math.max(w, 3)}%` }}>
                                {w > 8 ? `${seg.label} ${seg.count}` : ''}
                            </div>
                        ) : null;
                    })}
                    {pipeline.nuevo + pipeline.contactado + pipeline.visitando + pipeline.negociando + pipeline.cerrado === 0 && (
                        <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">Sin leads aún</div>
                    )}
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                    {[
                        { label: 'Nuevos', count: pipeline.nuevo, color: 'bg-blue-500' },
                        { label: 'Contactados', count: pipeline.contactado, color: 'bg-amber-500' },
                        { label: 'Visitando', count: pipeline.visitando, color: 'bg-purple-500' },
                        { label: 'Negociando', count: pipeline.negociando, color: 'bg-orange-500' },
                        { label: 'Cerrados', count: pipeline.cerrado, color: 'bg-emerald-500' },
                    ].map(seg => (
                        <div key={seg.label} className="flex items-center gap-1.5">
                            <div className={`h-2.5 w-2.5 rounded-full ${seg.color}`} />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">{seg.label}</span>
                            <span className="text-[10px] font-black text-zinc-700">{seg.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lead Trend Chart */}
            <LeadTrendChart weekly={weeklyTrend} monthly={monthlyTrend} total={totalTrendLeads} />

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={15} className="text-amber-600" />
                        <p className="text-xs font-black uppercase tracking-wider text-amber-700">Requiere atención</p>
                    </div>
                    {alerts.map((a, i) => (
                        a.href ? <Link key={i} href={a.href} className="block text-sm text-amber-800 font-medium hover:underline">• {a.message}</Link>
                            : <p key={i} className="text-sm text-amber-800 font-medium">• {a.message}</p>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <div className="xl:col-span-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                        <Activity size={15} className="text-zinc-400" />
                        <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50">Actividad reciente</h2>
                    </div>
                    <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                        {recentProperties.map(prop => (
                            <Link key={prop.id} href={`/admin/propiedades/editar/${prop.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                                <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                                    {prop.imagen_principal ? <img src={prop.imagen_principal.replace('/upload/', '/upload/w_64,h_64,c_fill,q_auto,f_auto/')} alt="" className="h-full w-full object-cover" /> : <Building2 size={14} className="text-zinc-300" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[13px] font-semibold text-zinc-900 truncate group-hover:text-red-600">{prop.titulo}</p>
                                    <p className="text-[10px] text-zinc-400">{prop.barrio}, {prop.ciudad}</p>
                                </div>
                                <span className="text-xs font-bold text-zinc-400">${Number(prop.precio).toLocaleString('es-CO')}</span>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="xl:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800"><h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50">Propiedades por estado</h2></div>
                    <div className="p-4 space-y-2.5">
                        {statusEntries.map(([s, c]) => (
                            <div key={s} className="flex items-center gap-3">
                                <span className="text-[11px] font-semibold text-zinc-600 w-20 truncate">{s}</span>
                                <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${s === 'Disponible' ? 'bg-emerald-500' : s === 'En Venta' ? 'bg-blue-500' : s === 'Vendido' ? 'bg-zinc-400' : s === 'Destacado' ? 'bg-amber-500' : s === 'Reservado' ? 'bg-purple-500' : 'bg-red-500'}`} style={{ width: `${Math.max((c / totalProps) * 100, 4)}%` }} />
                                </div>
                                <span className="text-[11px] font-bold text-zinc-500 w-6 text-right">{c}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {mostViewed.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                        <Eye size={15} className="text-zinc-400" /><h2 className="text-sm font-black text-zinc-900">Más visitados</h2>
                    </div>
                    <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                        {mostViewed.map((prop: any, i: number) => (
                            <Link key={prop.id} href={`/admin/propiedades/editar/${prop.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                <span className="text-sm font-black text-zinc-300 w-5 text-right">{i + 1}</span>
                                <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                                    {prop.imagen_principal ? <img src={prop.imagen_principal.replace('/upload/', '/upload/w_64,h_64,c_fill,q_auto,f_auto/')} alt="" className="h-full w-full object-cover" /> : <Building2 size={14} className="text-zinc-300" />}
                                </div>
                                <div className="min-w-0 flex-1"><p className="text-[13px] font-semibold text-zinc-900 truncate">{prop.titulo}</p><p className="text-[10px] text-zinc-400">{prop.barrio}, {prop.ciudad}</p></div>
                                <span className="text-xs font-bold text-zinc-400">${Number(prop.precio).toLocaleString('es-CO')}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {recentLeads.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <h2 className="text-sm font-black text-zinc-900">Últimos leads</h2>
                        <Link href="/admin/crm" className="text-[11px] font-bold text-zinc-400 hover:text-red-600 flex items-center gap-1">Ver CRM <ArrowRight size={11} /></Link>
                    </div>
                    <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                        {recentLeads.map(lead => (
                            <div key={lead.id} className="flex items-center justify-between gap-4 px-5 py-3">
                                <div className="min-w-0"><p className="text-[13px] font-semibold text-zinc-900">{lead.nombre}</p><p className="text-[10px] text-zinc-400 flex items-center gap-1.5"><Clock3 size={10} />{new Date(lead.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</p></div>
                                <span className={`shrink-0 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${lead.estado === 'pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200' : lead.estado === 'contactado' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{lead.estado || 'pendiente'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
