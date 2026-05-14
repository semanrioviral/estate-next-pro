import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 pt-24 pb-12 mt-32">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-12 mb-20">
                    <div className="md:col-span-5">
                        <Link href="/" className="flex items-center gap-2 group mb-6">
                            <div className="w-8 h-8 bg-[#fb2c36] rounded-lg flex items-center justify-center transition-transform group-hover:rotate-6">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <span className="text-xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 uppercase leading-none">
                                Inmobiliaria<br /><span className="text-[#fb2c36]">Tucasa Los Patios</span>
                            </span>
                        </Link>
                        <p className="text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed text-base font-medium">
                            Transformamos la búsqueda de tu hogar en una experiencia profesional y sin complicaciones en el área metropolitana de Cúcuta.
                        </p>
                    </div>

                    <div className="md:col-span-2">
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] mb-8">Empresa</h3>
                        <ul className="space-y-4">
                            <li><Link href="/propiedades" className="text-zinc-600 dark:text-zinc-400 hover:text-[#fb2c36] dark:hover:text-[#fb2c36] transition-colors font-medium">Catálogo</Link></li>
                            <li><Link href="/nosotros" className="text-zinc-600 dark:text-zinc-400 hover:text-[#fb2c36] dark:hover:text-[#fb2c36] transition-colors font-medium">Nosotros</Link></li>
                            <li><Link href="/contacto" className="text-zinc-600 dark:text-zinc-400 hover:text-[#fb2c36] dark:hover:text-[#fb2c36] transition-colors font-medium">Contacto</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] mb-8">Inventario</h3>
                        <ul className="space-y-4">
                            <li><Link href="/venta" className="text-zinc-600 dark:text-zinc-400 hover:text-[#fb2c36] dark:hover:text-[#fb2c36] transition-colors font-medium">En Venta</Link></li>
                            <li><Link href="/arriendo" className="text-zinc-600 dark:text-zinc-400 hover:text-[#fb2c36] dark:hover:text-[#fb2c36] transition-colors font-medium">En Arriendo</Link></li>
                            <li><Link href="/venta/los-patios/casa" className="text-zinc-600 dark:text-zinc-400 hover:text-[#fb2c36] dark:hover:text-[#fb2c36] transition-colors font-medium">Casas en Venta</Link></li>
                            <li><Link href="/venta/los-patios/apartamento" className="text-zinc-600 dark:text-zinc-400 hover:text-[#fb2c36] dark:hover:text-[#fb2c36] transition-colors font-medium">Apartamentos</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] mb-8">Propietarios</h3>
                        <ul className="space-y-4">
                            <li><Link href="/vender-casa-en-los-patios" className="text-zinc-600 dark:text-zinc-400 hover:text-[#fb2c36] dark:hover:text-[#fb2c36] transition-colors font-medium">Vender Los Patios</Link></li>
                            <li><Link href="/vender-casa-en-cucuta" className="text-zinc-600 dark:text-zinc-400 hover:text-[#fb2c36] dark:hover:text-[#fb2c36] transition-colors font-medium">Vender en Cúcuta</Link></li>
                            <li><Link href="/vender-casa-en-villa-del-rosario" className="text-zinc-600 dark:text-zinc-400 hover:text-[#fb2c36] dark:hover:text-[#fb2c36] transition-colors font-medium">Vender V. Rosario</Link></li>
                            <li><Link href="/contacto" className="text-zinc-600 dark:text-zinc-400 hover:text-[#fb2c36] dark:hover:text-[#fb2c36] transition-colors font-medium">Consignar</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-3">
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] mb-8">Contacto</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium mb-4">
                            Av. Principal Los Patios<br />
                            Norte de Santander, Colombia
                        </p>
                        <a href={`tel:${process.env.NEXT_PUBLIC_PHONE_NUMBER}`} className="text-[#fb2c36] font-bold block mb-2">{process.env.NEXT_PUBLIC_PHONE_NUMBER?.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}</a>
                        <a href="mailto:ventas@tucasalospatios.com" className="text-zinc-600 dark:text-zinc-400 hover:text-[#fb2c36] transition-colors font-medium">ventas@tucasalospatios.com</a>
                    </div>
                </div>

                <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                        © {new Date().getFullYear()} Inmobiliaria Tucasa Los Patios • Inmobiliaria Profesional
                    </p>
                    <div className="flex gap-10">
                        <Link href="/privacidad" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-[#fb2c36] transition-colors">Privacidad</Link>
                        <Link href="/terminos" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-[#fb2c36] transition-colors">Términos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
