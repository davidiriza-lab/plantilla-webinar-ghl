/**
 * Las imágenes de fondo del kit. Se inyectan como variables CSS desde
 * layout.tsx (así respetan el basePath); globals.css las usa con var().
 * Para cambiar un fondo, cambia aquí la ruta al archivo en /public.
 */
import { ruta } from './ruta';

export const FONDOS = {
  '--f-hero': '/assets/bgi/bg-hero-earth.webp',
  '--f-lado': '/assets/bgi/bg-earth-side.webp',
  '--f-estrellas': '/assets/bgi/bg-starfield.webp',
  '--f-orbitas': '/assets/bgi/orbital-lines-overlay.webp',
  '--f-profundo': '/assets/bgi/bg-deep-gradient.webp',
  '--f-nebulosa': '/assets/bgi/bg-nebula.webp',
} as const;

/** `{ '--f-hero': 'url(/assets/…)', … }` listo para `style` de <html>. */
export function variablesDeFondos(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(FONDOS).map(([k, v]) => [k, `url(${ruta(v)})`]),
  );
}
