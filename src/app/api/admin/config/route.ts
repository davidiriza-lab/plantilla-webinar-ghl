/**
 * PUT /api/admin/config — guarda los cambios del panel en los custom values
 * de GHL e invalida la caché para que la landing los tome de inmediato.
 */
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { haySesion } from '@/lib/auth';
import {
  guardarConfig,
  guardarDerivados,
  leerConfig,
  aPublica,
  CAMPOS,
  type ConfigWebinar,
} from '@/lib/config';
import { calcularOcurrencia } from '@/lib/schedule';
import { CONFIG_CACHE_TAG } from '@/lib/ghl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CLAVES = new Set(CAMPOS.map((c) => c.clave));

export async function PUT(request: Request): Promise<NextResponse> {
  if (!(await haySesion())) {
    return NextResponse.json({ ok: false, error: 'Sin sesión.' }, { status: 401 });
  }

  let entrada: Record<string, unknown>;
  try {
    entrada = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'No pudimos leer los cambios.' },
      { status: 400 },
    );
  }

  // Solo se aceptan las claves declaradas: nada de escribir custom values sueltos.
  const cambios: Partial<ConfigWebinar> = {};
  for (const [clave, valor] of Object.entries(entrada)) {
    if (!CLAVES.has(clave as keyof ConfigWebinar)) continue;
    if (typeof valor !== 'string') continue;
    cambios[clave as keyof ConfigWebinar] = valor.slice(0, 2000);
  }

  if (Object.keys(cambios).length === 0) {
    return NextResponse.json(
      { ok: false, error: 'No llegó ningún cambio válido.' },
      { status: 400 },
    );
  }

  let resultado;
  try {
    resultado = await guardarConfig(cambios);
  } catch (error) {
    console.error('Falló el guardado en GHL:', error);
    const detalle = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ ok: false, error: detalle }, { status: 502 });
  }

  // El guardado en GHL (lo que importa para los workflows) ya está hecho.
  // `avisoCopia` es aparte: dice si la copia que lee la web público se
  // actualizó también, para no repetir el bug de 5 días donde el panel decía
  // "guardado" mientras la web seguía sirviendo datos viejos en silencio.
  let avisoCopia: string | undefined;
  if (resultado.estado === 'error') {
    avisoCopia = `Se guardó en GoHighLevel, pero la copia que lee la web no se pudo actualizar (${resultado.detalle}). La web puede seguir mostrando datos viejos hasta que esto se corrija.`;
  } else if (resultado.estado === 'sin-credenciales') {
    avisoCopia =
      'Se guardó en GoHighLevel. No hay copia de seguridad configurada — la web depende de que GHL responda en cada visita.';
  } else if (resultado.estado === 'ghl-no-respondio') {
    avisoCopia = 'Se guardó en GoHighLevel, pero no se pudo releer para confirmar ni refrescar la copia.';
  }

  // Deja escrita en GHL la fecha ya calculada, para los correos masivos.
  // Si falla no se tumba el guardado: lo importante ya quedó.
  try {
    // Se calcula sobre lo que `guardarConfig` acaba de reconciliar, no sobre
    // una relectura: dentro de esta misma petición cualquier lectura cacheada
    // devolvería la configuración de antes del guardado, y los derivados
    // quedarían anunciando la fecha anterior.
    const config = aPublica(resultado.config ?? (await leerConfig()));
    const o = calcularOcurrencia(config);
    await guardarDerivados(
      {
        fechaLegible: o.fechaLegible,
        fechaCorta: o.fechaCorta,
        horaConZona: `${o.horaLegible} (${o.etiquetaZona})`,
      },
      { fresco: true },
    );
    revalidateTag(CONFIG_CACHE_TAG, { expire: 0 });
  } catch (error) {
    console.error('No se pudieron escribir los campos derivados:', error);
  }

  return NextResponse.json({ ok: true, avisoCopia });
}
