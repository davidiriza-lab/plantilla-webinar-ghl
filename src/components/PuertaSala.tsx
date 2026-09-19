'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { evaluarPuerta, type EntradaPuerta } from '@/lib/puerta';
import { LADAS, LADA_POR_DEFECTO, componerTelefono } from '@/lib/telefono';

interface Props {
  entrada: EntradaPuerta;
  fechaLegible: string;
  horaLegible: string;
  etiquetaZona: string;
  enlaceSoporte: string;
  /** Datos ya conocidos por la cookie de identidad, para pre-llenar. */
  nombreInicial?: string;
  emailInicial?: string;
  /** En E.164 (+5233...), como lo guarda la cookie. */
  telefonoInicial?: string;
}

/** Separa un E.164 en la lada del selector y el número local. */
function separarTelefono(e164: string): { lada: string; numero: string } {
  const limpio = e164.replace(/[^\d+]/g, '');
  if (!limpio.startsWith('+')) return { lada: LADA_POR_DEFECTO, numero: limpio };
  // La lada más larga que coincida gana (+1 vs +52, por ejemplo).
  const lada = LADAS.map(([codigo]) => codigo)
    .filter((codigo) => limpio.startsWith(codigo))
    .sort((a, b) => b.length - a.length)[0];
  if (!lada) return { lada: LADA_POR_DEFECTO, numero: limpio.slice(1) };
  return { lada, numero: limpio.slice(lada.length) };
}

type Envio = 'listo' | 'enviando' | 'error' | 'dentro';

const dos = (n: number): string => String(n).padStart(2, '0');

/** Las cuatro cajas del contador: días, horas, minutos, segundos. */
function CajasContador({ restanteMs, aria }: { restanteMs: number; aria: string }) {
  const restante = Math.max(0, restanteMs);
  const d = Math.floor(restante / 86_400_000);
  const h = Math.floor(restante / 3_600_000) % 24;
  const m = Math.floor(restante / 60_000) % 60;
  const s = Math.floor(restante / 1000) % 60;

  return (
    <div className="mb-7 flex justify-center gap-3" role="timer" aria-label={aria}>
      {(
        [
          [dos(d), 'Días'],
          [dos(h), 'Horas'],
          [dos(m), 'Min'],
          [dos(s), 'Seg'],
        ] as ReadonlyArray<[string, string]>
      ).map(([valor, etiqueta]) => (
        <div
          key={etiqueta}
          className="min-w-[76px] rounded-[10px] border border-linea bg-superficie/70 px-1.5 py-3.5 max-sm:min-w-[64px]"
        >
          <b className="block font-display text-[28px] leading-none text-acento max-sm:text-[22px]">
            {valor}
          </b>
          <small className="text-[10px] uppercase tracking-[0.16em] text-texto-tenue">
            {etiqueta}
          </small>
        </div>
      ))}
    </div>
  );
}

/**
 * La puerta, en el navegador.
 *
 * El servidor manda los instantes ya resueltos y aquí se reevalúan cada
 * segundo. Así la sala abre a la hora exacta sin que nadie tenga que recargar
 * — que era el modo más probable de dejar gente fuera.
 */
