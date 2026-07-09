/**
 * Favorites management using localStorage
 * Allows unauthenticated users to save properties
 */

const STORAGE_KEY = 'tucasa_favorites';

export interface Favorite {
    id: string;
    slug: string;
    titulo: string;
    precio: number;
    operacion: string;
    tipo: string;
    ciudad: string;
    barrio?: string;
    habitaciones?: number;
    area_m2?: number;
    imagen_principal: string;
    addedAt: string;
}

function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

export function getFavorites(): Favorite[] {
    if (!isBrowser()) return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function isFavorite(slug: string): boolean {
    if (!isBrowser()) return false;
    try {
        const favorites = getFavorites();
        return favorites.some(f => f.slug === slug);
    } catch {
        return false;
    }
}

export function addFavorite(property: Omit<Favorite, 'addedAt'>): void {
    if (!isBrowser()) return;
    try {
        const favorites = getFavorites();
        if (favorites.some(f => f.slug === property.slug)) return;
        const newFavorite: Favorite = {
            ...property,
            addedAt: new Date().toISOString(),
        };
        favorites.push(newFavorite);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        // Notify listeners
        window.dispatchEvent(new CustomEvent('favoritesChanged'));
    } catch (err) {
        console.error('[Favorites] Error adding:', err);
    }
}

export function removeFavorite(slug: string): void {
    if (!isBrowser()) return;
    try {
        const favorites = getFavorites();
        const filtered = favorites.filter(f => f.slug !== slug);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        window.dispatchEvent(new CustomEvent('favoritesChanged'));
    } catch (err) {
        console.error('[Favorites] Error removing:', err);
    }
}

export function toggleFavorite(property: Omit<Favorite, 'addedAt'>): boolean {
    if (isFavorite(property.slug)) {
        removeFavorite(property.slug);
        return false;
    } else {
        addFavorite(property);
        return true;
    }
}

export function clearAllFavorites(): void {
    if (!isBrowser()) return;
    try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent('favoritesChanged'));
    } catch (err) {
        console.error('[Favorites] Error clearing:', err);
    }
}

export function getFavoritesCount(): number {
    return getFavorites().length;
}
