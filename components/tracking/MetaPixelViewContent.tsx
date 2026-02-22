'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

interface MetaPixelViewContentProps {
  contentIds: string[];
  contentType: 'product';
  value: number;
  currency: 'COP';
}

export default function MetaPixelViewContent({
  contentIds,
  contentType,
  value,
  currency,
}: MetaPixelViewContentProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;

    window.fbq('track', 'ViewContent', {
      content_ids: contentIds,
      content_type: contentType,
      value,
      currency,
    });

    firedRef.current = true;
  }, [contentIds, contentType, value, currency]);

  return null;
}
