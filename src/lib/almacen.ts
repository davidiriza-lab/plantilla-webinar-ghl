/**
 * La copia de la configuración que sí leen las páginas.
 *
 * GoHighLevel sigue siendo el espejo — sus workflows leen los mismos custom
 * values de siempre — pero **ninguna página bloquea esperando a GHL**. Se lee
 * de Vercel Edge Config, que se resuelve en el edge sin salir a un tercero.
 *
 * El motivo no es la velocidad: es que cuando GHL no responde, la app antes
 * caía a los valores por defecto del código y anunciaba una fecha inventada
 * con total seguridad. Con la instantánea, anuncia la última configuración
 * buena que se conoció.
 *
 * Escribir sí requiere la API de Vercel. Si no está configurada, todo lo demás
 * sigue funcionando: simplemente no se refresca la copia.
 */
import 'server-only';
import { createClient } from '@vercel/edge-config';
import type { ConfigWebinar } from './config';

const CLAVE = 'configuracion';

export interface Instantanea {
  config: ConfigWebinar;
  /** Cuándo se guardó, en epoch ms. Solo informativo. */
  guardadaMs: number;
}

function clienteLectura() {
  const cadena = process.env.EDGE_CONFIG;
  if (!cadena) return null;
  try {
    return createClient(cadena);
  } catch {
    return null;
  }
}

/** La última configuración buena que se conoció, o null si nunca hubo una. */
export async function leerInstantanea(): Promise<Instantanea | null> {
  const cliente = clienteLectura();
  if (!cliente) return null;

  try {
    const valor = await cliente.get<Instantanea>(CLAVE);
    if (!valor || typeof valor !== 'object' || !valor.config) return null;
    return valor;
  } catch (error) {
    console.error('No se pudo leer la instantánea:', error);
    return null;
  }
}

interface CredencialesEscritura {
  token: string;
  edgeConfigId: string;
  teamId: string;
}

function credencialesEscritura(): CredencialesEscritura | null {
  const token = process.env.VERCEL_API_TOKEN;
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token || !edgeConfigId) return null;
  return { token, edgeConfigId, teamId: teamId ?? '' };
}

/**
 * Resultado de intentar guardar la instantánea. No es un booleano a propósito:
 * "sin-credenciales" (no configurado) y "error" (configurado pero falló, por
 * ejemplo un VERCEL_API_TOKEN revocado) deben distinguirse para poder avisar
 * de forma distinta — el primero es un estado válido, el segundo no.
 */
export type ResultadoEscritura =
  | { ok: true }
  | { ok: false; razon: 'sin-credenciales' }
  | { ok: false; razon: 'error'; detalle: string };

/** Guarda la instantánea. Ver `ResultadoEscritura` para los estados posibles. */
export async function guardarInstantanea(
  config: ConfigWebinar,
): Promise<ResultadoEscritura> {
  const cred = credencialesEscritura();
  if (!cred) return { ok: false, razon: 'sin-credenciales' };

  const contenido: Instantanea = { config, guardadaMs: Date.now() };
  const parametros = cred.teamId ? `?teamId=${cred.teamId}` : '';

  try {
    const res = await fetch(
      `https://api.vercel.com/v1/edge-config/${cred.edgeConfigId}/items${parametros}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${cred.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{ operation: 'upsert', key: CLAVE, value: contenido }],
        }),
        cache: 'no-store',
      },
    );

    if (!res.ok) {
      const detalle = `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`;
      console.error('No se pudo guardar la instantánea:', detalle);
      return { ok: false, razon: 'error', detalle };
    }
    return { ok: true };
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Falló el guardado de la instantánea:', error);
    return { ok: false, razon: 'error', detalle };
  }
}

/** true si la app puede refrescar la copia. Se muestra en el panel. */
export function puedeEscribirInstantanea(): boolean {
  return credencialesEscritura() !== null;
}
