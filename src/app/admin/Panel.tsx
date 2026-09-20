'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CampoConfig, ConfigWebinar } from '@/lib/config';
import type { Salud } from '@/lib/salud';
import { ruta } from '@/lib/ruta';

interface Props {
  config: ConfigWebinar;
  campos: CampoConfig[];
  /** Campos que traían algo raro escrito desde GHL y se reinterpretaron. */
  corregidos: Array<{ etiqueta: string; tenia: string }>;
  resumen: {
    frase: string;
    proxima: string;
    enVivo: boolean;
    pasado: boolean;
    /** La misma revisión que responde /api/salud, calculada al abrir el panel. */
    salud: Salud;
  };
}

/** Texto del banner de salud, o null si todo está en orden. */
function avisoSalud(salud: Salud): { titulo: string; detalle: string } | null {
  const fallas = salud.revisiones.filter((r) => !r.ok);
  if (fallas.length === 0) return null;
  return {
    titulo: fallas.length === 1 ? 'Hay algo que arreglar' : `Hay ${fallas.length} cosas que arreglar`,
    detalle: fallas.map((f) => f.mensaje).join(' '),
  };
}

const DIAS: ReadonlyArray<[string, string]> = [
  ['1', 'Lunes'],
  ['2', 'Martes'],
  ['3', 'Miércoles'],
  ['4', 'Jueves'],
  ['5', 'Viernes'],
  ['6', 'Sábado'],
  ['0', 'Domingo'],
];

const ZONAS: ReadonlyArray<[string, string]> = [
  ['America/Mexico_City', 'Ciudad de México'],
  ['America/Tijuana', 'Tijuana'],
  ['America/Cancun', 'Cancún'],
  ['America/Bogota', 'Bogotá'],
  ['America/Lima', 'Lima'],
  ['America/Santiago', 'Santiago'],
  ['America/Argentina/Buenos_Aires', 'Buenos Aires'],
  ['America/Los_Angeles', 'Los Ángeles'],
  ['America/New_York', 'Nueva York'],
  ['Europe/Madrid', 'Madrid'],
];

const GRUPOS = [
  'Programación',
  'La sala',
  'Enlaces',
  'La oferta',
  'Etiquetas',
  'Contenido',
  'Seguimiento',
] as const;

type Estado = 'listo' | 'guardando' | 'guardado' | 'error';

