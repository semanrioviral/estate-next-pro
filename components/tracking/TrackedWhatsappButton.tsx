'use client';

import { ReactNode } from 'react';
import { openWhatsapp } from '@/lib/trackWhatsapp';
import { trackWhatsappLead } from '@/app/actions/crm';

interface TrackedWhatsappButtonProps {
    url: string;
    className: string;
    children: ReactNode;
    ariaLabel?: string;
    /** CRM tracking: property context for auto lead creation */
    propertyId?: string;
    propertyTitle?: string;
}

export default function TrackedWhatsappButton({ url, className, children, ariaLabel, propertyId, propertyTitle }: TrackedWhatsappButtonProps) {
    const handleClick = () => {
        // Auto-create CRM lead when property context is available
        if (propertyId || propertyTitle) {
            const phone = url.match(/wa\.me\/(\d+)/)?.[1] || '';
            trackWhatsappLead(phone, propertyId, propertyTitle);
        }
        openWhatsapp(url);
    };

    return (
        <button type="button" onClick={handleClick} className={className} aria-label={ariaLabel}>
            {children}
        </button>
    );
}
