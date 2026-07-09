'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { isFavorite, toggleFavorite, Favorite } from '@/lib/favorites';
import { trackEvent } from './tracking/gtag';

interface FavoriteButtonProps {
    property: Omit<Favorite, 'addedAt'>;
    variant?: 'card' | 'detail';
    className?: string;
}

export default function FavoriteButton({ property, variant = 'card', className = '' }: FavoriteButtonProps) {
    const [favorited, setFavorited] = useState(false);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        setFavorited(isFavorite(property.slug));

        const handleChange = () => setFavorited(isFavorite(property.slug));
        window.addEventListener('favoritesChanged', handleChange);
        window.addEventListener('storage', handleChange);

        return () => {
            window.removeEventListener('favoritesChanged', handleChange);
            window.removeEventListener('storage', handleChange);
        };
    }, [property.slug]);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const wasAdded = toggleFavorite(property);
        setFavorited(wasAdded);
        setAnimating(true);

        trackEvent('property_favorite', {
            property_id: property.id,
            property_slug: property.slug,
            action: wasAdded ? 'add' : 'remove',
        });

        setTimeout(() => setAnimating(false), 600);
    };

    if (variant === 'detail') {
        return (
            <button
                type="button"
                onClick={handleClick}
                aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                aria-pressed={favorited}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                    favorited
                        ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                        : 'border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                } ${className}`}
            >
                <Heart
                    className={`h-4 w-4 transition-transform ${favorited ? 'fill-current' : ''} ${animating ? 'scale-125' : ''}`}
                />
                {favorited ? 'Guardado' : 'Guardar'}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-pressed={favorited}
            className={`absolute top-3 right-3 z-30 h-9 w-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                favorited
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-white/90 backdrop-blur-sm text-zinc-500 hover:text-red-500 hover:bg-white'
            } shadow-md border border-white/20 ${animating ? 'scale-125' : ''} transition-transform ${className}`}
        >
            <Heart
                className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`}
            />
        </button>
    );
}
