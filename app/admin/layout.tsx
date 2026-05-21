import { createClient } from '@/lib/supabase-server'
import { LayoutDashboard, Home, Users, LogOut, PhoneCall } from 'lucide-react'
import Link from 'next/link'
import { logout } from './actions'

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    let user = null;
    try {
        const supabase = await createClient()
        const { data: { user: supabaseUser } } = await supabase.auth.getUser()
        user = supabaseUser;
    } catch (err) {
        console.error('Error initializing admin layout:', err)
    }

    if (!user) {
        // En lugar de redireccionar aquí, permitimos que el middleware lo haga
        // o simplemente mostramos el contenido (login)
        return <>{children}</>
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="lg:flex lg:min-h-screen">
                <aside className="hidden lg:flex lg:w-72 xl:w-80 bg-white border-r border-slate-200 flex-col">
                    <div className="px-7 py-6 border-b border-slate-100">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Panel Administrativo</p>
                        <h1 className="mt-2 text-2xl font-black text-red-600 tracking-tight">Inmobiliaria Tucasa</h1>
                    </div>

                    <nav className="flex-1 p-5 space-y-2">
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors font-semibold">
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </Link>
                        <Link href="/admin/propiedades" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors font-semibold">
                            <Home size={20} />
                            <span>Propiedades</span>
                        </Link>
                        <Link href="/admin/leads" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors font-semibold">
                            <PhoneCall size={20} />
                            <span>Leads / Consultas</span>
                        </Link>
                        <Link href="/admin/equipo" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors font-semibold">
                            <Users size={20} />
                            <span>Equipo</span>
                        </Link>
                    </nav>

                    <div className="p-5 border-t border-slate-100">
                        <form action={logout}>
                            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors font-semibold">
                                <LogOut size={20} />
                                <span>Cerrar sesión</span>
                            </button>
                        </form>
                    </div>
                </aside>

                <div className="flex-1 min-w-0">
                    <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200">
                        <div className="px-4 py-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Panel Admin</p>
                            <p className="text-lg font-black text-red-600">Inmobiliaria Tucasa</p>
                        </div>
                        <nav className="px-3 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
                            <Link href="/admin" className="whitespace-nowrap inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors">
                                <LayoutDashboard size={14} /> Dashboard
                            </Link>
                            <Link href="/admin/propiedades" className="whitespace-nowrap inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors">
                                <Home size={14} /> Propiedades
                            </Link>
                            <Link href="/admin/leads" className="whitespace-nowrap inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors">
                                <PhoneCall size={14} /> Leads
                            </Link>
                            <Link href="/admin/equipo" className="whitespace-nowrap inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-700 text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors">
                                <Users size={14} /> Equipo
                            </Link>
                            <form action={logout} className="ml-auto">
                                <button className="whitespace-nowrap inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors">
                                    <LogOut size={14} /> Salir
                                </button>
                            </form>
                        </nav>
                    </header>

                    <main className="px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
