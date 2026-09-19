/**
 * API de Conversiones de Meta.
 *
 * El pixel del navegador se pierde por bloqueadores y por iOS, así que el
 * registro también se manda desde el servidor. Los dos eventos comparten
 * `event_id` para que Meta los una y no cuente doble.
 *
 * Si no hay pixel o token configurados, no hace nada — no es un error.
 */
import 'server-only';

const VERSION = 'v21.0';

async function sha256(valor: string): Promise<string> {
  const datos = new TextEncoder().encode(valor.trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface EventoRegistro {
  pixelId: string;
  token: string;
  /**
   * Nombre del evento en Meta. `Lead` SOLO para el registro: es lo que la
   * campaña optimiza y reporta. La puerta manda `Asistio` (evento propio, no
   * cuenta como lead); la compra manda `Purchase` desde el webhook.
   */
  nombreEvento?: 'Lead' | 'Asistio';
  testCode?: string;
  eventId: string;
  email: string;
  telefono: string;
  nombre: string;
  urlOrigen: string;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
}

/**
 * Manda un evento `Lead`. Devuelve true si Meta lo aceptó.
 * Nunca lanza: un fallo de atribución no debe tumbar un registro.
 */
export async function enviarLead(evento: EventoRegistro): Promise<boolean> {
  if (!evento.pixelId || !evento.token) return false;

  try {
    const [em, ph, fn] = await Promise.all([
      sha256(evento.email),
      sha256(evento.telefono.replace(/\D/g, '')),
      sha256(evento.nombre.split(' ')[0] ?? ''),
    ]);

    const userData: Record<string, unknown> = { em: [em], ph: [ph], fn: [fn] };
    if (evento.ip) userData.client_ip_address = evento.ip;
    if (evento.userAgent) userData.client_user_agent = evento.userAgent;
    if (evento.fbp) userData.fbp = evento.fbp;
    if (evento.fbc) userData.fbc = evento.fbc;

    const cuerpo: Record<string, unknown> = {
      data: [
        {
          event_name: evento.nombreEvento ?? 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id: evento.eventId,
          event_source_url: evento.urlOrigen,
          action_source: 'website',
          user_data: userData,
        },
      ],
    };
    if (evento.testCode) cuerpo.test_event_code = evento.testCode;

    const res = await fetch(
      `https://graph.facebook.com/${VERSION}/${evento.pixelId}/events?access_token=${encodeURIComponent(evento.token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
        cache: 'no-store',
      },
    );

    if (!res.ok) {
      console.error('CAPI rechazó el evento:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('CAPI falló:', error);
    return false;
  }
}

export interface EventoCompra {
  pixelId: string;
  token: string;
  eventId: string;
  email: string;
  telefono: string;
  nombre: string;
  valor: number;
  moneda: string;
}

/**
 * Manda un evento `Purchase` desde el webhook de pago. Sin datos del
 * navegador (ip, fbp): la compra ocurre en Mercado Pago, no en el sitio.
 * Meta la casa con el Lead por email y teléfono. Nunca lanza.
 */
export async function enviarCompra(evento: EventoCompra): Promise<boolean> {
  if (!evento.pixelId || !evento.token) return false;
  try {
    const [em, ph, fn] = await Promise.all([
      sha256(evento.email),
      sha256(evento.telefono.replace(/\D/g, '')),
      sha256(evento.nombre.split(' ')[0] ?? ''),
    ]);
    const cuerpo = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: evento.eventId,
          action_source: 'website',
          user_data: { em: [em], ph: [ph], fn: [fn] },
          custom_data: { value: evento.valor, currency: evento.moneda },
        },
      ],
    };
    const res = await fetch(
      `https://graph.facebook.com/${VERSION}/${evento.pixelId}/events?access_token=${encodeURIComponent(evento.token)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo), cache: 'no-store' },
    );
    if (!res.ok) {
      console.error('CAPI Purchase rechazado:', res.status, (await res.text()).slice(0, 200));
      return false;
    }
    return true;
  } catch (error) {
    console.error('CAPI Purchase falló:', error);
    return false;
  }
}
