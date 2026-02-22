import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase-server';
import { PROPERTY_SELECT_FIELDS } from '@/lib/supabase/select-fields';
import { attachImagesToProperties } from '@/lib/supabase/properties';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const idsString = searchParams.get('ids');

        if (!idsString) {
            return NextResponse.json([]);
        }

        const ids = idsString.split(',').filter(id => id.length > 0);
        if (ids.length === 0) {
            return NextResponse.json([]);
        }

        const supabase = createPublicClient();
        const { data, error } = await supabase
            .from('properties')
            .select(PROPERTY_SELECT_FIELDS)
            .in('id', ids);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const propertiesWithImages = await attachImagesToProperties(data || [], supabase);

        // Mantener el orden de los IDs recibidos (el más reciente primero)
        const sortedResults = propertiesWithImages.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

        return NextResponse.json(sortedResults);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
