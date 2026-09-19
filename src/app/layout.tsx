import type { Metadata, Viewport } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import { MARCA } from '@/contenido/marca';
import './globals.css';

// Dos tipografías para todo el embudo: una con carácter para los titulares y
// una limpia para el resto. Cámbialas aquí (next/font las descarga solas).
const display = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--fuente-display',
  display: 'swap',
});

const sans = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
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
    >
      <body>{children}</body>
    </html>
  );
}
