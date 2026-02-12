import Link from "next/link";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        EstatePro
                    </span>
                </Link>
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors">
                        Inicio
                    </Link>
                    <Link href="/propiedades" className="text-sm font-medium text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors">
                        Propiedades
                    </Link>
                    <Link href="/nosotros" className="text-sm font-medium text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors">
                        Nosotros
                    </Link>
                    <Link href="/contacto" className="text-sm font-medium text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors">
                        Contacto
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <button className="hidden md:block rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all">
                        Ingresar
                    </button>
                    {/* Mobile menu (para implementación futura) */}
                    <button className="md:hidden p-2 text-zinc-600 dark:text-zinc-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                </div>
            </div>
        </header>
    );
}
