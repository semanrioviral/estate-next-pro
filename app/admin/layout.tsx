import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { LayoutDashboard, Home, Send, Users, LogOut } from 'lucide-react'
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
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-red-600">Admin Panel</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-red-600 transition-colors">
                        <LayoutDashboard size={20} />
                        <span>Overview</span>
                    </Link>
                    <Link href="/admin/propiedades" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-red-600 transition-colors">
                        <Home size={20} />
                        <span>Propiedades</span>
                    </Link>
                    <Link href="/admin/solicitudes" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-red-600 transition-colors">
                        <Send size={20} />
                        <span>Solicitudes</span>
                    </Link>
                    <Link href="/admin/equipo" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-red-600 transition-colors">
                        <Users size={20} />
                        <span>Equipo</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <form action={logout}>
                        <button className="flex items-center space-x-3 p-3 w-full rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-700 transition-colors">
                            <LogOut size={20} />
                            <span>Cerrar sesión</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-10">
                {children}
            </main>
        </div>
    )
}
