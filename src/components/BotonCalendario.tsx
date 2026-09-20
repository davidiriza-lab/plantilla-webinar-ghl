import { ruta } from '@/lib/ruta';
/**
 * Añadir la clase al calendario, sin depender de AddEvent.
 *
 * Google se abre con su URL de plantilla; el resto (Apple, Outlook, Android)
 * usa el archivo .ics que genera `/api/calendario.ics`.
 */

interface Props {
  inicioMs: number;
  finMs: number;
  titulo: string;
  /** URL absoluta de /ingreso. Nunca el Zoom directo. */
  enlacePuerta: string;
}

/** Formato que espera Google Calendar: 20260821T020000Z */
function aFechaGoogle(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export default function BotonCalendario({
  inicioMs,
  finMs,
  titulo,
  enlacePuerta,
}: Props) {
  const detalles = `Entra aquí: ${enlacePuerta}`;

  const google =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(titulo)}` +
    `&dates=${aFechaGoogle(inicioMs)}/${aFechaGoogle(finMs)}` +
    `&details=${encodeURIComponent(detalles)}` +
    `&location=${encodeURIComponent('En línea')}`;

  const claseBoton =
    'flex-1 rounded-full border border-crema/35 bg-crema/[0.03] px-5 py-4 text-center text-[14px] font-semibold text-crema transition-colors hover:bg-crema/10';

  return (
    <div className="flex gap-3 max-sm:flex-col">
      <a
        href={google}
        target="_blank"
        rel="noopener noreferrer"
        className={claseBoton}
      >
        Google Calendar
      </a>
      <a href={ruta('/api/calendario.ics')} className={claseBoton}>
        Apple u Outlook
      </a>
    </div>
  );
}
