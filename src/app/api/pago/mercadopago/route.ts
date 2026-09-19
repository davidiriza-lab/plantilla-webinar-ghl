/**
 * POST /api/pago/mercadopago — el aviso de pago de Mercado Pago.
 *
 * Cuando alguien paga en el link de Mercado Pago, MP avisa aquí. Se valida
 * la firma, se consulta el pago por id (nunca se confía en el cuerpo del
 * aviso), y si está aprobado:
 *   1. el contacto queda en GHL con las etiquetas de pago,
 *   2. su oportunidad pasa a "Cliente Ganado" con el monto,
 *   3. se manda un Purchase a Meta por CAPI para que el anuncio se acredite.
 *
 * Configuración (variables de entorno):
 *   MP_ACCESS_TOKEN     credencial de producción de la app de MP (APP_USR-...)
 *   MP_WEBHOOK_SECRET   la clave que MP genera al guardar el webhook
 * Alta en MP: Tus integraciones → la app → Webhooks → URL de este endpoint,
 * evento "Pagos". Sin las dos variables, responde 503 y no procesa nada.
 *
 * Es idempotente: MP reintenta los avisos y repetirlo no duplica nada.
 */
import { NextResponse } from 'next/server';
import { MARCA } from '@/contenido/marca';
import {
  MercadoPagoConfig,
  Payment,
  WebhookSignatureValidator,
  InvalidWebhookSignatureError,
} from 'mercadopago';
import { upsertContacto, upsertOportunidad } from '@/lib/ghl';
import { resolverEtapas } from '@/lib/pipeline';
import { leerConfigSegura, aPublica } from '@/lib/config';
import { calcularOcurrencia } from '@/lib/schedule';
import { enviarCompra } from '@/lib/capi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ETIQUETA_PAGO = 'pago webinar';

export async function POST(request: Request): Promise<NextResponse> {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!accessToken || !secret) {
    console.error('[mercadopago] Faltan MP_ACCESS_TOKEN y/o MP_WEBHOOK_SECRET.');
    return NextResponse.json({ ok: false, error: 'Webhook no configurado.' }, { status: 503 });
  }

  // El id del pago viene en la query (data.id) y también en el cuerpo.
  const url = new URL(request.url);
  let cuerpo: { type?: string; action?: string; data?: { id?: string | number } } = {};
  try {
    cuerpo = (await request.json()) as typeof cuerpo;
  } catch {
    // Algunos avisos llegan sin cuerpo JSON; la query basta.
  }
  const dataId = String(url.searchParams.get('data.id') ?? cuerpo.data?.id ?? '');
  const tipo = url.searchParams.get('type') ?? cuerpo.type ?? '';

  try {
    WebhookSignatureValidator.validate({
      xSignature: request.headers.get('x-signature'),
      xRequestId: request.headers.get('x-request-id'),
      dataId,
      secret,
    });
  } catch (error) {
    const motivo = error instanceof InvalidWebhookSignatureError ? error.reason : 'desconocido';
    console.error('[mercadopago] Firma inválida:', motivo);
    return NextResponse.json({ ok: false, error: 'Firma inválida.' }, { status: 401 });
  }

  // Solo pagos. Otros temas (merchant_order, etc.) se aceptan y se ignoran.
  if (tipo !== 'payment' || !dataId) {
    return NextResponse.json({ ok: true, ignorado: true });
  }

  // El estado real se consulta a MP: el aviso solo dice "algo cambió".
  let pago;
  try {
    pago = await new Payment(new MercadoPagoConfig({ accessToken })).get({ id: dataId });
  } catch (error) {
    console.error('[mercadopago] No se pudo leer el pago', dataId, error);
    return NextResponse.json({ ok: false, error: 'No se pudo leer el pago.' }, { status: 502 });
  }

  if (pago.status !== 'approved') {
    return NextResponse.json({ ok: true, estado: pago.status });
  }

  const email = (pago.payer?.email ?? '').trim().toLowerCase();
  if (!email) {
    console.error('[mercadopago] Pago aprobado sin email de pagador:', dataId);
    return NextResponse.json({ ok: true, sinEmail: true });
  }
  const nombre = [pago.payer?.first_name, pago.payer?.last_name].filter(Boolean).join(' ').trim();
  const telefono = [pago.payer?.phone?.area_code, pago.payer?.phone?.number]
    .filter(Boolean)
    .join('');
  const monto = Number(pago.transaction_amount ?? 0);
  const moneda = pago.currency_id ?? 'MXN';

  // Etiquetas: la general y la de la clase vigente.
  const { config: crudo } = await leerConfigSegura();
  const config = aPublica(crudo);
  const o = calcularOcurrencia(config);
  const etiquetas = [ETIQUETA_PAGO, o.etiquetaFecha ? `pago ${o.etiquetaFecha}` : ''].filter(Boolean);

  // 1. Contacto (crea o actualiza por email) con las etiquetas de pago.
  let contacto;
  try {
    contacto = await upsertContacto({
      nombre: nombre || email.split('@')[0],
      email,
      telefono,
      fuente: 'Mercado Pago',
      etiquetas,
    });
  } catch (error) {
    console.error('[mercadopago] Falló el alta en GHL del pago', dataId, error);
    // 502 para que MP reintente más tarde: el pago es real y no debe perderse.
    return NextResponse.json({ ok: false, error: 'GHL no respondió.' }, { status: 502 });
  }

  // 2. Oportunidad → Cliente Ganado, con el monto.
  const mapa = await resolverEtapas();
  if (mapa) {
    await upsertOportunidad(
      contacto.id,
      mapa.pipelineId,
      mapa.etapas.ganado,
      `${nombre || email} — ${MARCA.producto}`,
      { status: 'won', monetaryValue: monto },
    );
  } else {
    console.error('[mercadopago] Sin pipeline resuelto: el pago quedó solo como etiqueta.');
  }

  // 3. Purchase a Meta. El event_id fijo por pago hace que los reintentos no dupliquen.
  await enviarCompra({
    pixelId: config.pixelFacebook,
    token: crudo.tokenFacebook,
    eventId: `mp-${dataId}`,
    email,
    telefono,
    nombre,
    valor: monto,
    moneda,
  });

  console.log(`[mercadopago] Pago ${dataId} aprobado: ${email} ${monto} ${moneda}`);
  return NextResponse.json({ ok: true, contacto: contacto.id });
}

/** MP a veces hace GET para probar la URL al darla de alta. */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ ok: true, mensaje: 'Webhook de Mercado Pago listo. Usa POST.' });
}
