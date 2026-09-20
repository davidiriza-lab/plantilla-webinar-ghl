'use client';

import { useState, type FormEvent } from 'react';
import { LADAS, LADA_POR_DEFECTO, componerTelefono } from '@/lib/telefono';
import type { TipoFormulario } from '@/lib/etiquetas';
import { ruta } from '@/lib/ruta';

interface Props {
  enlaceSoporte: string;
  /**
   * A dónde mandar al enviar. Vacío cuando el formulario ya vive dentro de la
   * página de oferta: ahí no hay a dónde llevarlo, solo confirmar.
   */
  enlaceDestino?: string;
  /** Qué etiqueta pone en GHL. 'interesado' = no puede pagar hoy. 'oferta' =
   * ya va a pagar, solo hace falta saber quién es antes de mandarlo al cobro. */
  tipoFormulario?: TipoFormulario;
  textoBoton?: string;
  textoRecibido?: string;
}

type Estado = 'listo' | 'enviando' | 'error' | 'hecho';

const claseInput =
  'w-full rounded-[7px] border border-acento/30 bg-crema/5 px-4 py-3.5 text-crema placeholder:text-texto-tenue/70 focus:border-acento focus:bg-crema/10 focus:outline-none';

export default function FormularioInteres({
  enlaceSoporte,
  enlaceDestino = '',
  tipoFormulario = 'interesado',
  textoBoton = 'Quiero la información',
  textoRecibido,
}: Props) {
  const [estado, setEstado] = useState<Estado>('listo');
  const [mensaje, setMensaje] = useState('');
  const [lada, setLada] = useState(LADA_POR_DEFECTO);
  const [numero, setNumero] = useState('');

  async function enviar(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (estado === 'enviando') return;

    const datos = new FormData(e.currentTarget);
    setEstado('enviando');
    setMensaje('');

    try {
      const res = await fetch(ruta('/api/registro'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: tipoFormulario,
          nombre: String(datos.get('nombre') ?? ''),
          email: String(datos.get('email') ?? ''),
          telefono: componerTelefono(lada, numero),
          urlOrigen: window.location.href,
        }),
      });

      const cuerpo = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !cuerpo.ok) {
        setEstado('error');
        setMensaje(cuerpo.error ?? 'No pudimos guardar tus datos.');
        return;
      }

      setEstado('hecho');
      if (enlaceDestino) window.location.href = enlaceDestino;
    } catch {
      setEstado('error');
      setMensaje('Se cayó la conexión. Inténtalo otra vez.');
    }
  }

  if (estado === 'hecho') {
    return (
      <div className="panel px-6 py-8">
        <h2 className="titulo mb-3 text-[26px] text-acento">Recibido</h2>
        <p className="text-texto-tenue">
          {textoRecibido ??
            (enlaceDestino
              ? 'Te estamos llevando a la información del protocolo.'
              : 'Te escribimos por WhatsApp para ver cómo entrar.')}
        </p>
      </div>
    );
  }

  const enviando = estado === 'enviando';

  return (
    <div className="panel px-6 py-7 max-sm:px-5">
      <form onSubmit={enviar} noValidate>
        {(
          [
            ['nombre', 'Nombre', 'text', 'name', false],
            ['email', 'Email *', 'email', 'email', true],
          ] as ReadonlyArray<[string, string, string, string, boolean]>
        ).map(([id, etiqueta, tipo, auto, requerido]) => (
          <div key={id} className="mb-4">
            <label
              htmlFor={id}
              className="mb-1.5 block text-[13px] font-semibold text-acento-claro"
            >
              {etiqueta}
            </label>
            <input
              id={id}
              name={id}
              type={tipo}
              autoComplete={auto}
              required={requerido}
              placeholder={etiqueta.replace(' *', '')}
              className={claseInput}
            />
          </div>
        ))}

        <div className="mb-4">
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
              className="w-[92px] shrink-0 rounded-[7px] border border-acento/30 bg-crema/5 px-2 text-crema focus:border-acento focus:bg-crema/10 focus:outline-none"
            >
              {LADAS.map(([codigo, bandera]) => (
                <option key={codigo} value={codigo} className="bg-superficie">
                  {bandera} {codigo}
                </option>
              ))}
            </select>
            <input
              id="telefono"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              required
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="WhatsApp"
              className={claseInput}
            />
          </div>
        </div>

        <button type="submit" className="boton-acento mt-2" disabled={enviando}>
          {enviando ? 'Enviando…' : textoBoton}
        </button>
      </form>

      {estado === 'error' && (
        <p role="alert" className="mt-4 text-sm text-[#F0A0A0]">
          {mensaje}
          {enlaceSoporte && (
            <>
              {' '}
              <a
                href={enlaceSoporte}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
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
