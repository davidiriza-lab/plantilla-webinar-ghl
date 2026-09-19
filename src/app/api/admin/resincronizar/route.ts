/**
 * POST /api/admin/resincronizar — reescribe la copia que lee la web, tomando
 * como verdad lo que haya en GoHighLevel.
 *
 * No toca GHL. Va en una sola dirección a propósito: GHL manda, la copia
 * obedece. Un botón que escribiera "solo en la web" tendría que inventarse una
 * segunda fuente de verdad, y bastaría con que alguien lo usara una vez para
 * que la página anunciara una fecha y los correos otra — sin que nada fallara
 * a la vista. Esto solo puede reparar desincronización, nunca causarla.
 *
 * Es la salida manual para cuando alguien edita un custom value directo en la
 * interfaz de GHL, o cuando la copia se quedó atrás por lo que sea.
 */
import { NextResponse } from 'next/server';
import { reconciliarDesdeGhl } from '@/lib/config';
import { haySesion } from '@/lib/auth';
import { revalidateTag } from 'next/cache';
import { CONFIG_CACHE_TAG } from '@/lib/ghl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  if (!(await haySesion())) {
    return NextResponse.json({ ok: false, error: 'Sin sesión.' }, { status: 401 });
  }

  // `fresco` evita el caché de 60 s de Next: si alguien acaba de editar en la
  // interfaz de GHL, quiere ver su cambio ahora, no dentro de un minuto.
  let resultado;
  try {
    resultado = await reconciliarDesdeGhl({ fresco: true, porId: true });
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ ok: false, error: detalle }, { status: 502 });
  }

  revalidateTag(CONFIG_CACHE_TAG, { expire: 0 });

  switch (resultado.estado) {
    case 'ok':
      return NextResponse.json({ ok: true, mensaje: 'La web ya muestra lo que hay en GoHighLevel.' });
    case 'sin-cambios':
      return NextResponse.json({ ok: true, mensaje: 'Ya estaban sincronizados: no había nada que cambiar.' });
    case 'ghl-no-respondio':
      return NextResponse.json(
        { ok: false, error: 'GoHighLevel no respondió. La web sigue con la última copia buena.' },
        { status: 502 },
      );
    case 'sin-credenciales':
      return NextResponse.json(
        { ok: false, error: 'No hay copia configurada: falta VERCEL_API_TOKEN en el proyecto.' },
        { status: 500 },
      );
    case 'error':
      return NextResponse.json(
        { ok: false, error: `No se pudo escribir la copia: ${resultado.detalle}` },
        { status: 502 },
      );
  }
}
