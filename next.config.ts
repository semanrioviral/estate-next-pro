import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      'embla-carousel-react',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
    ],
  },
  images: {
    loader: 'custom',
    loaderFile: './lib/cloudinary-loader.ts',
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async redirects() {
    return [
      // Antiguas URLs de WordPress - 301 a páginas equivalentes
      {
        source: '/Categoria/venta/:path*',
        destination: '/venta',
        permanent: true,
      },
      {
        source: '/category/:path*',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/servicios',
        destination: '/nosotros',
        permanent: true,
      },
      {
        source: '/servicios/:path*',
        destination: '/nosotros',
        permanent: true,
      },
      {
        source: '/consignar-inmueble-los-patios-cucuta',
        destination: '/vender-casa-en-los-patios',
        permanent: true,
      },
      {
        source: '/casas-en-venta-en-los-patios-compra-con-caja-honor',
        destination: '/venta/los-patios',
        permanent: true,
      },
      {
        source: '/resultados-de-la-busqueda',
        destination: '/propiedades',
        permanent: true,
      },
      {
        source: '/quieres-vender-tu-casa-en-los-patios-cucuta-y-colombia',
        destination: '/vender-casa-en-los-patios',
        permanent: true,
      },
      {
        source: '/vender-casa-en-los-patios-cucuta-y-colombia',
        destination: '/vender-casa-en-los-patios',
        permanent: true,
      },
      // WordPress neighborhood taxonomy pages
      {
        source: '/es_neighborhood/:slug*',
        destination: '/barrio/:slug*',
        permanent: true,
      },
      // WordPress Propiedades (capitalized)
/*
      {
        source: '/Propiedades/:slug*',
        destination: '/propiedades/:slug*',
        permanent: true,
      },
*/
    ];
  },
};

export default nextConfig;
