import { createClient } from '@/lib/supabase-server'
import {
    LayoutDashboard, Home, Users, LogOut, PhoneCall, ChevronRight,
    Search, Star, Clock, Plus, Command, MessageSquare, KanbanSquare
} from 'lucide-react'
import Link from 'next/link'
import { logout } from './actions'
import AdminMobileNav from '@/components/admin/AdminMobileNav'
import { ToastProvider } from '@/components/admin/Toast'

export const dynamic = 'force-dynamic';

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: 'dashboard' as const, exact: true as const, badge: undefined as number | null | undefined },
    { href: '/admin/propiedades', label: 'Propiedades', icon: 'home' as const, exact: false as const, badge: undefined as number | null | undefined },
    { href: '/admin/crm', label: 'CRM', icon: 'crm' as const, exact: false as const, badge: undefined as number | null | undefined },
    { href: '/admin/solicitudes', label: 'Solicitudes', icon: 'solicitudes' as const, exact: false as const, badge: undefined as number | null | undefined },
    { href: '/admin/equipo', label: 'Equipo', icon: 'team' as const, exact: false as const, badge: undefined as number | null | undefined },
] as const;

const ICON_MAP = {
    dashboard: LayoutDashboard,
    home: Home,
    crm: KanbanSquare,
    leads: PhoneCall,
    solicitudes: MessageSquare,
    team: Users,
} as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    let user = null;
    let recentProperties: { id: string; titulo: string; slug: string }[] = [];
    try {
        const supabase = await createClient()
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()
        user = supabaseUser;

        if (user) {
            const { data: recents } = await supabase
                .from('properties')
                .select('id, titulo, slug')
                .order('updated_at', { ascending: false })
                .limit(5);
            recentProperties = recents || [];
        }
    } catch (err) {
        console.error('Error initializing admin layout:', err)
    }

    if (!user) return <>{children}</>

    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin';
    const avatarLetter = (displayName?.[0] || 'A').toUpperCase();

    return (
        <ToastProvider>
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
                <div className="lg:flex lg:min-h-screen">
                    {/* ============ DESKTOP SIDEBAR ============ */}
                    <aside className="hidden lg:flex lg:w-64 xl:w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200/60 dark:border-zinc-800 flex-col shadow-sm">
                        {/* Brand */}
                        <div className="px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center shadow-md shadow-red-600/20">
                                    <Home size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Admin</p>
                                    <h1 className="text-sm font-black text-zinc-900 dark:text-zinc-50 -mt-0.5">Tucasa</h1>
                                </div>
                            </div>
                        </div>

                        {/* Main Nav */}
                        <nav className="px-3 py-3 space-y-0.5">
                            {NAV_ITEMS.map((item) => {
                                const IconComp = ICON_MAP[item.icon];
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-150 group"
                                    >
                                        <IconComp size={18} className="text-zinc-400 group-hover:text-red-500 transition-colors shrink-0" />
                                        <span className="flex-1">{item.label}</span>
                                        {item.badge !== undefined && item.badge !== null && (
                                            <span className="text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-full leading-none">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Recent Properties */}
                        {recentProperties.length > 0 && (
                            <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-800/50">
                                <p className="px-3 mb-1.5 text-[9px] font-black text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
                                    <Clock size={10} />
                                    Recientes
                                </p>
                                <div className="space-y-0.5">
                                    {recentProperties.slice(0, 4).map((prop) => (
                                        <Link
                                            key={prop.id}
                                            href={`/admin/propiedades/editar/${prop.id}`}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors truncate"
                                            title={prop.titulo}
                                        >
                                            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />
                                            <span className="truncate">{prop.titulo}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex-1" />

                        {/* User + Logout */}
                        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/50">
                            <div className="flex items-center gap-3 px-3 py-2 mb-1">
                                <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 text-[11px] font-black uppercase shrink-0">
                                    {avatarLetter}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                                        {displayName}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Admin</p>
                                </div>
                            </div>
                            <form action={logout}>
                                <button className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-[12px] font-semibold text-zinc-400 dark:text-zinc-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150">
                                    <LogOut size={15} />
                                    <span>Cerrar sesión</span>
                                </button>
                            </form>
                        </div>
                    </aside>

                    {/* ============ MOBILE NAV ============ */}
                    <AdminMobileNav userEmail={user.email} userName={displayName} />

                    {/* ============ MAIN CONTENT ============ */}
                    <main className="flex-1 min-w-0">
                        {/* Topbar */}
                        <header className="hidden lg:flex items-center justify-between h-12 px-6 border-b border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-30">
                            <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                                <Command size={12} />
                                <kbd className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 dark:text-zinc-400">Ctrl+K</kbd>
                                <span>Búsqueda rápida</span>
                            </div>
                            <Link
                                href="/admin/propiedades/nuevo"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-red-700 transition-colors active:scale-95"
                            >
                                <Plus size={13} />
                                Nuevo
                            </Link>
                        </header>

                        {/* Page Content */}
                        <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </ToastProvider>
    )
}
