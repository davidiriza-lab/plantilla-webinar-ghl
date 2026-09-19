/**
 * Red hacia GHL: límite de tiempo y un solo reintento.
 *
 * Vive aparte de `ghl.ts` (que es `server-only`) para poder probarse con un
 * servidor local sin levantar Next.
 */
/** Errores de GHL que vale la pena reintentar: el servidor falló o nos frenó. */
const ESTADOS_TRANSITORIOS = new Set([408, 425, 429, 500, 502, 503, 504]);
export const TIMEOUT_MS = 8_000;
const ESPERA_REINTENTO_MS = 500;

/**
 * `fetch` hacia GHL con límite de tiempo y un solo reintento.
 *
 * GHL responde normalmente en menos de un segundo. Si a los 8 s no contestó,
 * algo anda mal y esperar más solo cuelga al visitante (y Vercel corta la
 * función). Se reintenta UNA vez y solo ante fallos transitorios — timeout o
 * 5xx/429 —, nunca ante 4xx de datos o de token, porque repetir no los arregla.
 */
export async function fetchGhl(url: string, init: RequestInit = {}): Promise<Response> {
  let ultimo: unknown;
  for (let intento = 0; intento < 2; intento++) {
    if (intento > 0) await new Promise((r) => setTimeout(r, ESPERA_REINTENTO_MS));
    try {
      const res = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!ESTADOS_TRANSITORIOS.has(res.status)) return res;
      ultimo = new Error(`GHL respondió ${res.status}`);
    } catch (error) {
      ultimo = error;
    }
  }
  throw ultimo instanceof Error ? ultimo : new Error(String(ultimo));
}

