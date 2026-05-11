import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { getGoogleAccessToken } from '@/lib/google/auth';

export const runtime = 'nodejs'; // Ensure server-side execution

export async function GET(request: Request) {
    try {
        // 1. Validate CRON execution
        const isDevelopment = process.env.NODE_ENV === 'development';
        const authHeader = request.headers.get('authorization');
        const secret = process.env.CRON_SECRET;

        // Skip auth check only in development mode
        if (!isDevelopment) {
            if (!secret || authHeader !== `Bearer ${secret}`) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        // Use Admin Client to bypass RLS for system task
        const supabase = createAdminClient();

        // 2. Fetch one featured property
        const { data: property, error: propError } = await supabase
            .from('properties')
            .select('id, titulo, precio, barrio, ciudad, slug')
            .eq('destacado', true)
            .limit(1)
            .single();

        if (propError || !property) {
            return NextResponse.json({
                success: false,
                error: propError?.message || 'No featured property found'
            }, { status: 404 });
        }

        // 3. Fetch main image
        const { data: image, error: imgError } = await supabase
            .from('property_images')
            .select('url')
            .eq('property_id', property.id)
            .limit(1)
            .single();

        // 4. Generate post text
        // Format price for display
        const formattedPrecio = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(property.precio);

        const propertyUrl = `https://tucasalospatios.com/propiedades/${property.slug}`;
        const postText = `🏡 ${property.titulo}\n📍 ${property.barrio}, ${property.ciudad}\n💰 ${formattedPrecio}\n\nAgenda tu visita hoy:\n${propertyUrl}`;

        // 5. Publish to Google Business Profile
        const accountId = process.env.GOOGLE_ACCOUNT_ID;
        const locationId = process.env.GOOGLE_LOCATION_ID;

        if (!accountId || !locationId) {
            return NextResponse.json({
                success: false,
                error: 'Missing GOOGLE_ACCOUNT_ID or GOOGLE_LOCATION_ID in environment'
            }, { status: 400 });
        }

        const accessToken = await getGoogleAccessToken();
        const googleResponse = await fetch(
            `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    languageCode: 'es',
                    summary: postText,
                    callToAction: {
                        actionType: 'LEARN_MORE',
                        url: propertyUrl
                    },
                    media: image?.url ? [
                        {
                            mediaFormat: 'PHOTO',
                            sourceUrl: image.url
                        }
                    ] : [],
                    topicType: 'STANDARD'
                }),
            }
        );

        const gText = await googleResponse.text();
        console.log("Google raw response:", gText);
        let gData;
        try {
            gData = JSON.parse(gText);
        } catch (e) {
            console.error("Failed to parse Google JSON:", gText);
            throw new Error("Google returned non-JSON response: " + gText);
        }

        if (!googleResponse.ok) {
            console.error('Google API Error:', gData);
            return NextResponse.json({
                success: false,
                error: 'Google Business API error',
                details: gData
            }, { status: googleResponse.status });
        }

        // 6. Return JSON with both internal and Google info
        return NextResponse.json({
            success: true,
            propertyId: property.id,
            image: image?.url || null,
            postText,
            googleResponse: gData
        });

    } catch (error: any) {
        console.error('Automation Error:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Internal Server Error',
            message: error.message
        }, { status: 500 });
    }
}
