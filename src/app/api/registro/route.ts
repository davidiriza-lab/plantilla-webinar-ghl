/**
 * POST /api/registro — el único camino por el que entra un prospecto.
 *
 * GHL es la base de datos, así que su escritura se espera y, si falla,
 * el registro falla. La atribución de Meta va después y en paralelo:
 * si se cae, el prospecto ya quedó guardado.
 */
import { NextResponse, after } from 'next/server';
import { MARCA } from '@/contenido/marca';
import { upsertContacto, upsertOportunidad, aE164 } from '@/lib/ghl';
import { resolverEtapas, etapaDe } from '@/lib/pipeline';
import {
  leerConfigSegura,
  aPublica,
  guardarDerivados,
  reconciliarDesdeGhl,
} from '@/lib/config';
import { etiquetasDe, esTipoValido, type TipoFormulario } from '@/lib/etiquetas';
import { guardarIdentidad } from '@/lib/identidad';
import { evaluarPuerta } from '@/lib/puerta';
import { revalidateTag } from 'next/cache';
import { CONFIG_CACHE_TAG } from '@/lib/ghl';
import { calcularOcurrencia } from '@/lib/schedule';
import { enviarLead } from '@/lib/capi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Utm {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  fbclid?: string;
}

interface Cuerpo {
  tipo?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  utm?: Utm;
  fbp?: string;
  fbc?: string;
  urlOrigen?: string;
}

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Los valores de UTM a veces llegan como `{{campaign.name}}` sin resolver.
 * Guardar eso ensucia los reportes, así que se descarta.
 */
function limpiarUtm(valor: string | undefined): string {
  const v = (valor ?? '').trim();
  if (!v || v.includes('{{') || v.includes('}}')) return '';
  return v.slice(0, 120);
}

function describirFuente(utm: Utm | undefined): string {
  if (!utm) return 'Landing webinar';
  const partes = [
    limpiarUtm(utm.source),
    limpiarUtm(utm.medium),
    limpiarUtm(utm.campaign),
  ].filter(Boolean);
  return partes.length ? partes.join(' · ') : 'Landing webinar';
}

