"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, Home, Users, LogOut, PhoneCall, MessageSquare, KanbanSquare } from 'lucide-react';
import { logout } from '@/app/admin/actions';

interface AdminMobileNavProps {
    userEmail?: string;
    userName?: string;
}

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/crm', label: 'CRM Pipeline', icon: KanbanSquare },
    { href: '/admin/propiedades', label: 'Propiedades', icon: Home },
    { href: '/admin/leads', label: 'Leads', icon: PhoneCall },
    { href: '/admin/solicitudes', label: 'Solicitudes', icon: MessageSquare },
    { href: '/admin/equipo', label: 'Equipo', icon: Users },
];

export default function AdminMobileNav({ userEmail, userName }: AdminMobileNavProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Close drawer on route change
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Lock body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <>
            {/* Mobile Top Bar */}
            <header className="lg:hidden sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200/60 dark:border-zinc-800 backdrop-blur-xl bg-white/90 dark:bg-zinc-900/90">
                <div className="flex items-center justify-between px-4 h-14">
                    <button
                        onClick={() => setOpen(true)}
                        className="p-2 -ml-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        aria-label="Abrir menú"
                    >
                        <Menu size={22} className="text-zinc-700 dark:text-zinc-300" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-red-600 flex items-center justify-center">
                            <Home size={14} className="text-white" />
                        </div>
                        <span className="text-sm font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Tucasa</span>
                    </div>
                    <div className="w-10" /> {/* spacer for centering */}
                </div>
            </header>

            {/* Backdrop */}
            {open && (
                <div
                    className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Slide-over Drawer */}
            <aside
                className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-zinc-900 shadow-2xl transform transition-transform duration-300 ease-out ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-5 h-14 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center shadow-md shadow-red-600/15">
                            <Home size={16} className="text-white" />
                        </div>
                        <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">Panel Admin</span>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-2 -mr-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        aria-label="Cerrar menú"
                    >
                        <X size={20} className="text-zinc-500" />
                    </button>
                </div>

                {/* User Info */}
                <div className="px-5 py-4 border-b border-zinc-50 dark:border-zinc-800/30">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 text-sm font-black uppercase">
                            {userEmail?.charAt(0) || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {userName || userEmail || 'Admin'}
                            </p>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider">Administrador</p>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="p-3 space-y-0.5">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                                    isActive
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                                }`}
                            >
                                <item.icon size={19} className={isActive ? 'text-red-500' : 'text-zinc-400'} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto h-2 w-2 rounded-full bg-red-600" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-zinc-100 dark:border-zinc-800/50">
                    <form action={logout}>
                        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150">
                            <LogOut size={18} />
                            <span>Cerrar sesión</span>
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
