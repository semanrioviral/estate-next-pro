'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { getFavoritesCount } from '@/lib/favorites';

interface FavoritesCounterProps {
    variant?: 'desktop' | 'mobile';
    onClick?: () => void;
    className?: string;
}

export default function FavoritesCounter({ variant = 'desktop', onClick, className = '' }: FavoritesCounterProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const update = () => setCount(getFavoritesCount());
        update();

        const handleChange = () => update();
        window.addEventListener('favoritesChanged', handleChange);
        window.addEventListener('storage', handleChange);

        // Periodic check in case event is missed
        const interval = setInterval(update, 2000);

        return () => {
            window.removeEventListener('favoritesChanged', handleChange);
            window.removeEventListener('storage', handleChange);
            clearInterval(interval);
        };
    }, []);

    if (variant === 'mobile') {
        return (
            <Link
                href="/favoritos"
                onClick={onClick}
                className={`flex items-center gap-3 text-2xl font-bold py-4 border-b border-slate-50 text-slate-900 ${className}`}
            >
                <Heart className={`w-6 h-6 ${count > 0 ? 'fill-red-500 text-red-500' : 'text-slate-300'}`} />
                Favoritos
                {count > 0 && (
                    <span className="ml-auto text-sm bg-red-500 text-white px-2 py-0.5 rounded-full font-black min-w-[28px] text-center">
                        {count}
                    </span>
                )}
            </Link>
        );
    }

    return (
        <Link
            href="/favoritos"
            aria-label={`Ver mis ${count} favoritos`}
            className={`relative h-11 w-11 rounded-full inline-flex items-center justify-center transition-all hover:scale-105 border ${
                count > 0
                    ? 'bg-red-50 border-red-200 hover:bg-red-100'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
            } ${className}`}
        >
            <Heart
                className={`w-5 h-5 transition-colors ${
                    count > 0 ? 'fill-red-500 text-red-500' : 'text-slate-500'
                }`}
            />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}
