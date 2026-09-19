import { NextResponse } from 'next/server';
import { contrasenaCorrecta, abrirSesion, cerrarSesion } from '@/lib/auth';
import { bloqueoRestante, registrarFallo, registrarExito, ipDe } from '@/lib/intentos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Retraso fijo para que probar contraseñas a ciegas salga caro. */
const ESPERA_MS = 600;

export async function POST(request: Request): Promise<NextResponse> {
  const ip = ipDe(request);

  const restante = bloqueoRestante(ip);
  if (restante > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `Demasiados intentos. Espera ${Math.ceil(restante / 60)} minuto(s) y vuelve a probar.`,
      },
      { status: 429, headers: { 'Retry-After': String(restante) } },
    );
  }

  let contrasena = '';
  try {
    const cuerpo = (await request.json()) as { contrasena?: string };
    contrasena = cuerpo.contrasena ?? '';
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await new Promise((r) => setTimeout(r, ESPERA_MS));

  if (!contrasenaCorrecta(contrasena)) {
    registrarFallo(ip);
    return NextResponse.json(
      { ok: false, error: 'Contraseña incorrecta.' },
      { status: 401 },
    );
  }

  registrarExito(ip);
  await abrirSesion();
  return NextResponse.json({ ok: true });
}

export async function DELETE(): Promise<NextResponse> {
  await cerrarSesion();
  return NextResponse.json({ ok: true });
}
