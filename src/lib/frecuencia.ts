/**
 * Freno de frecuencia por IP, en memoria.
 *
 * Es por instancia: en serverless cada instancia lleva su propia cuenta, así
 * que no es un muro, es un tope que vuelve caro el abuso más burdo (un bucle de
 * curl contra /api/registro). Para un límite compartido de verdad, la regla de
 * rate limit del firewall de Vercel sobre la misma ruta.
 */
const ventanas = new Map<string, number[]>();

/** true si esta petición cabe; false si la IP ya agotó su cupo en la ventana. */
export function cabe(
  clave: string,
  maximo: number,
  ventanaMs: number,
  ahora = Date.now(),
): boolean {
  const recientes = (ventanas.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);
  if (recientes.length >= maximo) {
    ventanas.set(clave, recientes);
    return false;
  }
  recientes.push(ahora);
  ventanas.set(clave, recientes);

  // Que el mapa no crezca sin fin en una instancia longeva.
  if (ventanas.size > 5000) {
    for (const [k, v] of ventanas) {
      if (v.every((t) => ahora - t >= ventanaMs)) ventanas.delete(k);
    }
  }
  return true;
}
