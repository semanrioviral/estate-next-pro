'use client';

import { useEffect } from 'react';
import { trackPropertyView } from './gtag';

interface PropertyViewGA4Props {
    propertyId: string;
    propertyTitle: string;
    precio: number;
    operacion: string;
}

export default function PropertyViewGA4({ propertyId, propertyTitle, precio, operacion }: PropertyViewGA4Props) {
    useEffect(() => {
        trackPropertyView(propertyId, propertyTitle, precio, operacion);
    }, [propertyId, propertyTitle, precio, operacion]);

    return null;
}
