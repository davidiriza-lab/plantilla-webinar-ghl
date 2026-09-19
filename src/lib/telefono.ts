/**
 * Ladas para el selector de país del teléfono.
 *
 * Sin esto, el formulario asumía que todo número de 10 dígitos era mexicano
 * (`LADA_POR_DEFECTO`). La lista de ladas es corta a propósito: pon primero el país de tu audiencia.
 * (lo dice su propio perfil) — un número español o colombiano de 10 dígitos
 * se normalizaba como si fuera de México. Ver `aE164` en `ghl.ts`: con el
 * código ya incluido en el valor (empieza con "+"), no tiene que adivinar.
 */
export const LADAS: ReadonlyArray<readonly [codigo: string, bandera: string, pais: string]> = [
  ['+52', '🇲🇽', 'México'],
  ['+34', '🇪🇸', 'España'],
  ['+57', '🇨🇴', 'Colombia'],
  ['+1', '🇺🇸', 'Estados Unidos'],
  ['+54', '🇦🇷', 'Argentina'],
  ['+56', '🇨🇱', 'Chile'],
  ['+51', '🇵🇪', 'Perú'],
] as const;

export const LADA_POR_DEFECTO = '+52';

/** Compone el valor que se manda al servidor: lada + solo dígitos. */
export function componerTelefono(lada: string, numero: string): string {
  return `${lada}${numero.replace(/\D/g, '')}`;
}
