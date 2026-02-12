import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Inicio",
                "item": "https://www.tucasalospatios.com"
            },
            ...items.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 2,
                "name": item.label,
                "item": item.href ? `https://www.tucasalospatios.com${item.href}` : undefined
            }))
        ]
    };

    return (
        <nav className="flex mb-6 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar" aria-label="Breadcrumb">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                        <Home className="w-4 h-4 mr-2" />
                        Inicio
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index}>
                        <div className="flex items-center">
                            <ChevronRight className="w-4 h-4 text-zinc-400 mx-1" />
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="ml-1 text-sm font-medium text-zinc-500 hover:text-blue-600 md:ml-2 dark:text-zinc-400 dark:hover:text-blue-400"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="ml-1 text-sm font-bold text-zinc-900 md:ml-2 dark:text-zinc-100 uppercase tracking-tight">
                                    {item.label}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
