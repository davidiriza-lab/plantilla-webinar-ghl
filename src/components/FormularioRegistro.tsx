'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LADAS, LADA_POR_DEFECTO, componerTelefono } from '@/lib/telefono';

interface Props {
  activo: boolean;
  frase: string;
}

type Estado = 'listo' | 'enviando' | 'error';

/** Lee una cookie del navegador. Sirve para los parámetros de Meta. */
function cookie(nombre: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(?:^|; )${nombre}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

export default function FormularioRegistro({ activo, frase }: Props) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>('listo');
  const [mensaje, setMensaje] = useState('');
  const [lada, setLada] = useState(LADA_POR_DEFECTO);
  const [numero, setNumero] = useState('');

  async function enviar(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (estado === 'enviando') return;

    const datos = new FormData(e.currentTarget);
    const params = new URLSearchParams(window.location.search);

    setEstado('enviando');
    setMensaje('');

    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: String(datos.get('nombre') ?? ''),
          email: String(datos.get('email') ?? ''),
          telefono: componerTelefono(lada, numero),
          utm: {
            source: params.get('utm_source') ?? '',
            medium: params.get('utm_medium') ?? '',
            campaign: params.get('utm_campaign') ?? '',
            content: params.get('utm_content') ?? '',
            term: params.get('utm_term') ?? '',
            fbclid: params.get('fbclid') ?? '',
          },
          fbp: cookie('_fbp'),
          fbc: cookie('_fbc'),
          urlOrigen: window.location.href,
        }),
      });

      const cuerpo = (await res.json()) as {
        ok?: boolean;
        error?: string;
        eventId?: string;
      };

      if (!res.ok || !cuerpo.ok) {
        setEstado('error');
        setMensaje(cuerpo.error ?? 'No pudimos guardar tu registro.');
        return;
      }

      // Pixel del navegador con el mismo id que mandó el servidor, para que
      // Meta los una en vez de contar dos.
      const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;
      if (fbq && cuerpo.eventId) {
        fbq('track', 'Lead', {}, { eventID: cuerpo.eventId });
      }

      // El nombre viaja para saludar en la página de gracias. Es cosmético:
      // el dato real ya quedó guardado en GHL.
      const nombre = String(datos.get('nombre') ?? '').trim();
      router.push(
        nombre ? `/gracias?n=${encodeURIComponent(nombre)}` : '/gracias',
      );
    } catch {
      setEstado('error');
      setMensaje('Se cayó la conexión. Inténtalo otra vez.');
    }
  }

  if (!activo) {
    return (
      <div className="rounded-[14px] border border-linea bg-fondo/70 p-9 text-center shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <h3 className="titulo mb-3 text-[25px] text-crema">
          Registros cerrados por ahora
        </h3>
        <p className="text-sm text-texto-tenue">
          La próxima edición se abre pronto. {frase}
        </p>
      </div>
    );
  }

  const enviando = estado === 'enviando';

  return (
    <div className="rounded-[14px] border border-linea bg-fondo/70 p-9 shadow-[0_24px_60px_rgba(0,0,0,0.45)] max-sm:p-6">
      <h3 className="titulo mb-2 text-center text-[25px] text-crema">
        Aparta tu lugar
      </h3>
      <p className="mb-6 text-center text-[13.5px] text-texto-tenue">
        Es gratis. {frase}
      </p>

      <form onSubmit={enviar} noValidate>
        <Campo
          id="nombre"
          nombre="nombre"
          etiqueta="Nombre"
          tipo="text"
          autoComplete="name"
        />
        <Campo
          id="email"
          nombre="email"
          etiqueta="Email *"
          tipo="email"
          requerido
          autoComplete="email"
        />
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
              className="w-full rounded-[7px] border border-acento/30 bg-crema/5 px-4 py-3.5 text-crema placeholder:text-texto-tenue/70 focus:border-acento focus:bg-crema/10 focus:outline-none"
            />
          </div>
        </div>

        <button type="submit" className="boton-acento mt-2" disabled={enviando}>
          {enviando ? 'Apartando tu lugar…' : 'Reservar mi lugar gratis'}
        </button>
      </form>

      {estado === 'error' && (
        <p role="alert" className="mt-4 text-center text-sm text-[#F0A0A0]">
          {mensaje}
        </p>
      )}

      <p className="mt-4 text-center text-xs leading-relaxed text-texto-tenue">
        Te mandamos el enlace y el recordatorio por WhatsApp y correo.
        <br />
        Cupo limitado · 100% en línea
      </p>
    </div>
  );
}

function Campo({
  id,
  nombre,
  etiqueta,
  tipo,
  requerido = false,
  autoComplete,
}: {
  id: string;
  nombre: string;
  etiqueta: string;
  tipo: string;
  requerido?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-semibold text-acento-claro"
      >
        {etiqueta}
      </label>
      <input
        id={id}
        name={nombre}
        type={tipo}
        required={requerido}
        autoComplete={autoComplete}
        placeholder={etiqueta.replace(' *', '')}
        className="w-full rounded-[7px] border border-acento/30 bg-crema/5 px-4 py-3.5 text-crema placeholder:text-texto-tenue/70 focus:border-acento focus:bg-crema/10 focus:outline-none"
      />
    </div>
  );
}
