/**
 * Sesión del panel de administración.
 *
 * Una sola contraseña, verificada del lado del servidor. La cookie no guarda
 * la contraseña: guarda un vencimiento firmado con HMAC, así que no se puede
 * fabricar desde el navegador.
 */
import 'server-only';
import { cookies } from 'next/headers';

const COOKIE = 'cg_admin';
const DURACION_MS = 12 * 60 * 60 * 1000; // 12 horas

function secreto(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 24) {
    throw new Error(
      'ADMIN_SESSION_SECRET falta o es muy corto (mínimo 24 caracteres).',
    );
  }
  return s;
}

async function firmar(mensaje: string): Promise<string> {
  const clave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secreto()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const firma = await crypto.subtle.sign(
    'HMAC',
    clave,
    new TextEncoder().encode(mensaje),
  );
  return Buffer.from(firma).toString('base64url');
}

/** Comparación en tiempo constante: no revela cuántos caracteres coinciden. */
function igualesSinFiltrar(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) {
    diferencia |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diferencia === 0;
}

export function contrasenaCorrecta(intento: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) throw new Error('ADMIN_PASSWORD no está configurada.');
  return igualesSinFiltrar(intento, real);
}

export async function abrirSesion(): Promise<void> {
  const vence = String(Date.now() + DURACION_MS);
  const valor = `${vence}.${await firmar(vence)}`;
  const almacen = await cookies();
  almacen.set(COOKIE, valor, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DURACION_MS / 1000,
  });
}

export async function cerrarSesion(): Promise<void> {
  const almacen = await cookies();
  almacen.delete(COOKIE);
}

export async function haySesion(): Promise<boolean> {
  const almacen = await cookies();
  const valor = almacen.get(COOKIE)?.value;
  if (!valor) return false;

  const [vence, firma] = valor.split('.');
  if (!vence || !firma) return false;
  if (!igualesSinFiltrar(firma, await firmar(vence))) return false;

  return Number(vence) > Date.now();
}
