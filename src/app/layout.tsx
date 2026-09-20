import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import { MARCA } from '@/contenido/marca';
import { variablesDeFondos } from '@/lib/fondos';
import './globals.css';

// Tipografías del kit Business Growth Intensive: Space Grotesk para titulares,
// Inter para todo lo demás. Cámbialas aquí (next/font las descarga solas).
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--fuente-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--fuente-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(MARCA.sitio),
  title: MARCA.seo.titulo,
  description: MARCA.seo.descripcion,
  openGraph: {
    title: MARCA.seo.titulo,
    description: MARCA.seo.descripcion,
    type: 'website',
    locale: MARCA.seo.locale,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: MARCA.seo.color,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Las variables de next/font van en <html>, no en <body>: el bloque @theme
  // de Tailwind las resuelve desde :root, y si solo existen en body quedan
  // inválidas ahí arriba y todas las utilidades de fuente caen al sistema.
  return (
    <html
      lang="es"
      className={`${display.variable} ${sans.variable}`}
      style={variablesDeFondos() as React.CSSProperties}
    >
      <body>{children}</body>
    </html>
  );
}
