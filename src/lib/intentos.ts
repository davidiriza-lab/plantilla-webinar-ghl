/**
 * Freno a la fuerza bruta en el login del panel.
 *
 * Cuenta fallos por IP en memoria: tras 5 fallos en 15 minutos, la IP queda
 * bloqueada 15 minutos. En serverless la memoria no es compartida entre
 * instancias, así que el freno no es perfecto — pero sumado a la espera fija
 * de 600 ms por intento y a la comparación en tiempo constante, adivinar
 * una contraseña decente deja de ser viable. Sin base de datos a propósito.
 */
const MAX_FALLOS = 5;
const VENTANA_MS = 15 * 60 * 1000;

interface Registro {
  fallos: number;
  primeroMs: number;
  bloqueadoHastaMs: number;
}

const porIp = new Map<string, Registro>();

function limpiar(ahora: number): void {
  for (const [ip, r] of porIp) {
    if (r.bloqueadoHastaMs < ahora && ahora - r.primeroMs > VENTANA_MS) porIp.delete(ip);
  }
}

/** Segundos que faltan para poder intentar, o 0 si puede. */
export function bloqueoRestante(ip: string, ahora = Date.now()): number {
  const r = porIp.get(ip);
  if (!r || r.bloqueadoHastaMs <= ahora) return 0;
  return Math.ceil((r.bloqueadoHastaMs - ahora) / 1000);
}

export function registrarFallo(ip: string, ahora = Date.now()): void {
  if (porIp.size > 5000) limpiar(ahora);
  const r = porIp.get(ip);
  if (!r || ahora - r.primeroMs > VENTANA_MS) {
    porIp.set(ip, { fallos: 1, primeroMs: ahora, bloqueadoHastaMs: 0 });
    return;
  }
  r.fallos++;
  if (r.fallos >= MAX_FALLOS) r.bloqueadoHastaMs = ahora + VENTANA_MS;
}

export function registrarExito(ip: string): void {
  porIp.delete(ip);
}

export function ipDe(request: Request): string {
  const xff = request.headers.get('x-forwarded-for') ?? '';
  return xff.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'desconocida';
}
