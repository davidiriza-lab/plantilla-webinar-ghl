import type { Metadata } from 'next';
import Image from 'next/image';
import { leerConfig, aPublica } from '@/lib/config';
import { MARCA } from '@/contenido/marca';
import { OFERTA } from '@/contenido/oferta';
import PixelMeta from '@/components/PixelMeta';
import FormularioInteres from '@/components/FormularioInteres';
import BotonCompra from '@/components/BotonCompra';
import PlaceholderImagen from '@/components/PlaceholderImagen';
import Marca from '@/components/Marca';
import { leerIdentidad } from '@/lib/identidad';

export const revalidate = 60;

const O = OFERTA;

export const metadata: Metadata = {
  title: O.seo.titulo,
  description: O.seo.descripcion,
  robots: { index: false, follow: false },
};

/** "$4,997 MXN". La moneda se toma del texto de pago si la mencionas; si no, MXN. */
const dinero = (n: number): string => `$${n.toLocaleString('en-US')} MXN`;
const conDias = (t: string): string => t.replaceAll('{dias}', String(O.garantia.dias));

export default async function Oferta() {
  const config = aPublica(await leerConfig());
  const precio = dinero(config.precio);
  const hayPago = Boolean(config.enlaceCheckout);

  // ¿Ya sabemos quién es? Se registró o entró a la sala en algún momento de
  // los últimos 30 días. Si no, nadie pasa sin llenar el formulario de la
  // sección de inversión — por eso todos los botones apuntan ahí (#inversion).
  const identidad = await leerIdentidad();

  const Comprar = ({ texto }: { texto: string }) => {
    if (!hayPago) {
      return (
        <div className="mx-auto max-w-[460px]">
          <span aria-disabled className="boton-acento block cursor-not-allowed opacity-50">
            {texto}
          </span>
          <p className="mt-2 text-center text-[11px] text-texto-tenue/70">
            Falta el enlace de pago en el panel
          </p>
        </div>
      );
    }
    if (identidad) {
      return (
        <BotonCompra
          nombre={identidad.nombre}
          email={identidad.email}
          telefono={identidad.telefono ?? ''}
          enlaceCheckout={config.enlaceCheckout}
          texto={texto}
        />
      );
    }
    return (
      <a href="#inversion" className="boton-acento mx-auto max-w-[460px]">
        {texto}
      </a>
    );
  };

  const BajoBoton = () => (
    <p className="mt-4 text-center text-[12.5px] uppercase tracking-[0.16em] text-texto-tenue">
      Acceso inmediato · {precio} · Garantía de {O.garantia.dias} días
    </p>
  );

  const Etiqueta = ({ children }: { children: React.ReactNode }) => (
    <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-acento-claro">
      {children}
    </p>
  );

  return (
    <div className="min-h-dvh bg-fondo text-texto">
      <PixelMeta pixelId={config.pixelFacebook} />

      {/* ── Cabecera ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-linea bg-fondo/95 backdrop-blur">
        <div className="contenedor flex items-center justify-between gap-6 px-6 py-2.5 max-sm:px-5">
          <Marca tamano="chico" className="h-11 w-auto max-sm:h-9" />
          <p className="text-[15px] font-semibold text-acento">{precio}</p>
        </div>
      </header>

      {/* ── 1. Hero ────────────────────────────────────────────────── */}
      <section className="fondo-nebulosa border-b border-linea px-6 py-22 text-center max-sm:px-5 max-sm:py-15">
        <div className="contenedor max-w-[860px]">
          <Etiqueta>{MARCA.producto}</Etiqueta>
          <h1 className="titulo mx-auto mb-6 max-w-[760px] text-[46px] leading-[1.08] text-crema max-sm:text-[32px]">
            {O.hero.titulo}
          </h1>
          <p className="mx-auto mb-8 max-w-[58ch] text-[17px] text-texto-tenue">{O.hero.subtitulo}</p>
          <p className="mx-auto mb-2 max-w-[46ch] text-[16px] text-texto-tenue">
            {O.hero.lineas.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </p>
          <p className="mx-auto mb-10 max-w-[46ch] text-[19px] font-semibold italic text-acento">
            {O.hero.remate}
          </p>

          <Comprar texto={O.hero.cta} />
          <BajoBoton />
        </div>
      </section>

      {/* ── 2. Problema / continuidad ──────────────────────────────── */}
      <section className="fondo-profundo border-b border-linea px-6 py-22 max-sm:px-5 max-sm:py-15">
        <div className="contenedor grid items-center gap-14 md:grid-cols-2">
          {O.problema.imagen ? (
            <Image
              src={O.problema.imagen}
              alt=""
              width={928}
              height={1152}
              className="mx-auto w-full max-w-[420px] rounded-[22px] border border-linea shadow-[0_20px_60px_rgba(0,0,0,0.4)] max-md:order-2"
            />
          ) : (
            <PlaceholderImagen
              numero={5}
              descripcion={O.problema.descripcionImagen}
              className="mx-auto w-full max-w-[420px] max-md:order-2"
            />
          )}

          <div className="max-md:order-1">
            <h2 className="titulo mb-6 text-[34px] leading-[1.12] text-crema max-sm:text-[27px]">
              {O.problema.titulo}
            </h2>
            <div className="space-y-3 text-[16px] text-texto-tenue">
              {O.problema.parrafos.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p className="text-crema">{O.problema.detonante}</p>
              <p>{O.problema.consecuencia}</p>
            </div>

            <ul className="my-7 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {O.problema.reacciones.map((p) => (
                <li
                  key={p}
                  className="rounded-[8px] border border-linea bg-fondo/55 px-3 py-2.5 text-center text-[14px] text-crema"
                >
                  {p}
                </li>
              ))}
            </ul>

            <p className="mb-3 text-[17px] font-semibold text-acento">{O.problema.puntoDeTrabajo}</p>
            <p className="text-texto-tenue">
              {O.problema.cierre}{' '}
              <span className="font-semibold text-crema">{O.problema.cierreAcento}</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. El proceso: las cuatro etapas ───────────────────────── */}
      <section className="px-6 py-22 max-sm:px-5 max-sm:py-15">
        <div className="contenedor">
          <div className="mx-auto mb-14 max-w-[680px] text-center max-sm:mb-9">
            <Etiqueta>{O.proceso.etiqueta}</Etiqueta>
            <h2 className="titulo mb-5 text-4xl text-crema max-sm:text-[28px]">{O.proceso.titulo}</h2>
            <p className="text-texto-tenue">{O.proceso.parrafo}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {O.proceso.etapas.map((e, i) => (
              <article key={e.nombre} className="panel p-8 max-sm:p-6">
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <p className="text-[11.5px] font-bold uppercase tracking-[0.22em] text-acento-claro">
                    {e.semana}
                  </p>
                  <span className="font-display text-[34px] leading-none text-acento/40">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="titulo mb-3 text-[26px] uppercase tracking-[0.04em] text-crema max-sm:text-[22px]">
                  {e.nombre}
                </h3>
                <p className="max-w-[50ch] text-[15.5px] text-texto-tenue">{e.descripcion}</p>
              </article>
            ))}
          </div>

          <blockquote className="mx-auto mt-12 max-w-[640px] border-l-2 border-acento/60 pl-6 text-[19px] italic leading-[1.45] text-acento max-sm:text-[17px]">
            {O.proceso.frase}
          </blockquote>
        </div>
      </section>

      {/* ── 4. Qué incluye ─────────────────────────────────────────── */}
      <section className="fondo-profundo border-y border-linea px-6 py-22 max-sm:px-5 max-sm:py-15">
        <div className="contenedor">
          <div className="mx-auto mb-12 max-w-[640px] text-center max-sm:mb-8">
            <Etiqueta>{O.incluye.etiqueta}</Etiqueta>
            <h2 className="titulo text-4xl text-crema max-sm:text-[28px]">{O.incluye.titulo}</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {O.incluye.partes.map((p) => (
              <div key={p.nombre} className="panel p-7 max-sm:p-5">
                <h3 className="titulo mb-3 text-[22px] text-crema">{p.nombre}</h3>
                <p className="text-[15px] text-texto-tenue">{p.descripcion}</p>
                {'nota' in p && p.nota && (
                  <p className="mt-4 border-t border-linea pt-4 text-[14.5px] italic text-acento">{p.nota}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Comprar texto={O.incluye.cta} />
            <BajoBoton />
          </div>
        </div>
      </section>

      {/* ── 5. Para quién es ───────────────────────────────────────── */}
      <section className="px-6 py-22 max-sm:px-5 max-sm:py-15">
        <div className="contenedor grid gap-8 md:grid-cols-[3fr_2fr]">
          <div className="panel border-acento/40 p-8 max-sm:p-6">
            <h2 className="titulo mb-6 text-[30px] text-crema max-sm:text-[25px]">{O.paraQuien.titulo}</h2>
            <ul className="space-y-3">
              {O.paraQuien.lista.map((p) => (
                <li key={p} className="relative pl-7 text-[15.5px] text-texto">
                  <span className="absolute left-0 top-[2px] text-[15px] font-bold text-acento">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-8 text-texto-tenue max-sm:p-6">
            <h2 className="titulo mb-6 text-[30px] text-texto-tenue max-sm:text-[25px]">
              {O.paraQuien.noTitulo}
            </h2>
            <p className="text-[15.5px]">{O.paraQuien.no}</p>
          </div>
        </div>
      </section>

      {/* ── 6. En vivo ─────────────────────────────────────────────── */}
      <section className="fondo-profundo border-y border-linea px-6 py-22 max-sm:px-5 max-sm:py-15">
        <div className="contenedor grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="titulo mb-4 text-[34px] leading-[1.12] text-crema max-sm:text-[27px]">
              {O.enVivo.titulo}
            </h2>
            <p className="mb-8 text-texto-tenue">{O.enVivo.intro}</p>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.24em] text-acento-claro">
              {O.enVivo.etiqueta}
            </p>
            <h3 className="titulo mb-6 text-[28px] text-acento max-sm:text-[24px]">{O.enVivo.subtitulo}</h3>
            <p className="mb-4 text-texto-tenue">{O.enVivo.parrafo}</p>
          </div>

          <div>
            <ul className="mb-8 space-y-2.5">
              {O.enVivo.frases.map((f) => (
                <li
                  key={f}
                  className="rounded-[10px] border border-linea bg-fondo/55 px-5 py-3.5 text-[15.5px] italic text-crema"
                >
                  “{f}”
                </li>
              ))}
            </ul>
            <p className="mb-2 text-texto-tenue">{O.enVivo.cierre}</p>
            <p className="text-[17px] font-semibold text-acento">{O.enVivo.cierreAcento}</p>
          </div>
        </div>
      </section>

      {/* ── 7. Garantía ────────────────────────────────────────────── */}
      <section className="px-6 py-22 max-sm:px-5 max-sm:py-15">
        <div className="contenedor max-w-[760px] text-center">
          <h2 className="titulo mb-3 text-4xl text-crema max-sm:text-[28px]">{O.garantia.titulo}</h2>
          <p className="mb-10 text-xs font-bold uppercase tracking-[0.24em] text-acento-claro">
            Garantía · {O.garantia.dias} días
          </p>
          <div className="panel p-9 text-left max-sm:p-6">
            <p className="mb-1 text-texto-tenue">{O.garantia.linea1}</p>
            <p className="mb-5 text-[17px] font-semibold text-crema">{O.garantia.linea2}</p>
            <p className="mb-4 text-texto-tenue">{conDias(O.garantia.texto)}</p>
            <p className="mb-4 text-texto-tenue">
              {conDias(O.garantia.devolucion).split('escríbenos')[0]}
              {config.enlaceSoporte ? (
                <a
                  href={config.enlaceSoporte}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-acento underline-offset-2 hover:underline"
                >
                  escríbenos
                </a>
              ) : (
                'escríbenos'
              )}
              {conDias(O.garantia.devolucion).split('escríbenos')[1]}
            </p>
            <p className="text-[17px] italic text-acento">{O.garantia.remate}</p>
          </div>
        </div>
      </section>

      {/* ── 8. Inversión ───────────────────────────────────────────── */}
      <section
        id="inversion"
        className="fondo-banda px-6 py-22 text-center max-sm:px-5 max-sm:py-16"
      >
        <div className="contenedor max-w-[640px]">
          <h2 className="titulo mb-8 text-4xl text-crema max-sm:text-[28px]">{O.inversion.titulo}</h2>
          <p className="mb-2 text-[13px] uppercase tracking-[0.2em] text-texto-tenue">
            {O.inversion.etiqueta}
          </p>
          <p className="titulo mb-1 text-[60px] leading-none text-acento max-sm:text-[46px]">{precio}</p>
          <p className="mb-9 text-[14px] text-texto-tenue">{O.inversion.unPago}</p>

          <ul className="mx-auto mb-10 max-w-[420px] space-y-2.5 text-left">
            {O.inversion.resumen.map((r) => (
              <li key={r} className="relative border-b border-acento/20 pb-2.5 pl-7 text-[15px] text-texto">
                <span className="absolute left-0 top-[1px] text-[14px] font-bold text-acento">✓</span>
                {r}
              </li>
            ))}
          </ul>

          {/* Si no lo conocemos, el formulario reemplaza al botón: nadie
              llega al cobro sin dejar nombre, correo y WhatsApp. */}
          {hayPago && !identidad ? (
            <div className="mx-auto max-w-[460px] text-left">
              <p className="mb-5 text-center text-[15px] text-texto-tenue">
                Antes de llevarte a pagar, dinos quién eres.
              </p>
              <FormularioInteres
                enlaceSoporte={config.enlaceSoporte}
                enlaceDestino={config.enlaceCheckout}
                tipoFormulario="oferta"
                textoBoton={O.inversion.cta}
                textoRecibido="Te estamos llevando a pagar…"
              />
            </div>
          ) : (
            <Comprar texto={O.inversion.cta} />
          )}

          <p className="mt-5 text-[13px] text-texto-tenue">{O.inversion.pago}</p>
        </div>
      </section>

      {/* ── 9. Cierre ──────────────────────────────────────────────── */}
      <section className="border-t border-linea px-6 py-22 text-center max-sm:px-5 max-sm:py-15">
        <div className="contenedor max-w-[760px]">
          <h2 className="titulo mb-8 text-[36px] leading-[1.12] text-crema max-sm:text-[27px]">
            {O.cierre.titulo}
          </h2>
          <div className="mx-auto mb-8 max-w-[52ch] space-y-3 text-texto-tenue">
            {O.cierre.parrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="text-[19px] font-semibold text-crema">{O.cierre.pregunta}</p>
            {O.cierre.despues.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="text-[17px] font-semibold text-acento">{O.cierre.remate}</p>
          </div>

          <Comprar texto={O.cierre.cta.replace('{precio}', precio)} />
          <p className="mt-4 text-[13px] text-texto-tenue">{conDias(O.cierre.garantia)}</p>
          {config.enlaceSoporte && (
            <p className="mt-3 text-[13.5px] text-texto-tenue">
              ¿Dudas antes de entrar?{' '}
              <a
                href={config.enlaceSoporte}
                target="_blank"
                rel="noopener noreferrer"
                className="text-acento underline-offset-2 hover:underline"
              >
                Ayuda por WhatsApp
              </a>
            </p>
          )}
        </div>
      </section>

      {/* ── Pie ────────────────────────────────────────────────────── */}
      <footer className="border-t border-linea bg-fondo px-6 py-13 text-center">
        <p className="mx-auto max-w-[900px] text-xs leading-[1.8] text-texto-tenue">
          © {new Date().getFullYear()} {MARCA.presentador} · {MARCA.rol}. {MARCA.avisoLegal}
        </p>
      </footer>
    </div>
  );
}
