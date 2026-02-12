import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tucasalospatios.com"), // TODO: Update to production domain
  title: {
    default: "TucasaLosPatios | Inmobiliaria Líder en Norte de Santander",
    template: "%s | TucasaLosPatios"
  },
  description: "Encuentra tu hogar ideal en Cúcuta, Los Patios y Villa del Rosario. Expertos en venta de casas, apartamentos y lotes. Tu mejor opción inmobiliaria en la frontera.",
  keywords: ["inmobiliaria cúcuta", "casas en venta los patios", "apartamentos villa del rosario", "finca raíz norte de santander", "vivienda cúcuta"],
  authors: [{ name: "TucasaLosPatios" }],
  creator: "TucasaLosPatios",
  publisher: "TucasaLosPatios",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://www.tucasalospatios.com",
    siteName: "TucasaLosPatios",
    title: "TucasaLosPatios | Inmobiliaria Líder en Norte de Santander",
    description: "Expertos en venta y renta de inmuebles en el área metropolitana de Cúcuta.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TucasaLosPatios | Inmobiliaria Líder en Norte de Santander",
    description: "Tu hogar ideal en Cúcuta, Los Patios y Villa del Rosario.",
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
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white dark:bg-black`}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
