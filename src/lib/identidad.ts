/**
 * Quién es la persona que ya vimos antes, para no volver a preguntarle.
 *
 * Se guarda en una cookie al registrarse y al entrar a la sala — los dos
 * momentos en que se sabe con certeza el correo de alguien. `/oferta` la lee
 * para decidir si mostrar el botón de pago directo o pedir el correo primero.
 *
 * No es sesión ni autenticación: es solo "ya lo conocemos", 30 días, como el
 * resto de la atribución del sitio (UTM, fbclid).
 */
import 'server-only';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';

const CLAVE = 'identidad';
const DIAS = 30;

export interface Identidad {
  nombre: string;
  email: string;
  /** En E.164, si se conoce. */
  telefono?: string;
}

/** Escribe la cookie en una respuesta de API. */
export function guardarIdentidad(
  respuesta: NextResponse,
  identidad: Identidad,
): void {
  respuesta.cookies.set(CLAVE, JSON.stringify(identidad), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: DIAS * 24 * 60 * 60,
  });
}

/** La lee desde un Server Component (páginas, no API routes). */
export async function leerIdentidad(): Promise<Identidad | null> {
  const almacen = await cookies();
  const valor = almacen.get(CLAVE)?.value;
  if (!valor) return null;

  try {
    const datos = JSON.parse(valor) as Partial<Identidad>;
    if (!datos.email) return null;
    return {
      nombre: datos.nombre ?? '',
      email: datos.email,
      telefono: datos.telefono ?? '',
    };
  } catch {
    return null;
  }
}
