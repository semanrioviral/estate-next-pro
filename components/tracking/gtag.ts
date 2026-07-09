/**
 * Google Analytics 4 event tracking helper
 * Provides type-safe event tracking for Tucasa Los Patios
 */

declare global {
    interface Window {
        gtag?: (
            command: 'event' | 'config' | 'set' | 'js',
            eventName: string,
            params?: Record<string, unknown>
        ) => void;
    }
}

export type GAEventName =
    | 'whatsapp_click'
    | 'form_submit'
    | 'property_view'
    | 'property_favorite'
    | 'search_filter'
    | 'consignar_form_submit'
    | 'cta_click'
    | 'phone_call'
    | 'gallery_view'
    | 'pdf_download';

interface GAEventParams {
    [key: string]: string | number | boolean | undefined;
}

/**
 * Track a custom event in Google Analytics 4
 * Safe to call even if gtag is not loaded (no-op)
 */
export function trackEvent(eventName: GAEventName, params?: GAEventParams): void {
    if (typeof window === 'undefined') return;
    if (typeof window.gtag !== 'function') return;

    try {
        window.gtag('event', eventName, {
            ...params,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        // Silent fail — don't break UX
    }
}

/**
 * Track WhatsApp click with property context
 */
export function trackWhatsAppClick(source: string, propertyId?: string, propertyTitle?: string): void {
    trackEvent('whatsapp_click', {
        source,
        property_id: propertyId,
        property_title: propertyTitle,
        content_category: 'real_estate',
    });
}

/**
 * Track form submission
 */
export function trackFormSubmit(formName: string, formLocation: string, propertyId?: string): void {
    trackEvent('form_submit', {
        form_name: formName,
        form_location: formLocation,
        property_id: propertyId,
    });
}

/**
 * Track property view
 */
export function trackPropertyView(propertyId: string, propertyTitle: string, price: number, operacion: string): void {
    trackEvent('property_view', {
        property_id: propertyId,
        property_title: propertyTitle,
        value: price,
        currency: 'COP',
        operacion,
    });
}

/**
 * Track search filter usage
 */
export function trackSearchFilter(filters: Record<string, string | number>): void {
    trackEvent('search_filter', filters);
}

/**
 * Track phone call click
 */
export function trackPhoneCall(source: string): void {
    trackEvent('phone_call', { source });
}

/**
 * Track consignar (sell) form submission
 */
export function trackConsignarSubmit(source: string): void {
    trackEvent('consignar_form_submit', { source });
}
