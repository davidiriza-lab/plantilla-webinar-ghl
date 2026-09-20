/**
 * Iconos lineales del sistema visual: trazo de 1.75, sin relleno, en el color
 * del texto que los contenga (`currentColor`). Se eligen por nombre desde los
 * archivos de contenido, así nadie pega SVG en el copy.
 *
 * Para agregar uno: dibuja en una retícula de 24×24 con trazos, sin rellenos,
 * y súmalo al mapa de abajo.
 */
export type NombreIcono =
  | 'trayectoria'
  | 'red'
  | 'cohete'
  | 'grafica'
  | 'objetivo'
  | 'orbita'
  | 'personas'
  | 'foco'
  | 'brujula'
  | 'calendario'
  | 'escudo'
  | 'mensaje';

const TRAZOS: Record<NombreIcono, React.ReactNode> = {
  // Una ruta que sale de un punto y llega a una meta.
  trayectoria: (
    <>
      <circle cx="5" cy="19" r="2" />
      <path d="M7 19c6 0 4-12 10-12" />
      <path d="M14.5 4.5 17.5 7l-3 2.5" />
      <circle cx="19" cy="7" r="0.6" fill="currentColor" />
    </>
  ),
  // Nodos conectados con uno central: un equipo coordinado.
  red: (
    <>
      <circle cx="12" cy="12" r="2.4" />
      <circle cx="4.5" cy="6" r="1.6" />
      <circle cx="19.5" cy="6" r="1.6" />
      <circle cx="4.5" cy="18" r="1.6" />
      <circle cx="19.5" cy="18" r="1.6" />
      <path d="m6 7 4 3.4M18 7l-4 3.4M6 17l4-3.4M18 17l-4-3.4" />
    </>
  ),
  cohete: (
    <>
      <path d="M12 2.5c3.2 2.2 5 5.6 5 9.5l-2 4H9l-2-4c0-3.9 1.8-7.3 5-9.5Z" />
      <circle cx="12" cy="9.5" r="1.8" />
      <path d="M9 16l-2.5 3.5M15 16l2.5 3.5M12 17v4.5" />
    </>
  ),
  grafica: (
    <>
      <path d="M3.5 20.5h17" />
      <path d="M6.5 17v-4M11 17V9.5M15.5 17v-6" />
      <path d="m5 9 5-4 4 3 5.5-5" />
      <path d="M16.5 3h3v3" />
    </>
  ),
  objetivo: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" />
      <path d="m12 12 8-8M17.5 4H20v2.5" />
    </>
  ),
  orbita: (
    <>
      <circle cx="12" cy="12" r="3" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(-28 12 12)" />
      <circle cx="19.6" cy="7.4" r="1" fill="currentColor" />
    </>
  ),
  personas: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M16.5 14.2c2.6.3 4.5 2.6 4.5 5.3" />
    </>
  ),
  foco: (
    <>
      <path d="M8.5 15.5A6 6 0 1 1 15.5 15.5c-.6.5-1 1.2-1 2H9.5c0-.8-.4-1.5-1-2Z" />
      <path d="M9.5 20.5h5M10.5 17.5v-3l1.5-1.5 1.5 1.5v3" />
    </>
  ),
  brujula: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  calendario: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="m9 15 2 2 4-4" />
    </>
  ),
  escudo: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.5 3 8 7.5 9.5 4.5-1.500 7.500-5 7.500-9.500V6L12 3Z" />
      <path d="m9 12 2.200 2.200L15.500 10" />
    </>
  ),
  mensaje: (
    <>
      <path d="M4 5.5h16v11H9l-5 4v-15Z" />
      <path d="M8 10h8M8 13h5" />
    </>
  ),
};

export default function Icono({
  nombre,
  className = '',
}: {
  nombre: NombreIcono;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {TRAZOS[nombre]}
    </svg>
  );
}
