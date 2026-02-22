import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/lib/supabase/blog';

interface BlogCardProps {
    post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
    const formattedDate = new Date(post.created_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="group bg-white rounded-xl border border-zinc-100 overflow-hidden flex flex-col h-full shadow-sm hover:border-brand transition-all duration-300">
            {/* Visual Accent */}
            <div className="h-1 bg-brand transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

            <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-brand uppercase tracking-widest bg-brand/5 px-3 py-1 rounded-lg">
                        {post.categoria || 'Actualidad'}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted font-black uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                    </div>
                </div>

                <h3 className="text-xl font-black mb-4 text-zinc-950 group-hover:text-brand transition-colors line-clamp-2 leading-tight">
                    <Link href={`/blog/${post.slug}`}>
                        {post.titulo}
                    </Link>
                </h3>

                <p className="text-text-secondary text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                    {post.excerpt || 'Descubra las últimas tendencias y consejos sobre el mercado inmobiliario en Norte de Santander con nuestro equipo de expertos.'}
                </p>

                <div className="mt-auto flex items-center justify-between pt-6 border-t border-zinc-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center">
                            <User className="w-4 h-4 text-zinc-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Equipo TLP</span>
                    </div>

                    <Link
                        href={`/blog/${post.slug}`}
                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand group/link"
                    >
                        Leer más
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
