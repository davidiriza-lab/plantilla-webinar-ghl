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
    return [
      {
        // El cuaderno de trabajo (docs/GUIA.html) se publica como página
        // estática autocontenida; scripts/publicar-manual.mjs la genera en
        // cada build. En BGI se sirve como www.mibgi.com/manual-embudo.
        source: '/manual-embudo',
        destination: '/manual-embudo.html',
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
