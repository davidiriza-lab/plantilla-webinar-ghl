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
import { ruta } from '@/lib/ruta';

export const revalidate = 60;

const O = OFERTA;

export const metadata: Metadata = {
  title: O.seo.titulo,
  description: O.seo.descripcion,
  robots: { index: false, follow: false },
};

/** "$9,997 USD". El número y la moneda salen del panel. */
const formatear = (n: number, moneda: string): string => `$${n.toLocaleString('en-US')} ${moneda}`;
const conDias = (t: string): string => t.replaceAll('{dias}', String(O.garantia.dias));

export default async function Oferta() {
  const config = aPublica(await leerConfig());
  const dinero = (n: number): string => formatear(n, config.moneda);
  const precio = dinero(config.precio);

  const P = O.programa;
  const totalModulos = P.modulos.reduce((suma, m) => suma + m.valor, 0);
  const dosDigitos = (n: number): string => String(n).padStart(2, '0');
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
          {O.hero.datos.length > 0 && (
            <ul className="mt-7 flex flex-wrap justify-center gap-x-7 gap-y-2 text-[12.5px] font-semibold uppercase tracking-[0.18em] text-texto-tenue">
              {O.hero.datos.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
          <BajoBoton />
        </div>
      </section>

      {/* ── 2. Problema / continuidad ──────────────────────────────── */}
      <section className="fondo-profundo border-b border-linea px-6 py-22 max-sm:px-5 max-sm:py-15">
        <div className="contenedor grid items-center gap-14 md:grid-cols-2">
          {O.problema.imagen ? (
            <Image
              src={ruta(O.problema.imagen)}
              alt=""
              width={1024}
              height={1280}
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

      {/* ── 3. El programa, módulo por módulo ──────────────────────── */}
      <section className="px-6 py-22 max-sm:px-5 max-sm:py-15">
        <div className="contenedor">
          <div className="mx-auto mb-16 max-w-[680px] text-center max-sm:mb-10">
            <Etiqueta>{P.etiqueta}</Etiqueta>
            <h2 className="titulo mb-5 text-4xl text-crema max-sm:text-[28px]">{P.titulo}</h2>
            <p className="text-texto-tenue">{P.parrafo}</p>
          </div>

          <div className="space-y-6">
            {P.modulos.map((m, i) => (
              <article
                key={m.nombre}
                className="panel grid gap-x-9 gap-y-6 p-8 sm:grid-cols-[170px_1fr] max-sm:p-6"
              >
                {/* La caja del módulo. El PNG/WebP trae transparencia real:
                    flota sobre la tarjeta, sin borde ni fondo. */}
                {m.imagen ? (
                  <Image
                    src={ruta(m.imagen)}
                    alt={`${P.nombreUnidad} ${i + 1}: ${m.nombre}`}
                    width={640}
                    height={1040}
                    sizes="(max-width: 640px) 150px, 170px"
                    className="mx-auto h-auto w-[150px] self-start sm:w-full"
                  />
                ) : (
                  <PlaceholderImagen
                    numero={i + 1}
                    descripcion={`Caja del módulo ${m.nombre}, formato 2:3 con fondo transparente`}
                    aspecto="retrato"
                    className="mx-auto w-[150px] self-start sm:w-full"
                  />
                )}

                <div>
                  <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5">
                    <p className="text-[11.5px] font-bold uppercase tracking-[0.22em] text-acento-claro">
                      {P.nombreUnidad} {dosDigitos(i + 1)} / {dosDigitos(P.modulos.length)}
                      <span className="text-texto-tenue"> · {m.fase ? `${m.fase} · ` : ''}{m.cuando}</span>
                    </p>
                    {m.valor > 0 && (
                      <p className="text-[12.5px] text-texto-tenue">
                        Por separado <span className="line-through">{dinero(m.valor)}</span>
                      </p>
                    )}
                  </div>

                  <h3 className="titulo mb-4 text-[28px] text-crema max-sm:text-[23px]">{m.nombre}</h3>

                  <p className="mb-6 max-w-[60ch] border-l-2 border-acento/50 pl-5 text-[17px] italic leading-[1.4] text-acento">
                    {m.frase}
                  </p>

                  <div className="grid gap-x-12 gap-y-5 md:grid-cols-2">
                    <div>
                      <p className="mb-3 max-w-[46ch] font-medium text-texto">{m.promesa}</p>
                      <p className="max-w-[46ch] text-[14.5px] text-texto-tenue">{m.detalle}</p>
                    </div>

                    {m.teLlevas.length > 0 && (
                      <ul className="space-y-2 self-start border-t border-linea pt-4 text-[14.5px] text-texto-tenue md:border-l md:border-t-0 md:pl-8 md:pt-0">
                        {m.teLlevas.map((t) => (
                          <li key={t} className="relative pl-6">
                            <span className="absolute left-0 top-[1px] text-[13px] font-bold text-acento">✓</span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalModulos > 0 && (
            <p className="mt-8 text-right text-[13px] text-texto-tenue">
              {P.textoTotal} · <span className="text-texto line-through">{dinero(totalModulos)}</span>
            </p>
          )}

          <blockquote className="mx-auto mt-12 max-w-[640px] border-l-2 border-acento/60 pl-6 text-[19px] italic leading-[1.45] text-acento max-sm:text-[17px]">
            {P.frase}
          </blockquote>
          {P.nota && <p className="mx-auto mt-5 max-w-[640px] pl-6 text-[13.5px] text-texto-tenue">{P.nota}</p>}
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

      {/* ── 4b. Bonos (solo si hay) ────────────────────────────────── */}
      {O.bonos.lista.length > 0 && (
        <section className="px-6 py-22 max-sm:px-5 max-sm:py-15">
          <div className="contenedor">
            <div className="mx-auto mb-14 max-w-[640px] text-center max-sm:mb-9">
              <Etiqueta>{O.bonos.etiqueta}</Etiqueta>
              <h2 className="titulo mb-3.5 text-4xl text-crema max-sm:text-[28px]">{O.bonos.titulo}</h2>
              {O.bonos.parrafo && <p className="text-texto-tenue">{O.bonos.parrafo}</p>}
            </div>
            <div className="panel space-y-5 p-7 max-sm:p-5">
              {O.bonos.lista.map((b, i) => (
                <div
                  key={b.nombre}
                  className="grid grid-cols-[76px_1fr] gap-5 border-t border-linea pt-5 first:border-t-0 first:pt-0"
                >
                  {b.imagen ? (
                    <Image src={ruta(b.imagen)} alt={b.nombre} width={304} height={360} className="h-auto w-full rounded-lg border border-linea object-cover" />
                  ) : (
                    <PlaceholderImagen numero={i + 1} descripcion={`Bono: ${b.nombre}`} aspecto="retrato" className="w-full" />
                  )}
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="titulo text-[19px] text-crema">{b.nombre}</h3>
                      {b.valor > 0 && <span className="text-[12.5px] text-texto-tenue line-through">{dinero(b.valor)}</span>}
                    </div>
                    <p className="max-w-[62ch] text-[14.5px] text-texto-tenue">{b.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
          <p className="mb-6 text-[13px] uppercase tracking-[0.2em] text-texto-tenue">
            {O.inversion.etiqueta}
          </p>

          {/* La escalera: lo que vale por separado y el precio regular,
              tachados, y debajo el de hoy. Las dos primeras filas solo salen
              si en oferta.ts les pusiste un número. */}
          <dl className="mx-auto mb-3 max-w-[460px] space-y-3 text-[15px]">
            {O.inversion.valorTotal > 0 && (
              <div className="flex items-baseline justify-between gap-6 border-b border-acento/20 pb-3.5">
                <dt className="text-texto-tenue">{O.inversion.textoValorTotal}</dt>
                <dd className="text-texto-tenue line-through">{dinero(O.inversion.valorTotal)}</dd>
              </div>
            )}
            {O.inversion.precioRegular > 0 && (
              <div className="flex items-baseline justify-between gap-6 border-b border-acento/20 pb-3.5">
                <dt className="text-texto-tenue">{O.inversion.textoPrecioRegular}</dt>
                <dd className="text-texto-tenue line-through">{dinero(O.inversion.precioRegular)}</dd>
              </div>
            )}
            <div className="flex flex-col items-center gap-2 pt-2">
              <dt className="text-[12.5px] font-bold uppercase tracking-[0.2em] text-crema">{O.inversion.textoHoy}</dt>
              <dd className="titulo text-[60px] leading-none text-acento max-sm:text-[44px]">{precio}</dd>
            </div>
          </dl>
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
