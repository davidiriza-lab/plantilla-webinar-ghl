import type { NextConfig } from 'next';

/**
 * Para servir el sitio bajo una ruta (p. ej. midominio.com/plantilla) en vez
 * de la raíz: BASE_PATH=/plantilla en las variables de entorno. Vacío = raíz,
 * que es lo normal. `ruta()` en src/lib/ruta.ts usa el mismo valor.
 */
const basePath = (process.env.BASE_PATH ?? '').replace(/\/$/, '');

const nextConfig: NextConfig = {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  async rewrites() {
    // El manual de trabajo (docs/GUIA.html) solo se publica donde se pide con
    // PUBLICAR_MANUAL=1: la demo de BGI, que lo sirve como
    // www.mibgi.com/manual-embudo. scripts/publicar-manual.mjs lo genera.
    if (process.env.PUBLICAR_MANUAL !== '1') return [];
    return [{ source: '/manual-embudo', destination: '/manual-embudo.html' }];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // El Zoom y el WhatsApp viajan en enlaces: que no se filtren como referrer.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        // El formulario de interesados dejó de ser una página aparte: vive
        // dentro de la oferta. La ruta vieja se mantiene por si el enlace ya
        // anda circulando en algún lado.
        source: '/interesado',
        destination: '/oferta#interesado',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
