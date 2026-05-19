import { ImageResponse } from 'next/og';
import { SITE_URL } from '@/lib/supabase/constants';

export const runtime = 'edge';

export async function GET() {
    const siteUrl = SITE_URL;

    return new ImageResponse(
        (
            <div
                style={{
                    width: 512,
                    height: 512,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                }}
            >
                <img
                    src={`${siteUrl}/logo.png`}
                    width={410}
                    height={239}
                    style={{
                        objectFit: 'contain',
                        display: 'block',
                    }}
                    alt="Inmobiliaria Tucasa Los Patios"
                />
            </div>
        ),
        {
            width: 512,
            height: 512,
            headers: {
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Content-Type': 'image/png',
            },
        }
    );
}
