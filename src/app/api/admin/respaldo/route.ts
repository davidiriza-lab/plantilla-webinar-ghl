/**
 * GET /api/admin/respaldo — descarga un CSV con todos los contactos del
 * webinar (los que llevan la etiqueta general de registro) y sus etiquetas.
 *
 * Es el respaldo del embudo: GHL es la única base de datos, y si alguien
 * borra contactos o una etiqueta, esto es lo que permite recuperarlos.
 * Requiere sesión del panel. Se descarga desde el botón "Descargar respaldo".
 */
import { NextResponse } from 'next/server';
import { haySesion } from '@/lib/auth';
import { leerConfig } from '@/lib/config';
import { listarContactosPorEtiqueta } from '@/lib/ghl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const celda = (v: unknown): string => {
  let t = v === undefined || v === null ? '' : String(v);
  // El nombre y la fuente vienen de un formulario público. Excel ejecuta como
  // fórmula lo que empieza con = + - @: el apóstrofo lo vuelve texto.
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return /[",\n;]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

export async function GET(): Promise<NextResponse> {
  if (!(await haySesion())) {
    return NextResponse.json({ ok: false, error: 'Sin sesión.' }, { status: 401 });
  }

  const config = await leerConfig();
  const etiqueta = config.etiquetaRegistro.trim() || 'registro webinar';
  const campoFuente = process.env.GHL_CAMPO_FUENTE_ID;
  const campoFecha = process.env.GHL_CAMPO_FECHA_CLASE_ID;

  let contactos;
  try {
    contactos = await listarContactosPorEtiqueta(etiqueta);
  } catch (error) {
    console.error('Falló el respaldo:', error);
    return NextResponse.json(
      { ok: false, error: 'GoHighLevel no respondió. Inténtalo en un momento.' },
      { status: 502 },
    );
  }

  const filas = [
    ['nombre', 'email', 'telefono', 'registrado_el', 'fuente', 'fecha_de_su_clase', 'etiquetas', 'id_ghl'],
    ...contactos.map((c) => {
      const campo = (id?: string) =>
        id ? (c.customFields ?? []).find((f) => f.id === id)?.value ?? '' : '';
      return [
        c.contactName ?? [c.firstName, c.lastName].filter(Boolean).join(' '),
        c.email ?? '',
        c.phone ?? '',
        c.dateAdded ?? '',
        campo(campoFuente),
        campo(campoFecha),
        (c.tags ?? []).join(' | '),
        c.id,
      ];
    }),
  ];

  const csv = '\ufeff' + filas.map((f) => f.map(celda).join(',')).join('\r\n');
  const fecha = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="respaldo-webinar-${fecha}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
