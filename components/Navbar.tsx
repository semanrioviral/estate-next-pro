import Link from "next/link";

export default function Navbar() {
    return (
        <header className="fixed top-4 left-0 right-0 z-50 px-6">
            <nav className="mx-auto max-w-7xl glass rounded-3xl px-8 py-4 flex items-center justify-between shadow-lg shadow-black/5">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                        Tucasa<span className="text-blue-600">LP</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/propiedades" className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Propiedades
                    </Link>
                    <Link href="/nosotros" className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Nosotros
                    </Link>
                    <Link href="/contacto" className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Contacto
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <a
                        href="https://wa.me/573223047435"
                        className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-zinc-200 dark:shadow-none"
                    >
                        Agendar Cita
                    </a>
                </div>
            </nav>
        </header>
    );
}
