/**
 * Armar y leer enlaces de WhatsApp (wa.me).
 *
 * El panel guarda el enlace completo, que es lo que usan el sitio y los correos
 * de GoHighLevel. Pero nadie debería armar a mano algo como
 * `https://wa.me/5215512345678?text=Hola%2C%20tengo%20una%20duda`: aquí se
 * arma a partir de lada, número y mensaje, y se desarma para volver a editarlo.
 */
import { LADAS, LADA_POR_DEFECTO } from './telefono.ts';

/**
 * Mensajes con los que llega escrito el chat. El primero es el que se propone.
 * Cámbialos por los que le sirvan a tu negocio: son solo sugerencias del panel.
 */
export const MENSAJES_SOPORTE: readonly string[] = [
  'Hola, tengo una duda sobre la clase.',
  'Hola, me registré a la clase y no me llegó el correo.',
  'Hola, no puedo entrar a la sala.',
  'Hola, quiero saber más del programa.',
];

export interface PartesWa {
  lada: string;
  numero: string;
  mensaje: string;
}

/** `https://wa.me/<lada+número>?text=<mensaje>`, o '' si no hay número usable. */
export function armarEnlaceWa(lada: string, numero: string, mensaje: string): string {
  const pais = lada.replace(/\D/g, '');
  // Un 0 inicial es el prefijo de marcación local de muchos países: no va en
  // formato internacional.
  const local = numero.replace(/\D/g, '').replace(/^0+/, '');
  if (!pais || local.length < 6) return '';
  const texto = mensaje.trim();
  return `https://wa.me/${pais}${local}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;
}

/**
 * Desarma un enlace de WhatsApp a un número. Devuelve null si no lo es (por
 * ejemplo un enlace de grupo, o cualquier otra página): en ese caso el panel
 * deja editar el enlace tal cual.
 */
export function leerEnlaceWa(url: string): PartesWa | null {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase().replace(/^www\./, '');
  let digitos = '';
  if (host === 'wa.me') digitos = u.pathname.replace(/\D/g, '');
  else if (host === 'api.whatsapp.com' || host === 'web.whatsapp.com') {
    digitos = (u.searchParams.get('phone') ?? '').replace(/\D/g, '');
  } else return null;
  if (digitos.length < 8) return null;

  // La lada conocida más larga que encaje; si ninguna, se asume la de defecto
  // solo cuando el número empieza con ella.
  const conocidas = [...LADAS.map(([c]) => c.replace(/\D/g, ''))].sort((a, b) => b.length - a.length);
  const pais = conocidas.find((c) => digitos.startsWith(c) && digitos.length - c.length >= 6);
  if (!pais) return null;

  return {
    lada: `+${pais}`,
    numero: digitos.slice(pais.length),
    mensaje: u.searchParams.get('text') ?? '',
  };
}

export { LADA_POR_DEFECTO };