export async function POST(request: Request): Promise<NextResponse> {
  let cuerpo: Cuerpo;
  try {
    cuerpo = (await request.json()) as Cuerpo;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'No pudimos leer los datos.' },
      { status: 400 },
    );
  }

  const nombre = (cuerpo.nombre ?? '').trim().slice(0, 120);
  const email = (cuerpo.email ?? '').trim().toLowerCase().slice(0, 160);
  const telefono = (cuerpo.telefono ?? '').trim().slice(0, 40);

  if (!EMAIL_VALIDO.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'Revisa tu correo, parece que tiene un error.' },
      { status: 400 },
    );
  }

  const tipo: TipoFormulario = esTipoValido(cuerpo.tipo) ? cuerpo.tipo : 'registro';

  // El WhatsApp solo se pide al registrarse. En la puerta de la sala y en la
  // página de interés se pide lo mínimo, para no estorbar.
  const e164 = aE164(telefono, process.env.LADA_POR_DEFECTO ?? '52');
  if (tipo === 'registro' && e164.replace(/\D/g, '').length < 10) {
    return NextResponse.json(
      { ok: false, error: 'Escribe tu WhatsApp con lada, por favor.' },
      { status: 400 },
    );
  }

  const fuente = describirFuente(cuerpo.utm);

  // La fecha a la que se está apuntando, ya resuelta. Se guarda en el contacto
  // para que los correos de GHL la nombren sin tener que calcularla, y para que
  // siga siendo correcta aunque la clase recurrente ya se haya recorrido.
  let config;
  let fechaClase = '';
  let etiquetas: string[] = [];
  let enlaceIngreso = '';

  try {
    const { config: crudo, degradado } = await leerConfigSegura();
    config = aPublica(crudo);
    const o = calcularOcurrencia(config);
    fechaClase = o.fechaLegible;
    etiquetas = etiquetasDe(tipo, config.etiquetas, o.etiquetaFecha);
    enlaceIngreso = config.enlaceIngreso;

    // La puerta también se comprueba aquí, no solo en la página: nadie debería
    // sacar el enlace de acceso llamando a la API antes de tiempo.
    if (tipo === 'ingreso') {
      const puerta = evaluarPuerta({
        inicioMs: o.inicioMs,
        finMs: o.finMs,
        antelacionMinutos: config.antelacionMinutos,
        mando: config.puerta,
        degradado,
      });
      if (puerta.estado !== 'abierta') {
        return NextResponse.json(
          { ok: false, error: 'La sala todavía no abre.' },
          { status: 409 },
        );
      }
    }
  } catch (error) {
    console.error('No se pudo resolver la configuración:', error);
  }

  // 1. GHL.
  //
  // Al registrarse y al mostrar interés, GHL es la base de datos: si la
  // escritura falla, no hay registro y se le dice a la persona.
  //
  // En la puerta de la sala **no**. Ahí el dato de asistencia es valioso pero
  // no vale el precio de dejar a alguien fuera de una clase a la que llegó a
  // tiempo. Se intenta, se registra el fallo, y se le deja pasar igual.
  let contacto;
  try {
    contacto = await upsertContacto({
      nombre: nombre || email.split('@')[0],
      email,
      telefono: e164,
      fuente,
      fechaClase,
      etiquetas,
    });
  } catch (error) {
    console.error(`Falló el alta en GHL (tipo=${tipo}):`, error);

    if (tipo !== 'ingreso') {
      return NextResponse.json(
        {
          ok: false,
          error: 'No pudimos guardar tu registro. Inténtalo en un momento.',
        },
        { status: 502 },
      );
    }

    // Queda constancia en los registros del servidor para poder pasar lista
    // a mano después.
    console.warn(
      `[asistencia-sin-guardar] ${new Date().toISOString()} ${email} ${nombre}`,
    );
    const respuestaSinGhl = NextResponse.json({
      ok: true,
      eventId: '',
      enlaceIngreso,
    });
    // Sigue siendo alguien real que tecleó su correo, aunque GHL haya fallado.
    guardarIdentidad(respuestaSinGhl, { nombre, email, telefono: e164 });
    return respuestaSinGhl;
  }

  // 2. La oportunidad en el pipeline "Webinars", para que el dueño lo vea en
  // el panel sin tener que leer etiquetas. No bloquea: el contacto y la
  // etiqueta ya quedaron, que es lo que no se puede perder.
  // `after` en vez de `void`: en serverless la invocación puede congelarse en
  // cuanto se manda la respuesta, y una promesa suelta se queda a medias. Fue
  // exactamente lo que pasó — el contacto y las etiquetas entraban, la
  // oportunidad no. `after` mantiene viva la función hasta que termina.
  after(() =>
    (async () => {
      const mapa = await resolverEtapas();
      if (!mapa) {
        console.error('[registro] Sin pipeline resuelto: no se movió la oportunidad.');
        return;
      }
      await upsertOportunidad(
        contacto.id,
        mapa.pipelineId,
        mapa.etapas[etapaDe(tipo)],
        `${nombre || email} — ${MARCA.producto}`,
      );
    })(),
  );

  // 3. Mantener al día la fecha calculada que viven en GHL, sin cron: cuando
  // la clase recurrente se recorre, el primer registro de la semana la corrige.
  // Solo escribe si cambió.
  if (config) {
    const o = calcularOcurrencia(config);
    after(async () => {
      try {
        const cambio = await guardarDerivados({
          fechaLegible: o.fechaLegible,
          fechaCorta: o.fechaCorta,
          horaConZona: `${o.horaLegible} (${o.etiquetaZona})`,
        });
        if (cambio) revalidateTag(CONFIG_CACHE_TAG, { expire: 0 });
        // Y de paso, si alguien editó en GHL directo, se sube a la copia.
        await reconciliarDesdeGhl();
      } catch (error) {
        console.error('No se pudo refrescar la fecha en GHL:', error);
      }
    });
  }

  // 4. Meta. No bloquea la respuesta, pero sí se garantiza que corra: con una
  // promesa suelta el evento de CAPI se perdía en cuanto la función respondía,
  // y la atribución del lado servidor —la que recupera lo que el navegador no
  // manda— nunca llegaba a Meta.
  // Cada formulario manda UN evento distinto, o ninguno: antes todos mandaban
  // `Lead` y Meta contaba a quien entraba a la sala o llegaba al carrito como
  // un lead más (4,000 "leads" contra 2,900 personas reales).
  const nombreEvento =
    tipo === 'registro' ? 'Lead' : tipo === 'ingreso' ? 'Asistio' : null;
  const eventId = crypto.randomUUID();
  if (nombreEvento) after(async () => {
    try {
      const conSecretos = (await leerConfigSegura()).config;
      if (!conSecretos.pixelFacebook || !conSecretos.tokenFacebook) return;

      const cabeceras = request.headers;
      await enviarLead({
        nombreEvento,
        pixelId: conSecretos.pixelFacebook,
        token: conSecretos.tokenFacebook,
        eventId,
        email,
        telefono: e164,
        nombre: nombre || 'sin nombre',
        urlOrigen: cuerpo.urlOrigen ?? '',
        ip:
          cabeceras.get('x-forwarded-for')?.split(',')[0].trim() ?? undefined,
        userAgent: cabeceras.get('user-agent') ?? undefined,
        fbp: cuerpo.fbp || undefined,
        fbc: cuerpo.fbc || undefined,
      });
    } catch (error) {
      console.error('Falló la atribución de Meta:', error);
    }
  });

  // El enlace de acceso solo se devuelve en la puerta, y solo si abrió.
  const respuesta = NextResponse.json({
    ok: true,
    eventId,
    ...(tipo === 'ingreso' ? { enlaceIngreso } : {}),
  });

  // Al registrarse o entrar a la sala queda constancia de quién es, para que
  // /oferta no le vuelva a preguntar el correo — solo en estos dos momentos,
  // que son donde se sabe con certeza (en "interesado" y "oferta" también hay
  // correo, pero son formularios de paso, no vale la pena fijar identidad ahí).
  if (tipo === 'registro' || tipo === 'ingreso') {
    guardarIdentidad(respuesta, { nombre, email, telefono: e164 });
  }

  return respuesta;
}