export default function Panel({ config, campos, corregidos, resumen }: Props) {
  const router = useRouter();
  const [valores, setValores] = useState<ConfigWebinar>(config);
  const [estado, setEstado] = useState<Estado>('listo');
  const [mensaje, setMensaje] = useState('');
  const [avisoTrasGuardar, setAvisoTrasGuardar] = useState('');
  const [resinc, setResinc] = useState<'listo' | 'yendo' | 'hecho' | 'falla'>('listo');
  const [resincMensaje, setResincMensaje] = useState('');
  const aviso = avisoSalud(resumen.salud);

  /**
   * Trae lo que haya en GHL y reescribe la copia. Solo aparece cuando el
   * diagnóstico de arriba dice que hay desincronización: un botón que está
   * siempre no distingue "todo bien" de "algo se rompió".
   */
  async function resincronizar(): Promise<void> {
    setResinc('yendo');
    setResincMensaje('');
    try {
      const res = await fetch(ruta('/api/admin/resincronizar'), { method: 'POST' });
      const cuerpo = (await res.json()) as {
        ok?: boolean;
        mensaje?: string;
        error?: string;
      };
      if (!res.ok || !cuerpo.ok) {
        setResinc('falla');
        setResincMensaje(cuerpo.error ?? 'No se pudo re-sincronizar.');
        return;
      }
      setResinc('hecho');
      setResincMensaje(cuerpo.mensaje ?? 'Listo.');
      router.refresh();
    } catch {
      setResinc('falla');
      setResincMensaje('Se cayó la conexión.');
    }
  }

  const sucio = useMemo(
    () => campos.some((c) => valores[c.clave] !== config[c.clave]),
    [valores, config, campos],
  );

  const esRecurrente = valores.modo !== 'fecha';

  /**
   * El día de la semana solo tiene sentido si se repite; la fecha concreta,
   * solo si no. Mostrar los dos a la vez confunde sobre cuál manda.
   */
  function aplica(campo: CampoConfig): boolean {
    if (campo.clave === 'diaSemana') return esRecurrente;
    if (campo.clave === 'fechaUnica') return !esRecurrente;
    return true;
  }

  function cambiar(clave: keyof ConfigWebinar, valor: string): void {
    setValores((v) => ({ ...v, [clave]: valor }));
    setEstado('listo');
  }

  async function guardar(): Promise<void> {
    setEstado('guardando');
    setMensaje('');
    setAvisoTrasGuardar('');

    const cambios: Partial<ConfigWebinar> = {};
    for (const c of campos) {
      if (valores[c.clave] !== config[c.clave]) cambios[c.clave] = valores[c.clave];
    }

    try {
      const res = await fetch(ruta('/api/admin/config'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cambios),
      });
      const cuerpo = (await res.json()) as {
        ok?: boolean;
        error?: string;
        avisoCopia?: string;
      };

      if (!res.ok || !cuerpo.ok) {
        setEstado('error');
        setMensaje(cuerpo.error ?? 'No se pudo guardar.');
        return;
      }

      setEstado('guardado');
      // Si la copia no se pudo refrescar, se avisa aquí mismo — al momento,
      // no cinco días después.
      if (cuerpo.avisoCopia) setAvisoTrasGuardar(cuerpo.avisoCopia);
      router.refresh();
    } catch {
      setEstado('error');
      setMensaje('Se cayó la conexión al guardar.');
    }
  }

  async function salir(): Promise<void> {
    await fetch(ruta('/api/admin/sesion'), { method: 'DELETE' });
    router.refresh();
  }

  return (
    <main className="min-h-dvh bg-fondo px-6 py-12 max-sm:px-4 max-sm:py-8">
      {/* El padding de abajo evita que la barra fija de guardar tape el último campo. */}
      <div className="mx-auto max-w-[820px] pb-32">
        <header className="mb-9 flex items-start justify-between gap-4">
          <div>
            <h1 className="titulo text-[30px] text-crema">Panel de control</h1>
            <p className="mt-1 text-sm text-texto-tenue">
              Lo que cambies aquí se guarda en GoHighLevel y la página lo toma
              en menos de un minuto.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <a
              href={ruta('/api/admin/respaldo')}
              title="Descarga un CSV con todos los registrados y sus etiquetas. Guárdalo cada semana."
              className="rounded-lg border border-acento/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-acento hover:bg-acento/10"
            >
              Descargar respaldo
            </a>
            <button
              type="button"
              onClick={salir}
              className="rounded-lg border border-acento/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-acento hover:bg-acento/10"
            >
              Salir
            </button>
          </div>
        </header>

        {/* Resumen del estado actual */}
        <div className="mb-9 panel px-6 py-5">
          <div className="mb-1 text-[11.5px] uppercase tracking-[0.22em] text-acento">
            {resumen.enVivo
              ? 'Transmitiendo ahora'
              : resumen.pasado
                ? 'Ya se transmitió'
                : 'Próxima clase'}
          </div>
          <div className="font-display text-[22px] text-crema">
            {resumen.proxima}
          </div>
          <div className="mt-1 text-sm text-texto-tenue">{resumen.frase}</div>
        </div>

        {aviso && (
          <div className="mb-9 rounded-xl border border-[#F0A0A0]/40 bg-[#F0A0A0]/10 px-6 py-5">
            <div className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.22em] text-[#F0A0A0]">
              {aviso.titulo}
            </div>
            <p className="text-sm text-texto">{aviso.detalle}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={resincronizar}
                disabled={resinc === 'yendo'}
                className="rounded-lg border border-[#F0A0A0]/50 px-4 py-2 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[#F0A0A0] transition-colors hover:bg-[#F0A0A0]/10 disabled:opacity-50"
              >
                {resinc === 'yendo' ? 'Sincronizando…' : 'Re-sincronizar la web'}
              </button>
              <span className="text-[13px] text-texto-tenue">
                Trae lo que hay en GoHighLevel. No modifica GoHighLevel.
              </span>
            </div>

            {resincMensaje && (
              <p
                className={`mt-3 text-sm ${
                  resinc === 'falla' ? 'text-[#F0A0A0]' : 'text-texto'
                }`}
              >
                {resincMensaje}
              </p>
            )}
          </div>
        )}

        {corregidos.length > 0 && (
          <div className="mb-9 rounded-xl border border-acento/40 bg-acento/10 px-6 py-5">
            <div className="mb-2 text-[11.5px] font-bold uppercase tracking-[0.22em] text-acento-claro">
              Se corrigieron al vuelo
            </div>
            <p className="mb-3 text-sm text-texto">
              Estos campos venían con algo que no se entendía tal cual (por
              ejemplo, editados a mano en GoHighLevel). La página ya está usando
              el valor de abajo; guarda para dejarlo escrito así en GHL.
            </p>
            <ul className="space-y-1 text-sm text-texto-tenue">
              {corregidos.map((c) => (
                <li key={c.etiqueta}>
                  <strong className="text-acento-claro">{c.etiqueta}</strong>: decía{' '}
                  {c.tenia ? `"${c.tenia}"` : '(vacío)'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {GRUPOS.map((grupo) => {
          const delGrupo = campos.filter((c) => c.grupo === grupo);
          if (delGrupo.length === 0) return null;

          return (
            <section key={grupo} className="mb-9">
              <h2 className="mb-4 text-[11.5px] font-bold uppercase tracking-[0.22em] text-acento-claro">
                {grupo}
              </h2>
              <div className="space-y-5 panel px-6 py-6 max-sm:px-4">
                {delGrupo.filter(aplica).map((campo) => (
                  <Campo
                    key={campo.clave}
                    campo={campo}
                    valor={valores[campo.clave]}
                    onChange={(v) => cambiar(campo.clave, v)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        <div className="sticky bottom-4 panel/95 px-6 py-4 backdrop-blur max-sm:px-4">
          <button
            type="button"
            onClick={guardar}
            className="boton-acento"
            disabled={!sucio || estado === 'guardando'}
          >
            {estado === 'guardando'
              ? 'Guardando…'
              : sucio
                ? 'Guardar cambios'
                : 'Todo guardado'}
          </button>

          {estado === 'guardado' && !avisoTrasGuardar && (
            <p className="mt-3 text-center text-sm text-acento">
              Guardado en GoHighLevel.
            </p>
          )}
          {estado === 'guardado' && avisoTrasGuardar && (
            <p role="alert" className="mt-3 text-center text-sm text-[#F0A0A0]">
              Guardado en GoHighLevel — {avisoTrasGuardar}
            </p>
          )}
          {estado === 'error' && (
            <p role="alert" className="mt-3 text-center text-sm text-[#F0A0A0]">
              {mensaje}
            </p>
          )}
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-texto-tenue">
          Estos valores son los mismos que usan los correos y los recordatorios
          de GoHighLevel. Si cambias el enlace de ingreso aquí, cambia en todos
          lados.
        </p>
      </div>
    </main>
  );
}

function Campo({
  campo,
  valor,
  onChange,
}: {
  campo: CampoConfig;
  valor: string;
  onChange: (v: string) => void;
}) {
  const id = `campo-${campo.clave}`;
  const claseInput =
    'w-full rounded-[7px] border border-acento/30 bg-crema/5 px-4 py-3 text-crema placeholder:text-texto-tenue/60 focus:border-acento focus:outline-none';

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-semibold text-acento-claro"
      >
        {campo.etiqueta}
      </label>

      {campo.tipo === 'dia' && (
        <select
          id={id}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className={claseInput}
        >
          {DIAS.map(([v, n]) => (
            <option key={v} value={v} className="bg-superficie">
              {n}
            </option>
          ))}
        </select>
      )}

      {campo.tipo === 'zona' && (
        <select
          id={id}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className={claseInput}
        >
          {ZONAS.map(([v, n]) => (
            <option key={v} value={v} className="bg-superficie">
              {n}
            </option>
          ))}
        </select>
      )}

      {campo.tipo === 'interruptor' && (
        <select
          id={id}
          value={valor.toLowerCase() === 'no' ? 'no' : 'si'}
          onChange={(e) => onChange(e.target.value)}
          className={claseInput}
        >
          <option value="si" className="bg-superficie">
            Abierto — se aceptan registros
          </option>
          <option value="no" className="bg-superficie">
            Cerrado — el formulario no aparece
          </option>
        </select>
      )}

      {campo.tipo === 'modo' && (
        <select
          id={id}
          value={valor === 'fecha' ? 'fecha' : 'recurrente'}
          onChange={(e) => onChange(e.target.value)}
          className={claseInput}
        >
          <option value="recurrente" className="bg-superficie">
            Sí, cada semana el mismo día
          </option>
          <option value="fecha" className="bg-superficie">
            No, es una sola fecha
          </option>
        </select>
      )}

      {campo.tipo === 'puerta' && (
        <select
          id={id}
          value={['abierta', 'cerrada'].includes(valor) ? valor : 'auto'}
          onChange={(e) => onChange(e.target.value)}
          className={claseInput}
        >
          <option value="auto" className="bg-superficie">
            Automático — abre sola antes de empezar
          </option>
          <option value="abierta" className="bg-superficie">
            Abierta a la fuerza — deja entrar ya
          </option>
          <option value="cerrada" className="bg-superficie">
            Cerrada a la fuerza — no deja entrar a nadie
          </option>
        </select>
      )}

      {campo.tipo === 'fecha' && (
        <input
          id={id}
          type="date"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className={claseInput}
        />
      )}

      {campo.tipo === 'hora' && (
        <input
          id={id}
          type="time"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className={claseInput}
        />
      )}

      {campo.tipo === 'numero' && (
        <input
          id={id}
          type="number"
          min={15}
          max={480}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className={claseInput}
        />
      )}

      {(campo.tipo === 'texto' || campo.tipo === 'url') && (
        <input
          id={id}
          // El token de Meta no se enseña en claro: el panel se comparte en pantalla.
          type={campo.tipo === 'url' ? 'url' : /token/i.test(campo.clave) ? 'password' : 'text'}
          autoComplete={/token/i.test(campo.clave) ? 'off' : undefined}
          value={valor}
          placeholder={campo.tipo === 'url' ? 'https://…' : ''}
          onChange={(e) => onChange(e.target.value)}
          className={claseInput}
        />
      )}

      {campo.ayuda && (
        <p className="mt-1.5 text-xs text-texto-tenue">{campo.ayuda}</p>
      )}
    </div>
  );
}
