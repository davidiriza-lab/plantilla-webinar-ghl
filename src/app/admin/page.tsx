import type { Metadata } from 'next';
import { haySesion } from '@/lib/auth';
import { leerConfig, CAMPOS, type ConfigWebinar } from '@/lib/config';
import { revisarSalud } from '@/lib/salud';
import {
  parsearDia,
  parsearHora,
  parsearZona,
  parsearBooleano,
  parsearEntero,
  parsearFecha,
  parsearModo,
} from '@/lib/parseo';
import { calcularOcurrencia, fraseFecha } from '@/lib/schedule';
import { MARCA } from '@/contenido/marca';
import Login from './Login';
import Panel from './Panel';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Panel · ${MARCA.webinar}`,
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Normaliza lo que venga de GHL a la forma que entienden los menús del panel.
 *
 * Si alguien escribió "jueves" o "8 pm" directo en GoHighLevel, el menú debe
 * mostrarlo bien seleccionado en vez de quedarse en blanco — y al guardar,
 * queda escrito ya en la forma canónica.
 */
function paraLosMenus(config: ConfigWebinar): ConfigWebinar {
  return {
    ...config,
    modo: parsearModo(config.modo),
    fechaUnica: parsearFecha(config.fechaUnica),
    diaSemana: String(parsearDia(config.diaSemana)),
    hora: parsearHora(config.hora),
    zonaHoraria: parsearZona(config.zonaHoraria),
    duracionMinutos: String(parsearEntero(config.duracionMinutos, 90, 5, 600)),
    activo: parsearBooleano(config.activo) ? 'si' : 'no',
  };
}

export default async function Admin() {
  if (!(await haySesion())) {
    return <Login />;
  }

  // Al abrir el panel se trae lo que haya en GHL, por si el dueño editó allá
  // directo. Es el momento natural para reconciliar: aquí sí se puede esperar.
  // El resultado se le muestra al dueño — así se ve roto el mismo día que se
  // rompe, no cinco días después como pasó con el VERCEL_API_TOKEN revocado.
  const salud = await revisarSalud();

  const crudo = await leerConfig();
  const config = paraLosMenus(crudo);

  const ocurrencia = calcularOcurrencia({
    modo: parsearModo(config.modo),
    fechaUnica: config.fechaUnica,
    diaSemana: config.diaSemana,
    hora: config.hora,
    zonaHoraria: config.zonaHoraria,
    duracionMinutos: Number(config.duracionMinutos),
  });

  // Qué campos venían con algo raro escrito desde GHL: se le avisa al dueño.
  const corregidos = CAMPOS.filter(
    (c) => crudo[c.clave] !== config[c.clave],
  ).map((c) => ({ etiqueta: c.etiqueta, tenia: crudo[c.clave] }));

  return (
    <Panel
      config={config}
      campos={[...CAMPOS]}
      corregidos={corregidos}
      resumen={{
        frase: fraseFecha(ocurrencia),
        proxima: ocurrencia.fechaLegible,
        enVivo: ocurrencia.estado === 'en_vivo',
        pasado: ocurrencia.estado === 'pasado',
        salud,
      }}
    />
  );
}
