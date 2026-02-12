import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black py-12 mt-20">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            TucasaLosPatios
                        </Link>
                        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-xs leading-relaxed">
                            Líderes en finca raíz en Norte de Santander. Expertos en ayudarte a encontrar el hogar de tus sueños en la zona fronteriza.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Empresa</h3>
                        <ul className="mt-4 space-y-3">
                            <li><Link href="/" className="text-sm text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors">Inicio</Link></li>
                            <li><Link href="/propiedades" className="text-sm text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors">Propiedades</Link></li>
                            <li><Link href="/nosotros" className="text-sm text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors">Nosotros</Link></li>
                            <li><Link href="/contacto" className="text-sm text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors">Contacto</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Ciudades</h3>
                        <ul className="mt-4 space-y-3">
                            <li><Link href="/los-patios" className="text-sm text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors">Los Patios</Link></li>
                            <li><Link href="/cucuta" className="text-sm text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors">Cúcuta</Link></li>
                            <li><Link href="/villa-del-rosario" className="text-sm text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors">Villa del Rosario</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-zinc-200 dark:border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        © {new Date().getFullYear()} TucasaLosPatios. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-8">
                        <Link href="/privacidad" className="text-xs text-zinc-500 hover:text-zinc-700">Privacidad</Link>
                        <Link href="/terminos" className="text-xs text-zinc-500 hover:text-zinc-700">Términos</Link>
                        <span className="text-xs text-zinc-500">Bogotá, Colombia</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
