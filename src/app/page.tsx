import Image from 'next/image';
import { leerConfig, aPublica } from '@/lib/config';
import { calcularOcurrencia, fraseFecha } from '@/lib/schedule';
import { MARCA } from '@/contenido/marca';
import { LANDING } from '@/contenido/landing';
import Contador from '@/components/Contador';
import Carrusel from '@/components/Carrusel';
import FormularioRegistro from '@/components/FormularioRegistro';
import PixelMeta from '@/components/PixelMeta';
import PlaceholderImagen from '@/components/PlaceholderImagen';
import Marca from '@/components/Marca';
import Negritas from '@/components/Negritas';
import Icono from '@/components/Icono';
import { ruta } from '@/lib/ruta';

// La config se relee cada minuto: lo que se cambia en /admin se ve solo.
export const revalidate = 60;

const L = LANDING;

export default async function Landing() {
  const config = aPublica(await leerConfig());
  const ocurrencia = calcularOcurrencia(config);
  const frase = fraseFecha(ocurrencia);
  // Una fecha única que ya pasó cierra el registro sola: no tiene caso
  // seguir apuntando gente a una clase que ya se dio.
  const registroAbierto = config.activo && ocurrencia.estado !== 'pasado';

  return (
    <>
      <PixelMeta pixelId={config.pixelFacebook} />

      {/* ── Barra superior ─────────────────────────────────────────── */}
      <div className="border-b border-linea bg-superficie px-5 py-3.5 text-center text-[13px] font-semibold tracking-wide text-acento-claro">
        {L.franja} · {frase}
      </div>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        id="registro"
        className="fondo-hero scroll-mt-4 px-6 pb-22 pt-14 max-sm:px-5 max-sm:pb-16 max-sm:pt-10"
      >
        <div className="contenedor">
          <div className="grid items-center gap-14 md:grid-cols-2">
            <div>
              <Marca className="mb-10 w-[300px] max-w-full max-sm:mb-7 max-sm:w-[220px]" />
              <h1 className="titulo mb-5.5 text-[47px] text-crema max-sm:text-[33px]">
                {L.hero.titulo}
              </h1>
              <p className="max-w-[540px] text-[17px] max-sm:text-base">
                <Negritas texto={L.hero.subtitulo} />
              </p>
            </div>

            <FormularioRegistro
              activo={registroAbierto}
              frase={`Se transmite en vivo el ${ocurrencia.fechaCorta}.`}
            />
          </div>
        </div>
      </section>

      {/* ── Intro: lo que dicen, y su respuesta ────────────────────── */}
      <section className="px-6 py-22 text-center max-sm:px-5 max-sm:py-15">
        <div className="contenedor">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-acento-claro">
            {L.intro.etiqueta}
          </p>

          <blockquote className="mx-auto mb-14 max-w-[760px] border-l-2 border-acento/40 pl-7 text-left text-[19px] italic leading-relaxed text-texto max-sm:pl-5 max-sm:text-[17px]">
            &ldquo;{L.intro.cita}&rdquo;
          </blockquote>

          <h2 className="titulo mx-auto mb-5 max-w-[880px] text-[38px] text-crema max-sm:text-[29px]">
            {L.intro.titulo} <span className="text-acento">{L.intro.tituloAcento}</span>
          </h2>

          <p className="mx-auto mb-6 max-w-[660px] text-[17px] text-texto-tenue">
            {L.intro.parrafo}
          </p>

          <p className="font-display text-[27px] italic leading-tight text-acento max-sm:text-[22px]">
            {L.intro.remate}
          </p>
        </div>
      </section>

      {/* ── Los 3 secretos ─────────────────────────────────────────── */}
      <section className="fondo-profundo border-y border-linea px-6 py-22 text-center max-sm:px-5 max-sm:py-15">
        <div className="contenedor">
          <p className="mb-4.5 text-xs font-bold uppercase tracking-[0.24em] text-acento-claro">
            {L.secretos.etiqueta}
          </p>
          <h2 className="titulo mb-3.5 text-4xl text-crema max-sm:text-[28px]">
            {L.secretos.titulo}
          </h2>
          <p className="mx-auto mb-14 max-w-[640px] text-texto-tenue">
            {L.secretos.subtitulo}
          </p>

          <div className="grid gap-7 md:grid-cols-3">
            {L.secretos.lista.map((s) => (
              <article key={s.numero} className="panel relative overflow-hidden p-8 text-left max-sm:p-6">
                {/* El punto de luz de las tarjetas del kit. */}
                <span
                  aria-hidden
                  className="absolute right-6 top-6 size-2 rounded-full bg-acento shadow-[0_0_18px_rgba(56,130,246,0.8)]"
                />
                {s.imagen ? (
                  // Icono 3D generado: flota sobre un halo azul, sin caja.
                  <div className="relative mb-6 flex h-[168px] items-center justify-center max-sm:h-[140px]">
                    <span
                      aria-hidden
                      className="absolute size-[190px] rounded-full bg-[radial-gradient(circle,rgba(56,130,246,0.30)_0%,rgba(56,130,246,0)_68%)]"
                    />
                    <Image
                      src={ruta(s.imagen)}
                      alt=""
                      width={512}
                      height={512}
                      className="relative h-full w-auto drop-shadow-[0_18px_30px_rgba(3,10,28,0.55)]"
                    />
                  </div>
                ) : (
                  <div className="mb-7 flex size-14 items-center justify-center rounded-2xl border border-acento/35 bg-acento/10 text-acento">
                    <Icono nombre={s.icono} className="size-7" />
                  </div>
                )}
                <span className="mb-3 block text-[11.5px] font-bold uppercase tracking-[0.22em] text-acento-claro">
                  {s.numero}
                </span>
                <h3 className="titulo mb-3 text-[22px] leading-[1.2] text-crema">{s.titulo}</h3>
                <p className="text-[15px] leading-relaxed text-texto-tenue">{s.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── El presentador ─────────────────────────────────────────── */}
      <section className="px-6 py-22 max-sm:px-5 max-sm:py-15">
        <div className="contenedor grid items-center gap-14 md:grid-cols-2">
          <div className="max-md:order-2">
            <h2 className="titulo text-[30px] uppercase tracking-wider text-crema">
              {L.presentador.etiqueta}
            </h2>
            <div className="mb-2.5 font-display text-[52px] font-bold italic leading-[1.05] text-acento max-sm:text-[38px]">
              {MARCA.presentador}
            </div>
            <p className="mb-6.5 text-[14.5px] font-semibold text-acento-claro">
              {MARCA.rol}
            </p>

            <ul className="space-y-3.5">
              {L.presentador.puntos.map((punto) => (
                <li key={punto} className="relative pl-6.5 text-[15.5px]">
                  <span className="absolute left-0 top-[11px] size-2.5 rounded-full bg-acento" />
                  {punto}
                </li>
              ))}
            </ul>
          </div>

          <div className="max-md:order-1">
            {MARCA.retrato ? (
              <Image
                src={ruta(MARCA.retrato)}
                alt={MARCA.presentador}
                width={1000}
                height={1250}
                className="rounded-xl shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
              />
            ) : (
              <PlaceholderImagen numero={4} descripcion={L.presentador.descripcionRetrato} />
            )}
          </div>
        </div>
      </section>

      {/* ── Detalles ───────────────────────────────────────────────── */}
      <section className="fondo-banda border-y border-linea px-6 py-22 text-center max-sm:px-5 max-sm:py-15">
        <div className="contenedor">
          <h2 className="titulo mb-12 text-4xl text-crema max-sm:text-[28px]">
            {L.detalles.titulo}
          </h2>
          <div className="grid gap-7 md:grid-cols-3">
            {[
              {
                etiqueta: 'Cuándo',
                valor: ocurrencia.fechaLegible,
                imagen: L.detalles.iconos.cuando,
                icono: (
                  <>
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                  </>
                ),
              },
              {
                etiqueta: 'A qué hora',
                valor: `${ocurrencia.horaLegible}\n${ocurrencia.etiquetaZona}`,
                imagen: L.detalles.iconos.hora,
                icono: (
                  <>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </>
                ),
              },
              {
                etiqueta: 'Dónde',
                valor: L.detalles.donde,
                imagen: L.detalles.iconos.donde,
                icono: (
                  <>
                    <rect x="3" y="4" width="18" height="13" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </>
                ),
              },
            ].map(({ etiqueta, valor, imagen, icono }) => (
              <div key={etiqueta} className="panel px-6 py-8.5">
                {imagen ? (
                  <div className="relative mx-auto mb-5 flex h-[112px] w-[112px] items-center justify-center">
                    <span
                      aria-hidden
                      className="absolute inset-[-24px] rounded-full bg-[radial-gradient(circle,rgba(56,130,246,0.28)_0%,rgba(56,130,246,0)_68%)]"
                    />
                    <Image
                      src={ruta(imagen)}
                      alt=""
                      width={384}
                      height={384}
                      className="relative h-full w-auto drop-shadow-[0_14px_24px_rgba(3,10,28,0.55)]"
                    />
                  </div>
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto mb-4 h-7 w-7 text-acento"
                  >
                    {icono}
                  </svg>
                )}
                <div className="mb-2.5 text-[11.5px] uppercase tracking-[0.22em] text-acento-claro">
                  {etiqueta}
                </div>
                <div className="whitespace-pre-line font-display text-[25px] leading-[1.25] text-crema">
                  {valor}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-[15px] text-texto-tenue">{L.detalles.nota}</p>
        </div>
      </section>

      {/* ── El método (con carrusel opcional) ──────────────────────── */}
      <section className="fondo-profundo border-y border-linea px-6 py-22 max-sm:px-5 max-sm:py-15">
        <div
          className={`contenedor grid items-center gap-14 ${
            L.metodo.carrusel.length > 0 ? 'md:grid-cols-2' : 'text-center'
          }`}
        >
          <div>
            <h2 className="titulo mb-5 text-[35px] text-crema max-sm:text-[28px]">
              {L.metodo.titulo}
              <br />
              <span className="text-acento">{L.metodo.tituloAcento}</span>
            </h2>
            <p className="mx-auto max-w-[60ch] text-texto-tenue">{L.metodo.parrafo}</p>
          </div>
          {L.metodo.carrusel.length > 0 && <Carrusel imagenes={L.metodo.carrusel} />}
        </div>
      </section>

      {/* ── Para quién es y para quién no ──────────────────────────── */}
      <section className="px-6 py-22 max-sm:px-5 max-sm:py-15">
        <div className="contenedor grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="titulo mb-7 text-[28px] text-crema max-sm:text-[24px]">
              {L.paraTi.titulo} <span className="text-acento">{L.paraTi.tituloAcento}</span> si:
            </h2>
            <ul className="space-y-3.5">
              {L.paraTi.lista.map((punto) => (
                <li
                  key={punto}
                  className="relative rounded-[10px] border border-linea bg-fondo/55 py-5 pl-14 pr-6 text-[15.5px]"
                >
                  <span className="absolute left-6 top-[18px] text-[17px] font-bold text-acento">
                    ✓
                  </span>
                  {punto}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-center font-display text-[22px] italic text-acento">
              {L.paraTi.cierre}
            </p>
          </div>

          <div>
            <h2 className="titulo mb-7 text-[28px] text-crema max-sm:text-[24px]">
              <span className="text-texto-tenue">No</span> es para ti si:
            </h2>
            <ul className="space-y-3.5">
              {L.noParaTi.lista.map((punto) => (
                <li
                  key={punto}
                  className="relative rounded-[10px] border border-linea/60 bg-fondo/30 py-5 pl-14 pr-6 text-[15.5px] text-texto-tenue"
                >
                  <span className="absolute left-6 top-[18px] text-[15px] font-bold text-texto-tenue">
                    ✕
                  </span>
                  {punto}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-center text-[13.5px] italic text-texto-tenue">
              {L.noParaTi.cierre}
            </p>
          </div>
        </div>
      </section>

      {/* ── Casos de éxito (opcional) ──────────────────────────────── */}
      {L.casos.lista.length > 0 && (
        <section className="px-6 py-22 text-center max-sm:px-5 max-sm:py-15">
          <div className="contenedor">
            <p className="mb-4.5 text-xs font-bold uppercase tracking-[0.24em] text-acento-claro">
              {L.casos.etiqueta}
            </p>
            <h2 className="titulo mb-3.5 text-4xl text-crema max-sm:text-[28px]">
              {L.casos.titulo}
            </h2>
            <p className="mx-auto mb-14 max-w-[620px] text-texto-tenue">{L.casos.subtitulo}</p>

            <div className="grid gap-6 md:grid-cols-3">
              {L.casos.lista.map((c) => (
                <article
                  key={c.quien}
                  className="overflow-hidden panel text-left"
                >
                  {c.video ? (
                    <video
                      src={ruta(c.video)}
                      poster={ruta(c.imagen)}
                      controls
                      playsInline
                      preload="none"
                      aria-label={`Testimonio de ${c.quien}`}
                      className="aspect-video w-full bg-fondo object-cover"
                    />
                  ) : (
                    <Image
                      src={ruta(c.imagen)}
                      alt={c.quien}
                      width={960}
                      height={540}
                      className="aspect-video w-full object-cover"
                    />
                  )}
                  <div className="px-5.5 pb-6.5 pt-5.5">
                    <blockquote className="mb-3.5 text-[14.5px] italic leading-relaxed">
                      &ldquo;{c.cita}&rdquo;
                    </blockquote>
                    <div className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-acento">
                      {c.quien}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Cierre: texto a la izquierda, la próxima clase como un panel ── */}
      <section className="fondo-vision border-t border-linea px-6 py-24 max-sm:px-5 max-sm:py-16">
        <div className="contenedor grid items-center gap-14 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-acento-claro">
              {L.franja}
            </p>
            <h2 className="titulo mb-6 max-w-[16ch] text-[52px] text-crema max-sm:text-[36px]">
              {L.cierre.titulo}
            </h2>
            <p className="mb-9 max-w-[46ch] text-[18px] leading-relaxed text-texto max-sm:text-[16px]">
              {L.cierre.parrafo} <span className="text-acento-claro">{L.cierre.parrafoAcento}</span>.
            </p>
            {registroAbierto && (
              <a href="#registro" className="boton-acento inline-block w-auto px-9 max-sm:w-full">
                {L.cierre.cta}
              </a>
            )}
          </div>

          <div className="panel p-8 max-sm:p-6">
            <p className="mb-1 text-[11.5px] font-bold uppercase tracking-[0.22em] text-acento-claro">
              {ocurrencia.estado === 'en_vivo' ? 'Estamos en vivo' : 'Próxima clase'}
            </p>
            <p className="titulo mb-1 text-[26px] text-crema max-sm:text-[22px]">
              {ocurrencia.fechaLegible}
            </p>
            <p className="mb-7 text-[15px] text-texto-tenue">
              {ocurrencia.horaLegible} · {ocurrencia.etiquetaZona} · {config.duracionMinutos} min
            </p>
            <div className="border-t border-linea pt-6">
              <Contador
                variante="linea"
                inicioMs={ocurrencia.inicioMs}
                finMs={ocurrencia.finMs}
                enlaceIngreso={config.enlaceIngreso}
                seRepite={ocurrencia.modo === 'recurrente'}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Pie ────────────────────────────────────────────────────── */}
      <footer className="border-t border-linea bg-fondo px-6 py-13 text-center">
        <p className="mx-auto mb-3.5 max-w-[900px] text-xs leading-[1.8] text-texto-tenue">
          © {new Date().getFullYear()} {MARCA.presentador} · {MARCA.rol}. {MARCA.avisoLegal}
        </p>
        {config.enlaceSoporte && (
          <p className="text-xs text-texto-tenue">
            ¿Dudas?{' '}
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
      </footer>
    </>
  );
}
