'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  inicioMs: number;
  finMs: number;
  enlaceIngreso: string;
  /**
   * Si la clase se repite, al terminar se le pide al servidor la siguiente.
   * En una fecha única no hay siguiente: pedirla sería un bucle de recargas.
   */
  seRepite: boolean;
}

interface Restante {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
}

function desglosar(ms: number): Restante {
  const total = Math.max(0, ms);
  return {
    dias: Math.floor(total / 86_400_000),
    horas: Math.floor(total / 3_600_000) % 24,
    minutos: Math.floor(total / 60_000) % 60,
    segundos: Math.floor(total / 1000) % 60,
  };
}

const dos = (n: number): string => String(n).padStart(2, '0');

/**
 * Contador al próximo webinar. Cuando llega la hora cambia solo al estado
 * "en vivo", y cuando el webinar termina le pide al servidor la siguiente
 * ocurrencia — de ahí sale el reinicio semanal, sin ninguna tarea programada.
 */
export default function Contador({
  inicioMs,
  finMs,
  enlaceIngreso,
  seRepite,
}: Props) {
  const router = useRouter();
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    setAhora(Date.now());
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Al terminar la transmisión, recargar para recibir la siguiente fecha.
  useEffect(() => {
    if (seRepite && ahora !== null && ahora >= finMs) router.refresh();
  }, [ahora, finMs, router, seRepite]);

  // Antes de la primera medición no se pinta nada, para no chocar con el HTML
  // que llegó del servidor.
  if (ahora === null) {
    return <div className="h-[104px]" aria-hidden />;
  }

  if (ahora >= inicioMs && ahora < finMs) {
    return (
      <div className="mx-auto max-w-[520px]">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-acento">
          Estamos en vivo ahora
        </p>
        {enlaceIngreso ? (
          <a
            href={enlaceIngreso}
            target="_blank"
            rel="noopener noreferrer"
            className="boton-acento"
          >
            Entrar al webinar
          </a>
        ) : (
          <p className="text-texto-tenue">
            Revisa tu correo y tu WhatsApp: ahí está el enlace de acceso.
          </p>
        )}
      </div>
    );
  }

  if (ahora >= finMs) {
    return (
      <p className="text-texto-tenue">
        Esta clase ya se transmitió. Pronto anunciamos la siguiente fecha.
      </p>
    );
  }

  const r = desglosar(inicioMs - ahora);
  const celdas: ReadonlyArray<[string, string]> = [
    [dos(r.dias), 'Días'],
    [dos(r.horas), 'Horas'],
    [dos(r.minutos), 'Min'],
    [dos(r.segundos), 'Seg'],
  ];

  return (
    <div
      className="flex justify-center gap-3.5"
      role="timer"
      aria-label="Tiempo restante para la próxima clase"
    >
      {celdas.map(([valor, etiqueta]) => (
        <div
          key={etiqueta}
          className="min-w-[88px] rounded-[10px] border border-linea bg-fondo/80 px-1.5 py-4 max-sm:min-w-[70px]"
        >
          <b className="block font-display text-[33px] leading-none text-acento max-sm:text-[26px]">
            {valor}
          </b>
          <small className="text-[10.5px] uppercase tracking-[0.16em] text-texto-tenue">
            {etiqueta}
          </small>
        </div>
      ))}
    </div>
  );
}
