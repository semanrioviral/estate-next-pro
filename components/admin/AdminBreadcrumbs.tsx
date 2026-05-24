import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface AdminBreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function AdminBreadcrumbs({ items }: AdminBreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-4">
            <Link
                href="/admin"
                className="flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
                <Home size={13} />
                <span className="hidden sm:inline">Admin</span>
            </Link>
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                    <ChevronRight size={12} className="text-zinc-300 dark:text-zinc-700" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors truncate max-w-[160px]"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-zinc-700 dark:text-zinc-300 font-semibold truncate max-w-[160px]">
                            {item.label}
                        </span>
                    )}
                </span>
            ))}
        </nav>
    );
}
