/**
 * GET /api/salud — ¿el embudo puede recibir gente ahora mismo?
 *
 * Pública y sin secretos, pensada para un monitor externo (UptimeRobot,
 * Better Stack, etc.) que la pida cada pocos minutos y avise por correo
 * cuando deje de responder 200. Devuelve 503 con la lista de lo que falla.
 */
import { NextResponse } from 'next/server';
import { revisarSalud } from '@/lib/salud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const salud = await revisarSalud();
  return NextResponse.json(salud, {
    status: salud.ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
