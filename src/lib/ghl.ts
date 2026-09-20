/**
 * Cliente de GoHighLevel.
 *
 * GHL es la única base de datos del proyecto:
 *  - los prospectos son contactos de la location;
 *  - la configuración del webinar vive en los "custom values" de la location,
 *    los mismos que leen los workflows de correo y las páginas del embudo.
 *
 * Todo lo de aquí corre solo en el servidor. El PIT nunca sale al navegador.
 */
import 'server-only';
import { fetchGhl } from './red';

const BASE_URL = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';

/** Etiqueta de caché para invalidar la config cuando el admin la guarda. */
export const CONFIG_CACHE_TAG = 'ghl-config';

export interface CustomValue {
  id: string;
  name: string;
  fieldKey: string;
  value?: string | null;
}

function credentials(): { token: string; locationId: string } {
  const token = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    throw new Error(
      'Faltan GHL_API_KEY y/o GHL_LOCATION_ID en las variables de entorno.',
    );
  }
  return { token, locationId };
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Version: API_VERSION,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

/** `{{ custom_values.enlace_de_la_oferta }}` → `enlace_de_la_oferta` */
function slugOf(fieldKey: string): string {
  return fieldKey.replace(/[{}\s]/g, '').replace(/^custom_values\./, '');
}

/**
 * Trae todos los custom values de la location, indexados por su slug.
 * Se cachea 60 s y se invalida con revalidateTag(CONFIG_CACHE_TAG) al guardar.
 */
export async function fetchCustomValues(
  opciones?: { fresco?: boolean },
): Promise<Map<string, CustomValue>> {
  const { token, locationId } = credentials();
  // `revalidateTag` no afecta a los fetch de la MISMA petición: invalida para
  // las siguientes. Así que después de escribir hay que pedir sin caché de
  // forma explícita, o la relectura trae el estado anterior al guardado.
  const res = await fetchGhl(`${BASE_URL}/locations/${locationId}/customValues`, {
    headers: headers(token),
    ...(opciones?.fresco
      ? { cache: 'no-store' as const }
      : { next: { revalidate: 60, tags: [CONFIG_CACHE_TAG] } }),
  });

  if (!res.ok) {
    throw new Error(`GHL customValues devolvió ${res.status}`);
  }

  const data = (await res.json()) as { customValues?: CustomValue[] };
  const index = new Map<string, CustomValue>();
  for (const cv of data.customValues ?? []) {
    index.set(slugOf(cv.fieldKey), cv);
  }
  return index;
}

/**
 * Reemplaza los valores del índice por los que devuelve el GET **por id**.
 *
 * El listado `/customValues` de GHL sirve una vista que se queda atrás después
 * de escribir: medido el 1-sep-2026, seguía devolviendo el valor anterior más
 * de 85 s después de un PUT que el GET por id ya reflejaba. No es caché de CDN
 * (`cf-cache-status: DYNAMIC`, y un cache-buster no cambia nada) ni de Next:
 * es del propio GHL.
 *
 * El listado sí es fiable para descubrir qué campos existen y con qué id, así
 * que se usa para eso y los valores se piden uno por uno. Solo vale la pena en
 * acciones manuales de reparación, no en el camino normal de lectura.
 */
