'use client';

import { useEffect } from 'react';

export default function PropertyViewTracker({ propertyId }: { propertyId: string }) {
    useEffect(() => {
        try {
            const stored = localStorage.getItem('recently_viewed');
            let ids: string[] = stored ? JSON.parse(stored) : [];

            // Eliminar si ya existe para moverlo al principio
            ids = ids.filter(id => id !== propertyId);

            // Agregar al principio
            ids.unshift(propertyId);

            // Limitar a los últimos 10
            const limited = ids.slice(0, 10);

            localStorage.setItem('recently_viewed', JSON.stringify(limited));
        } catch (error) {
            console.error('Error tracking property view:', error);
        }
    }, [propertyId]);

    return null;
}
