import type { Metadata } from 'next';
import { leerConfigSegura, aPublica } from '@/lib/config';
import { calcularOcurrencia } from '@/lib/schedule';
import { evaluarPuerta } from '@/lib/puerta';
import { leerIdentidad } from '@/lib/identidad';
import PuertaSala from '@/components/PuertaSala';
import Marca from '@/components/Marca';
import { MARCA } from '@/contenido/marca';

/**
 * La página de acceso a la sala.
 *
 * **Nunca se cachea.** Un HTML guardado podría decir "todavía no abre" cuando
 * ya abrió, y eso deja a la gente fuera del webinar. Se sirve en cada visita y,
 * además, el navegador reevalúa la puerta cada segundo.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store';

export const metadata: Metadata = {
  title: `Entrar a la clase | ${MARCA.webinar}`,
  robots: { index: false, follow: false, nocache: true },
};

export default async function Ingreso() {
  const { config: crudo, degradado } = await leerConfigSegura();
  const config = aPublica(crudo);
  // Si ya la conocemos (se registró o entró desde este navegador), no se le
  // vuelve a pedir: llega con sus datos puestos y solo confirma.
  const identidad = await leerIdentidad();
  const o = calcularOcurrencia(config);

  const entrada = {
    inicioMs: o.inicioMs,
    finMs: o.finMs,
    antelacionMinutos: config.antelacionMinutos,
    mando: config.puerta,
    degradado,
  };

  // Se evalúa también aquí para dejar constancia en los registros del servidor
  // si la puerta se abrió por el camino de emergencia.
  const decision = evaluarPuerta(entrada);
  if (degradado) {
    console.warn('[ingreso] configuración degradada:', decision.motivo);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-fondo fondo-hero px-6 py-16 max-sm:px-5 max-sm:py-12">
      <div className="w-full max-w-[520px]">
        <Marca className="mx-auto mb-10 w-[230px] max-w-full" />

        <PuertaSala
          entrada={entrada}
          fechaLegible={o.fechaLegible}
          horaLegible={o.horaLegible}
          etiquetaZona={o.etiquetaZona}
          enlaceSoporte={config.enlaceSoporte}
          nombreInicial={identidad?.nombre ?? ''}
          emailInicial={identidad?.email ?? ''}
          telefonoInicial={identidad?.telefono ?? ''}
        />

        {config.enlaceSoporte && (
          <p className="mt-8 text-center text-xs text-texto-tenue">
            ¿Problemas para entrar?{' '}
            <a
              href={config.enlaceSoporte}
              target="_blank"
              rel="noopener noreferrer"
              className="text-acento underline-offset-2 hover:underline"
            >
              Escríbenos por WhatsApp
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