export async function refrescarValoresPorId(
  index: Map<string, CustomValue>,
): Promise<Map<string, CustomValue>> {
  const { token, locationId } = credentials();

  await Promise.all(
    [...index.entries()].map(async ([slug, cv]) => {
      if (!cv.id) return;
      try {
        const res = await fetchGhl(
          `${BASE_URL}/locations/${locationId}/customValues/${cv.id}`,
          { headers: headers(token), cache: 'no-store' },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { customValue?: CustomValue };
        if (data.customValue) index.set(slug, data.customValue);
      } catch {
        // Si uno falla se queda con el valor del listado: peor es no traer nada.
      }
    }),
  );

  return index;
}

/**
 * Escribe un custom value. Si el campo aún no existe en la location, lo crea.
 * Devuelve el slug con el que quedó guardado.
 */
export async function writeCustomValue(
  name: string,
  slug: string,
  value: string,
  index: Map<string, CustomValue>,
): Promise<void> {
  const { token, locationId } = credentials();
  const existing = index.get(slug);

  const url = existing
    ? `${BASE_URL}/locations/${locationId}/customValues/${existing.id}`
    : `${BASE_URL}/locations/${locationId}/customValues`;

  const res = await fetchGhl(url, {
    method: existing ? 'PUT' : 'POST',
    headers: headers(token),
    body: JSON.stringify({ name: existing?.name ?? name, value }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(
      `No se pudo guardar "${name}" (${res.status}): ${detail.slice(0, 200)}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Contactos
// ---------------------------------------------------------------------------

export interface RegistroEntrante {
  nombre: string;
  email: string;
  telefono: string;
  fuente?: string;
  /**
   * La fecha concreta de la clase a la que se apuntó, ya en texto
   * ("jueves 20 de agosto"). Se guarda en el contacto para que los correos y
   * los recordatorios de GHL puedan nombrarla sin tener que calcularla.
   */
  fechaClase?: string;
  /**
   * El mismo día en formato fecha ("2026-08-20"), para el custom field de tipo
   * fecha al que apuntan las esperas de los workflows de recordatorios.
   */
  diaClase?: string;
  /** Las etiquetas a poner: la general y la de la fecha. */
  etiquetas?: string[];
}

export interface ContactoGHL {
  id: string;
  esNuevo: boolean;
}

/**
 * Pasa un teléfono a E.164. GHL rechaza o duplica contactos si le llegan
 * formatos locales, así que esto no es opcional.
 */
export function aE164(raw: string, ladaPorDefecto = '52'): string {
  const limpio = raw.trim();
  if (limpio.startsWith('+')) return '+' + limpio.slice(1).replace(/\D/g, '');

  const digitos = limpio.replace(/\D/g, '');
  if (!digitos) return '';
  // 10 dígitos = número nacional sin lada de país.
  if (digitos.length === 10) return `+${ladaPorDefecto}${digitos}`;
  // Mexicanos viejos con el 1 después del 52.
  if (digitos.length === 13 && digitos.startsWith('521')) {
    return `+52${digitos.slice(3)}`;
  }
  return `+${digitos}`;
}

/**
 * Crea o actualiza el contacto en GHL. Es upsert: si el correo ya existe,
 * GHL devuelve el mismo contacto en vez de duplicarlo.
 */
export async function upsertContacto(
  datos: RegistroEntrante,
): Promise<ContactoGHL> {
  const { token, locationId } = credentials();

  const cuerpo: Record<string, unknown> = {
    locationId,
    name: datos.nombre,
    email: datos.email.trim().toLowerCase(),
    phone: aE164(datos.telefono, process.env.LADA_POR_DEFECTO ?? '52'),
    source: datos.fuente ?? 'Landing webinar',
  };

  const campos: Array<{ id: string; value: string }> = [];

  const campoFuente = process.env.GHL_CAMPO_FUENTE_ID;
  if (campoFuente && datos.fuente) {
    campos.push({ id: campoFuente, value: datos.fuente });
  }

  const campoFecha = process.env.GHL_CAMPO_FECHA_CLASE_ID;
  if (campoFecha && datos.fechaClase) {
    campos.push({ id: campoFecha, value: datos.fechaClase });
  }

  const campoDia = process.env.GHL_CAMPO_DIA_CLASE_ID;
  if (campoDia && datos.diaClase) {
    campos.push({ id: campoDia, value: datos.diaClase });
  }

  if (campos.length > 0) cuerpo.customFields = campos;

  const res = await fetchGhl(`${BASE_URL}/contacts/upsert`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(cuerpo),
    cache: 'no-store',
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`GHL upsert falló (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    contact?: { id: string };
    new?: boolean;
  };

  if (!data.contact?.id) {
    throw new Error('GHL upsert no devolvió el id del contacto.');
  }

  const contacto = { id: data.contact.id, esNuevo: data.new ?? false };

  // Las etiquetas van aparte, a propósito: el upsert de GHL **reemplaza** el
  // arreglo `tags` en vez de sumarlo, así que mandarlas ahí le borraría a quien
  // ya se había registrado su etiqueta de registro al entrar a la sala.
  if (datos.etiquetas?.length) {
    await agregarEtiquetas(contacto.id, datos.etiquetas);
  }

  return contacto;
}

/**
 * Suma etiquetas a un contacto y **garantiza que el disparador vuelva a correr**.
 *
 * GHL ignora una etiqueta que el contacto ya tiene: la respuesta trae
 * `tagsAdded: []` y el trigger "se agregó la etiqueta" no se dispara. En un
 * webinar semanal eso significa que quien se registra por segunda vez no recibe
 * confirmación, ni recordatorios, ni vuelve a caer en el Google Sheet.
 *
 * Por eso, si la etiqueta ya estaba, se quita y se vuelve a poner. Solo pasa
 * con los repetidores: para alguien nuevo es una sola llamada.
 *
 * No lanza: la etiqueta importa para las automatizaciones, pero perderla no
 * debe costarle a la persona su lugar en el webinar.
 */
export async function agregarEtiquetas(
  contactId: string,
  etiquetas: string[],
): Promise<boolean> {
  const { token } = credentials();

  const poner = async (tags: string[]): Promise<string[] | null> => {
    const res = await fetchGhl(`${BASE_URL}/contacts/${contactId}/tags`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ tags }),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error(
        `No se pudieron poner las etiquetas (${res.status}):`,
        (await res.text()).slice(0, 200),
      );
      return null;
    }
    const data = (await res.json()) as { tagsAdded?: string[] };
    return data.tagsAdded ?? [];
  };

  try {
    const puestas = await poner(etiquetas);
    if (puestas === null) return false;

    // Las que no se pusieron es porque ya estaban. Se recicla solo esas.
    const yaEstaban = etiquetas.filter(
      (t) => !puestas.some((p) => p.toLowerCase() === t.toLowerCase()),
    );
    if (yaEstaban.length === 0) return true;

    const res = await fetchGhl(`${BASE_URL}/contacts/${contactId}/tags`, {
      method: 'DELETE',
      headers: headers(token),
      body: JSON.stringify({ tags: yaEstaban }),
      cache: 'no-store',
    });
    if (!res.ok) {
      // No se pudo quitar: la etiqueta sigue ahí, solo no se redisparó.
      console.error(`No se pudo reciclar la etiqueta (${res.status}).`);
      return true;
    }

    const revueltas = await poner(yaEstaban);
    if (revueltas === null) {
      console.error(
        `[etiqueta-perdida] ${contactId} quedó sin: ${yaEstaban.join(', ')}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('Falló el alta de etiquetas:', error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Oportunidades
// ---------------------------------------------------------------------------

/**
 * Pone (o mueve) al contacto en el pipeline de Webinars.
 *
 * Las etiquetas ya cuentan la historia para las automatizaciones; esto es
 * para que el dueño la *vea* en el panel de Oportunidades sin tener que leer
 * etiquetas. Es upsert de GHL: si el contacto ya tiene una oportunidad en
 * este pipeline, la mueve de etapa; si no, crea una.
 *
 * No lanza — si falla, el registro ya quedó guardado (contacto + etiqueta),
 * que es lo que de verdad no puede perderse.
 */
export async function upsertOportunidad(
  contactId: string,
  pipelineId: string,
  pipelineStageId: string,
  nombreOportunidad: string,
  extra?: { status?: 'open' | 'won'; monetaryValue?: number },
): Promise<void> {
  const { token, locationId } = credentials();

  try {
    const res = await fetchGhl(`${BASE_URL}/opportunities/upsert`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({
        locationId,
        contactId,
        pipelineId,
        pipelineStageId,
        name: nombreOportunidad,
        status: extra?.status ?? 'open',
        ...(extra?.monetaryValue ? { monetaryValue: extra.monetaryValue } : {}),
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(
        `No se pudo mover la oportunidad (${res.status}):`,
        (await res.text()).slice(0, 200),
      );
    }
  } catch (error) {
    console.error('Falló el upsert de oportunidad:', error);
  }
}

// ─── Pipelines ───────────────────────────────────────────────────────────────

export interface PipelineGhl {
  id: string;
  name: string;
  stages: Array<{ id: string; name: string }>;
}

/** Lista los pipelines de la sub-cuenta con sus etapas, o null si GHL no respondió. */
export async function listarPipelines(): Promise<PipelineGhl[] | null> {
  const { token, locationId } = credentials();
  try {
    const res = await fetchGhl(
      `${BASE_URL}/opportunities/pipelines?locationId=${locationId}`,
      { headers: headers(token), cache: 'no-store' },
    );
    if (!res.ok) {
      console.error(`GHL pipelines devolvió ${res.status}`);
      return null;
    }
    const data = (await res.json()) as { pipelines?: PipelineGhl[] };
    return data.pipelines ?? [];
  } catch (error) {
    console.error('No se pudieron listar los pipelines:', error);
    return null;
  }
}

// ─── Respaldo ────────────────────────────────────────────────────────────────

export interface ContactoGhl {
  id: string;
  firstName?: string;
  lastName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  dateAdded?: string;
  tags?: string[];
  customFields?: Array<{ id: string; value?: unknown }>;
}

/**
 * Todos los contactos que llevan una etiqueta, página por página (500 por
 * página, que es el tope de GHL). Para el respaldo: no se usa en ninguna
 * ruta pública.
 */
export async function listarContactosPorEtiqueta(
  etiqueta: string,
  maxPaginas = 40,
): Promise<ContactoGhl[]> {
  const { token, locationId } = credentials();
  const todos: ContactoGhl[] = [];
  let searchAfter: unknown = undefined;

  for (let pagina = 0; pagina < maxPaginas; pagina++) {
    const cuerpo: Record<string, unknown> = {
      locationId,
      pageLimit: 500,
      // GHL guarda las etiquetas en minúsculas y el filtro distingue mayúsculas.
      filters: [{ field: 'tags', operator: 'contains', value: etiqueta.trim().toLowerCase() }],
      sort: [{ field: 'dateAdded', direction: 'asc' }],
    };
    if (searchAfter) cuerpo.searchAfter = searchAfter;

    const res = await fetchGhl(`${BASE_URL}/contacts/search`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(cuerpo),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`GHL contacts/search devolvió ${res.status}`);

    const data = (await res.json()) as {
      contacts?: Array<ContactoGhl & { searchAfter?: unknown }>;
    };
    const lote = data.contacts ?? [];
    todos.push(...lote);
    if (lote.length < 500) break;
    searchAfter = lote[lote.length - 1]?.searchAfter;
    if (!searchAfter) break;
  }
  return todos;
}
