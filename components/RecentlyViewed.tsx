'use client';

import React, { useEffect, useState } from 'react';
import type { Property } from '@/lib/supabase/properties';
import PropertyCard from './PropertyCard';
import { History, EyeOff } from 'lucide-react';

export default function RecentlyViewed() {
    const [recentProperties, setRecentProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRecent = async () => {
            try {
                const stored = localStorage.getItem('recently_viewed');
                if (!stored) {
                    setLoading(false);
                    return;
                }

                const ids = JSON.parse(stored) as string[];
                if (ids.length === 0) {
                    setLoading(false);
                    return;
                }

                // Fetch details for these IDs
                // We'll use a fetch to a search endpoint or just the properties data
                // For simplicity, we can fetch them via a Server Action or just use the IDs
                // Since we don't have a bulk fetch by ID client-side easily exposed, 
                // we'll fetch from the public API if available or just use a small fetch.

                // For now, we'll assume there's a way to get them. 
                // Given the constraints, I'll create a small helper in properties.ts 
                // to fetch properties by multiple IDs safely.

                const response = await fetch(`/api/properties/bulk?ids=${ids.join(',')}`);
                if (response.ok) {
                    const data = await response.json();
                    setRecentProperties(data);
                }
            } catch (error) {
                console.error('Error loading recently viewed:', error);
            } finally {
                setLoading(false);
            }
        };

        loadRecent();
    }, []);

    if (loading || recentProperties.length === 0) return null;

    return (
        <section className="mt-20 pt-10">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-xl">
                    <History className="w-6 h-6 text-[#fb2c36]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                    Visto recientemente
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {recentProperties.map((prop) => (
                    <div key={prop.id} className="scale-90 origin-top-left -mr-[10%] -mb-[10%]">
                        <PropertyCard property={prop} />
                    </div>
                ))}
            </div>

            <button
                onClick={() => {
                    localStorage.removeItem('recently_viewed');
                    setRecentProperties([]);
                }}
                className="mt-6 text-xs font-bold text-zinc-400 hover:text-zinc-600 flex items-center gap-2 transition-colors"
            >
                <EyeOff className="w-3 h-3" />
                Limpiar historial
            </button>
        </section>
    );
}
