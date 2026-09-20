/**
 * Prefija una ruta absoluta del sitio con el basePath (si lo hay).
 *
 * Next lo hace solo para <Link> y router.push, pero NO para fetch(),
 * <a href>, ni el src de next/image. Usa `ruta('/api/registro')` siempre que
 * escribas una ruta que empiece con "/". Con BASE_PATH vacío no cambia nada.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/**
 * La URL absoluta de la puerta (/ingreso), para lo que sale del sitio: el
 * evento de calendario y los correos. Gana la que el dueño cargó en el panel;
 * si no, se arma con el dominio de `marca.ts`. Nunca es el Zoom directo:
 * entrar por /ingreso es lo que pasa lista y dispara la oferta.
 */
export function urlPuerta(enlacePuerta: string, sitio: string): string {
  return enlacePuerta || `${sitio.replace(/\/$/, '')}${BASE_PATH}/ingreso`;
}

export function ruta(absoluta: string): string {
  if (!absoluta.startsWith('/')) return absoluta;
  return `${BASE_PATH}${absoluta}`;
}
