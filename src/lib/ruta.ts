/**
 * Prefija una ruta absoluta del sitio con el basePath (si lo hay).
 *
 * Next lo hace solo para <Link> y router.push, pero NO para fetch(),
 * <a href>, ni el src de next/image. Usa `ruta('/api/registro')` siempre que
 * escribas una ruta que empiece con "/". Con BASE_PATH vacío no cambia nada.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function ruta(absoluta: string): string {
  if (!absoluta.startsWith('/')) return absoluta;
  return `${BASE_PATH}${absoluta}`;
}
