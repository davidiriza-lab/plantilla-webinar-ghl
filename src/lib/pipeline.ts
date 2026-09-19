/**
 * El pipeline de Oportunidades en GHL ("Webinars") y a qué etapa manda cada
 * formulario.
 *
 * Los IDs ya no viven en el código: se resuelven por NOMBRE contra la
 * sub-cuenta (una lectura, cacheada 10 min), o se fijan por variables de
 * entorno si el dueño prefiere. Así la misma plantilla sirve en cualquier
 * sub-cuenta que tenga un pipeline con estas etapas.
 *
 * Nombres esperados (se comparan sin acentos ni mayúsculas):
 *   pipeline: "Webinars"                        → GHL_PIPELINE_NOMBRE
 *   etapas:   "Nuevo Registro", "Asistió al Webinar",
 *             "Cliente Potencial", "Cliente Ganado"
 * Variables opcionales que mandan sobre la detección:
 *   GHL_PIPELINE_ID, GHL_ETAPA_REGISTRO, GHL_ETAPA_ASISTIO,
 *   GHL_ETAPA_POTENCIAL, GHL_ETAPA_GANADO
 */
import 'server-only';
import type { TipoFormulario } from './etiquetas';
import { listarPipelines } from './ghl';

export type Etapa = 'registro' | 'asistio' | 'potencial' | 'ganado';

export interface Etapas {
  pipelineId: string;
  etapas: Record<Etapa, string>;
}

const NOMBRE_PIPELINE = process.env.GHL_PIPELINE_NOMBRE || 'Webinars';
const NOMBRES: Record<Etapa, string[]> = {
  registro: ['nuevo registro', 'registro'],
  asistio: ['asistio al webinar', 'asistio', 'ingreso'],
  potencial: ['cliente potencial', 'potencial', 'carrito'],
  ganado: ['cliente ganado', 'ganado', 'pago'],
};

const normalizar = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** A qué etapa manda cada formulario. */
const ETAPA_DE: Record<TipoFormulario, Etapa> = {
  registro: 'registro',
  ingreso: 'asistio',
  interesado: 'potencial',
  oferta: 'potencial',
};

export function etapaDe(tipo: TipoFormulario): Etapa {
  return ETAPA_DE[tipo];
}

function desdeEntorno(): Etapas | null {
  const e = process.env;
  if (
    e.GHL_PIPELINE_ID &&
    e.GHL_ETAPA_REGISTRO &&
    e.GHL_ETAPA_ASISTIO &&
    e.GHL_ETAPA_POTENCIAL &&
    e.GHL_ETAPA_GANADO
  ) {
    return {
      pipelineId: e.GHL_PIPELINE_ID,
      etapas: {
        registro: e.GHL_ETAPA_REGISTRO,
        asistio: e.GHL_ETAPA_ASISTIO,
        potencial: e.GHL_ETAPA_POTENCIAL,
        ganado: e.GHL_ETAPA_GANADO,
      },
    };
  }
  return null;
}

let cache: { valor: Etapas; venceMs: number } | null = null;
const CACHE_MS = 10 * 60 * 1000;

/**
 * Resuelve el pipeline y sus etapas. Devuelve null si no se pudo (GHL no
 * respondió o no existe un pipeline con esas etapas): en ese caso el que
 * llama no mueve la oportunidad y lo deja escrito en los logs.
 */
export async function resolverEtapas(): Promise<Etapas | null> {
  const fijo = desdeEntorno();
  if (fijo) return fijo;

  if (cache && cache.venceMs > Date.now()) return cache.valor;

  const pipelines = await listarPipelines();
  if (!pipelines) return null;

  const objetivo = normalizar(NOMBRE_PIPELINE);
  const pipeline =
    pipelines.find((p) => normalizar(p.name) === objetivo) ??
    pipelines.find((p) => normalizar(p.name).includes(objetivo));
  if (!pipeline) {
    console.error(`[pipeline] No existe un pipeline llamado "${NOMBRE_PIPELINE}" en la sub-cuenta.`);
    return null;
  }

  const buscar = (clave: Etapa): string | undefined => {
    for (const candidato of NOMBRES[clave]) {
      const exacta = pipeline.stages.find((s) => normalizar(s.name) === candidato);
      if (exacta) return exacta.id;
    }
    for (const candidato of NOMBRES[clave]) {
      const parcial = pipeline.stages.find((s) => normalizar(s.name).includes(candidato));
      if (parcial) return parcial.id;
    }
    return undefined;
  };

  const etapas = {
    registro: buscar('registro'),
    asistio: buscar('asistio'),
    potencial: buscar('potencial'),
    ganado: buscar('ganado'),
  };
  const faltan = (Object.keys(etapas) as Etapa[]).filter((k) => !etapas[k]);
  if (faltan.length > 0) {
    console.error(
      `[pipeline] Al pipeline "${pipeline.name}" le faltan etapas: ${faltan.join(', ')}. Tiene: ${pipeline.stages.map((s) => s.name).join(' | ')}`,
    );
    return null;
  }

  const valor: Etapas = { pipelineId: pipeline.id, etapas: etapas as Record<Etapa, string> };
  cache = { valor, venceMs: Date.now() + CACHE_MS };
  return valor;
}
