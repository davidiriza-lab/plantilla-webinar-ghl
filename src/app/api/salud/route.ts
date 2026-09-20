/**
 * GET /api/salud — ¿el embudo puede recibir gente ahora mismo?
 *
 * Pública y sin secretos, pensada para un monitor externo (UptimeRobot,
 * Better Stack, etc.) que la pida cada pocos minutos y avise por correo
 * cuando deje de responder 200. Devuelve 503 con la lista de lo que falla.
 */
import { NextResponse } from 'next/server';
import { revisarSalud, type Salud } from '@/lib/salud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cada revisión lee GHL sin caché. La ruta es pública: sin memoria, un bucle
// contra ella se come el límite de la API de GHL y tumba los registros reales.
const VIGENCIA_MS = 60_000;
let ultima: { en: number; salud: Salud } | null = null;

export async function GET(): Promise<NextResponse> {
  const ahora = Date.now();
  if (!ultima || ahora - ultima.en > VIGENCIA_MS) {
    ultima = { en: ahora, salud: await revisarSalud() };
  }
  const { salud } = ultima;
  return NextResponse.json(salud, {
    status: salud.ok ? 200 : 503,
    headers: { 'Cache-Control': 'public, max-age=0, s-maxage=60' },
  });
}
