import type { Metadata } from 'next';
import { leerConfig, aPublica } from '@/lib/config';
import { calcularOcurrencia } from '@/lib/schedule';
import Contador from '@/components/Contador';
import PixelMeta from '@/components/PixelMeta';
import VideoBienvenida from '@/components/VideoBienvenida';
import BotonCalendario from '@/components/BotonCalendario';
import Marca from '@/components/Marca';
import { MARCA } from '@/contenido/marca';
import { GRACIAS } from '@/contenido/landing';

export const revalidate = 60;

export const metadata: Metadata = {
  title: `Ya casi | ${MARCA.webinar}`,
  robots: { index: false, follow: false },
};

/** Solo el primer nombre, limpio, para el saludo. */
function primerNombre(valor: string | undefined): string {
  if (!valor) return '';
  const limpio = valor
    .replace(/[<>{}[\]\\/|]/g, '')
    .trim()
    .split(/\s+/)[0]
    .slice(0, 24);
  if (!limpio) return '';
  return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
}

export default async function Gracias({
  searchParams,
}: {
  searchParams: Promise<{ n?: string }>;
}) {
  const [config, params] = await Promise.all([
    leerConfig().then(aPublica),
    searchParams,
  ]);

  const o = calcularOcurrencia(config);
  const nombre = primerNombre(params.n);

  // El grupo de WhatsApp solo se anuncia si hay enlace. El de calendario
  // siempre se puede: la página genera su propio evento.
  const hayGrupo = Boolean(config.enlaceGrupoWhatsapp);
  const totalPasos = hayGrupo ? 2 : 1;

  return (
    <>
      <PixelMeta pixelId={config.pixelFacebook} />

      <main className="min-h-dvh bg-fondo fondo-hero px-6 py-16 text-center max-sm:px-5 max-sm:py-12">
        <div className="contenedor max-w-[820px]">
          <Marca className="mx-auto mb-9 w-[240px] max-w-full" />

          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-acento-claro">
            {GRACIAS.etiqueta}
          </p>

          <h1 className="titulo mb-4 text-[40px] text-crema max-sm:text-[28px]">
            {nombre ? `${nombre}, ${GRACIAS.titulo}` : GRACIAS.titulo.charAt(0).toUpperCase() + GRACIAS.titulo.slice(1)}{' '}
            <span className="text-acento">
              Te {totalPasos === 1 ? 'falta 1 paso' : 'faltan 2 pasos'}.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-[560px] text-[17px] text-texto-tenue">
            Asegura tu lugar del <strong>{o.fechaCorta}</strong> completando lo
            de abajo. Toma menos de un minuto.
          </p>

          <VideoBienvenida url={config.videoGracias} />

          <div className="mb-12 space-y-5 text-left">
            {hayGrupo && (
              <section className="panel/70 px-8 py-7 max-sm:px-5">
                <div className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.22em] text-acento-claro">
                  Paso 1 de {totalPasos}
                </div>
                <h2 className="titulo mb-2.5 text-[24px] text-crema max-sm:text-[20px]">
                  {GRACIAS.grupo.titulo}
                </h2>
                <p className="mb-6 text-[15px] text-texto-tenue">{GRACIAS.grupo.texto}</p>
                <a
                  href={config.enlaceGrupoWhatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="boton-acento mx-auto max-w-[420px]"
                >
                  <span className="inline-flex items-center justify-center gap-2.5">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 shrink-0"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
                    </svg>
                    {GRACIAS.grupo.boton}
                  </span>
                </a>
              </section>
            )}

            <section className="panel/70 px-8 py-7 max-sm:px-5">
              <div className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.22em] text-acento-claro">
                Paso {totalPasos} de {totalPasos}
              </div>
              <h2 className="titulo mb-2.5 text-[24px] text-crema max-sm:text-[20px]">
                Agenda el {o.fechaCorta} en tu calendario
              </h2>
              <p className="mb-6 text-[15px] text-texto-tenue">
                Bloquea las {o.horaLegible} ({o.etiquetaZona}). {GRACIAS.calendario.texto}
              </p>
              <BotonCalendario
                inicioMs={o.inicioMs}
                finMs={o.finMs}
                titulo={config.tituloWebinar}
                enlaceIngreso={config.enlaceIngreso}
              />
            </section>
          </div>

          {/* Cuándo es */}
          <div className="panel px-8 py-8 max-sm:px-5">
            <div className="mb-2 text-[11.5px] uppercase tracking-[0.22em] text-acento">
              La clase empieza en
            </div>
            <div className="mb-7 font-display text-[22px] text-crema">
              {o.fechaLegible}, {o.horaLegible} ({o.etiquetaZona})
            </div>

            <Contador
              inicioMs={o.inicioMs}
              finMs={o.finMs}
              enlaceIngreso={config.enlaceIngreso}
              seRepite={o.modo === 'recurrente'}
            />
          </div>

          <p className="mx-auto mt-9 max-w-[560px] text-[15px] text-texto-tenue">
            Dura {config.duracionMinutos} minutos. {GRACIAS.puntualidad}
          </p>

          {config.enlaceSoporte && (
            <p className="mt-9 text-xs text-texto-tenue">
              ¿No te llegó nada?{' '}
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
    </>
  );
}
