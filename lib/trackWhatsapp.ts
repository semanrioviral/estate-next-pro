declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function openWhatsapp(url: string) {
  if (typeof window !== 'undefined') {
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Contact');
    }

    window.open(url, '_blank');
  }
}
