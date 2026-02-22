'use client';

import { ReactNode } from 'react';
import { openWhatsapp } from '@/lib/trackWhatsapp';

interface TrackedWhatsappButtonProps {
  url: string;
  className: string;
  children: ReactNode;
  ariaLabel?: string;
}

export default function TrackedWhatsappButton({
  url,
  className,
  children,
  ariaLabel,
}: TrackedWhatsappButtonProps) {
  return (
    <button
      type="button"
      onClick={() => openWhatsapp(url)}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