export default function PuertaSala({
  entrada,
  fechaLegible,
  horaLegible,
  etiquetaZona,
  enlaceSoporte,
  nombreInicial = '',
  emailInicial = '',
  telefonoInicial = '',
}: Props) {
  const inicial = separarTelefono(telefonoInicial);
  const [lada, setLada] = useState(inicial.lada);
  const [numero, setNumero] = useState(inicial.numero);
  const [ahora, setAhora] = useState<number | null>(null);
  const [envio, setEnvio] = useState<Envio>('listo');
  const [mensaje, setMensaje] = useState('');
  const [enlace, setEnlace] = useState('');

  useEffect(() => {
    setAhora(Date.now());
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Mientras no hay lectura del reloj se usa la del servidor, para que el
  // primer pintado ya sea el correcto y no parpadee.
  const decision = evaluarPuerta(entrada, ahora ?? undefined);

  async function entrar(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (envio === 'enviando') return;

    const datos = new FormData(e.currentTarget);
    setEnvio('enviando');
    setMensaje('');

    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'ingreso',
          nombre: String(datos.get('nombre') ?? ''),
          email: String(datos.get('email') ?? ''),
          telefono: componerTelefono(lada, numero),
          urlOrigen: window.location.href,
        }),
      });

      const cuerpo = (await res.json()) as {
        ok?: boolean;
        error?: string;
        enlaceIngreso?: string;
      };

      if (!res.ok || !cuerpo.ok) {
        setEnvio('error');
        setMensaje(cuerpo.error ?? 'No pudimos registrar tu entrada.');
        return;
      }

      const destino = cuerpo.enlaceIngreso ?? '';
      setEnlace(destino);
      setEnvio('dentro');

      // Se abre solo, pero el botón se queda por si el navegador lo bloquea.
      if (destino) window.open(destino, '_blank', 'noopener');
    } catch {
      setEnvio('error');
      setMensaje('Se cayó la conexión. Inténtalo otra vez.');
    }
  }

  // ── Ya entró ──────────────────────────────────────────────────────────────
  if (envio === 'dentro') {
    return (
      <div className="rounded-[14px] border border-linea bg-fondo/70 p-9 text-center max-sm:p-6">
        <h2 className="titulo mb-3 text-[26px] text-crema">Listo, quedas dentro</h2>
        {enlace ? (
          <>
            <p className="mb-7 text-[15px] text-texto-tenue">
              Si no se abrió sola, entra desde aquí.
            </p>
            <a
              href={enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="boton-acento"
            >
              Abrir la sala
            </a>
          </>
        ) : (
          <p className="text-[15px] text-texto-tenue">
            Registramos tu entrada, pero el enlace de acceso no está cargado.
            {enlaceSoporte ? ' Escríbenos por WhatsApp y te lo pasamos.' : ''}
          </p>
        )}
      </div>
    );
  }

  // ── La clase ya terminó ───────────────────────────────────────────────────
  if (decision.estado === 'terminada') {
    return (
      <div className="rounded-[14px] border border-linea bg-fondo/70 p-9 text-center max-sm:p-6">
        <h2 className="titulo mb-3 text-[26px] text-crema">
          Esta clase ya terminó
        </h2>
        <p className="text-[15px] text-texto-tenue">
          Pronto anunciamos la siguiente fecha. Si te habías registrado, te
          avisamos por correo y por WhatsApp.
        </p>
      </div>
    );
  }

  // ── Todavía no abre ───────────────────────────────────────────────────────
  if (decision.estado === 'esperando') {
    return (
      <div className="rounded-[14px] border border-linea bg-fondo/70 p-9 text-center max-sm:p-6">
        <h2 className="titulo mb-3 text-[26px] text-crema">
          La sala todavía no abre
        </h2>
        <p className="mb-8 text-[15px] text-texto-tenue">
          Se abre {entrada.antelacionMinutos} minutos antes de empezar. La clase
          es el {fechaLegible} a las {horaLegible} ({etiquetaZona}).
        </p>

        <CajasContador
          restanteMs={decision.abreMs - (ahora ?? Date.now())}
          aria="Tiempo para que abra la sala"
        />

        <p className="text-[13px] text-texto-tenue">
          Deja esta página abierta: se habilita sola, no hace falta recargar.
        </p>
      </div>
    );
  }

  // ── Abierta ───────────────────────────────────────────────────────────────
  const enviando = envio === 'enviando';
  // Si la puerta se abrió antes de la hora (mando manual o antelación), se
  // sigue mostrando cuánto falta para que empiece la clase.
  const faltaMs = entrada.inicioMs - (ahora ?? Date.now());
  const aunNoEmpieza = faltaMs > 0;

  return (
    <div className="rounded-[14px] border border-acento/40 bg-fondo/70 p-9 max-sm:p-6">
      <h2 className="titulo mb-2 text-center text-[26px] text-crema">
        Confirma tus datos y accede
      </h2>
      <p className="mb-7 text-center text-[13.5px] text-texto-tenue">
        Es solo para pasar lista.
      </p>

      {aunNoEmpieza && (
        <>
          <p className="mb-3 text-center text-[11.5px] font-semibold uppercase tracking-[0.22em] text-texto-tenue">
            La clase empieza en
          </p>
          <CajasContador restanteMs={faltaMs} aria="Tiempo para que empiece la clase" />
        </>
      )}

      <form onSubmit={entrar} noValidate>
        <div className="mb-4">
          <label
            htmlFor="nombre"
            className="mb-1.5 block text-[13px] font-semibold text-acento-claro"
          >
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            autoComplete="name"
            defaultValue={nombreInicial}
            placeholder="Nombre"
            className="w-full rounded-[7px] border border-acento/30 bg-crema/5 px-4 py-3.5 text-crema placeholder:text-texto-tenue/70 focus:border-acento focus:outline-none"
          />
        </div>

        <div className="mb-5">
          <label
            htmlFor="email"
            className="mb-1.5 block text-[13px] font-semibold text-acento-claro"
          >
            El correo con el que te registraste *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={emailInicial}
            placeholder="Email"
            className="w-full rounded-[7px] border border-acento/30 bg-crema/5 px-4 py-3.5 text-crema placeholder:text-texto-tenue/70 focus:border-acento focus:outline-none"
          />
        </div>

        <div className="mb-5">
          <label
            htmlFor="telefono"
            className="mb-1.5 block text-[13px] font-semibold text-acento-claro"
          >
            WhatsApp *
          </label>
          <div className="flex gap-2">
            <select
              aria-label="Código de país"
              value={lada}
              onChange={(e) => setLada(e.target.value)}
              className="w-[92px] shrink-0 rounded-[7px] border border-acento/30 bg-crema/5 px-2 text-crema focus:border-acento focus:outline-none"
            >
              {LADAS.map(([codigo, bandera]) => (
                <option key={codigo} value={codigo} className="bg-superficie">
                  {bandera} {codigo}
                </option>
              ))}
            </select>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              required
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="WhatsApp"
              className="w-full rounded-[7px] border border-acento/30 bg-crema/5 px-4 py-3.5 text-crema placeholder:text-texto-tenue/70 focus:border-acento focus:outline-none"
            />
          </div>
        </div>

        <button type="submit" className="boton-acento" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar a la clase'}
        </button>
      </form>

      {envio === 'error' && (
        <p role="alert" className="mt-4 text-center text-sm text-[#F0A0A0]">
          {mensaje}
          {enlaceSoporte && (
            <>
              {' '}
              <a
                href={enlaceSoporte}
                target="_blank"
                rel="noopener noreferrer"
                className="text-acento underline"
              >
                Escríbenos
              </a>
              .
            </>
          )}
        </p>
      )}
    </div>
  );
}
