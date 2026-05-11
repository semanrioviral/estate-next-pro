import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tucasalospatios.com"),
  title: {
    default: "Inmobiliaria Tucasa Los Patios | Líder en Finca Raíz Norte de Santander",
    template: "%s | Inmobiliaria Tucasa Los Patios"
  },
  description: "Encuentra tu hogar ideal en Cúcuta, Los Patios y Villa del Rosario. Expertos en venta de casas, apartamentos y lotes. Tu mejor opción inmobiliaria en la frontera.",
  keywords: ["inmobiliaria cúcuta", "casas en venta los patios", "apartamentos villa del rosario", "finca raíz norte de santander", "vivienda cúcuta"],
  authors: [{ name: "Inmobiliaria Tucasa Los Patios" }],
  creator: "Inmobiliaria Tucasa Los Patios",
  publisher: "Inmobiliaria Tucasa Los Patios",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://tucasalospatios.com",
    siteName: "Inmobiliaria Tucasa Los Patios",
    title: "Inmobiliaria Tucasa Los Patios | Líder en Finca Raíz Norte de Santander",
    description: "Expertos en venta y renta de inmuebles en el área metropolitana de Cúcuta.",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Inmobiliaria Tucasa Los Patios" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inmobiliaria Tucasa Los Patios | Líder en Finca Raíz Norte de Santander",
    description: "Tu hogar ideal en Cúcuta, Los Patios y Villa del Rosario.",
    images: ["https://tucasalospatios.com/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = "https://tucasalospatios.com";
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  const globalJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}#organization`,
        "name": "Inmobiliaria Tucasa Los Patios",
        "url": siteUrl,
        "logo": {
          "@type": "ImageObject",
          "@id": `${siteUrl}#logo`,
          "url": `${siteUrl}/logo.png`,
          "contentUrl": `${siteUrl}/logo.png`,
          "caption": "Inmobiliaria Tucasa Los Patios"
        },
        "telephone": "+57 322 304 7435",
        "email": "ventas@tucasalospatios.com",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Los Patios",
          "addressRegion": "Norte de Santander",
          "addressCountry": "CO"
        }
      },
      {
        "@type": "RealEstateAgent",
        "@id": `${siteUrl}#realestateagent`,
        "name": "Inmobiliaria Tucasa Los Patios",
        "url": siteUrl,
        "telephone": "+57 322 304 7435",
        "areaServed": [
          "Los Patios",
          "Cúcuta",
          "Villa del Rosario"
        ],
        "parentOrganization": {
          "@id": `${siteUrl}#organization`
        }
      }
    ]
  };

  return (
    <html lang="es" className="scroll-smooth light" data-scroll-behavior="smooth" style={{ colorScheme: 'light' }}>
      <body className={`${outfit.variable} font-sans antialiased min-h-screen bg-white text-zinc-900`}>
        {metaPixelId ? (
          <>
            <Script id="meta-pixel-base" strategy="afterInteractive">
              {`
                var metaPixelId = '${metaPixelId}';
                !function(f,b,e,v,n,t,s){
                  if(f.fbq)return;
                  n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;
                  n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];
                  function loadPixelScript() {
                    t=b.createElement(e);t.async=!0;
                    t.src=v;
                    s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s);
                  }
                  if ("requestIdleCallback" in window) {
                    requestIdleCallback(loadPixelScript);
                  } else {
                    setTimeout(loadPixelScript, 2000);
                  }
                }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', metaPixelId);
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
