import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
