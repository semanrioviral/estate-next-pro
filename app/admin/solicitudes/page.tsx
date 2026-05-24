import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Phone, Mail, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';

export const dynamic = 'force-dynamic';

export default async function AdminSolicitudes() {
    const supabase = await createClient();
    const { data: solicitudes } = await supabase
        .from('advisory_requests')
        .select('id, nombre, email, telefono, mensaje, estado, property_id, created_at, properties(titulo, slug)')
        .order('created_at', { ascending: false })
        .limit(50);

    const items = solicitudes || [];

    return (
        <div className="space-y-6">
            <AdminBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Solicitudes' }]} />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Solicitudes</h1>
                    <p className="text-sm text-zinc-500 font-medium mt-0.5">Consultas del formulario de propiedad</p>
                </div>
            </div>

            {items.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                    {items.map((item: any) => (
                        <div key={item.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 p-5">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.nombre}</h3>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 border ${
                                            item.estado === 'pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400' :
                                            item.estado === 'contactado' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400' :
                                            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400'
                                        }`}>{item.estado || 'pendiente'}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mb-2">
                                        {item.telefono && (
                                            <a href={`tel:+57${item.telefono}`} className="flex items-center gap-1 font-bold text-zinc-700 hover:text-red-600">
                                                <Phone size={12} /> {item.telefono}
                                            </a>
                                        )}
                                        {item.email && (
                                            <span className="flex items-center gap-1"><Mail size={12} /> {item.email}</span>
                                        )}
                                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(item.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    {item.mensaje && (
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 italic">"{item.mensaje}"</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {item.properties && (
                                        <Link
                                            href={`/propiedades/${item.properties.slug}`}
                                            target="_blank"
                                            className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1"
                                        >
                                            {item.properties.titulo?.slice(0, 30)}... <ArrowRight size={11} />
                                        </Link>
                                    )}
                                    {item.telefono && (
                                        <a
                                            href={`https://wa.me/57${item.telefono?.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-[11px] font-bold hover:bg-green-600 transition-colors"
                                        >
                                            WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                    <MessageSquare size={32} className="text-zinc-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-zinc-500">No hay solicitudes aún</p>
                    <p className="text-xs text-zinc-400 mt-1">Las consultas del formulario de propiedad aparecerán aquí.</p>
                </div>
            )}
        </div>
    );
}
