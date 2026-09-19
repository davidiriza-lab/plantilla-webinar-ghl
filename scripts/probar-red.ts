/**
 * Pruebas de `fetchGhl`: timeout y reintento.
 * Se corre con:  npm run probar:red
 *
 * Levanta un servidor local que se porta como GHL en sus peores días y
 * comprueba que el cliente reintenta lo transitorio y no lo demás.
 */
import { createServer } from 'node:http';
import { fetchGhl } from '../src/lib/red.ts';

let fallos = 0;
function verificar(titulo: string, ok: boolean, detalle = ''): void {
  if (!ok) fallos++;
  console.log(`${ok ? '  ok  ' : ' FALLA'} ${titulo}${detalle ? `  (${detalle})` : ''}`);
}

const golpes: Record<string, number> = {};
const server = createServer((req, res) => {
  const ruta = req.url ?? '/';
  golpes[ruta] = (golpes[ruta] ?? 0) + 1;
  const n = golpes[ruta];

  if (ruta === '/ok') return res.writeHead(200).end('{"ok":true}');
  if (ruta === '/503-luego-ok') return n === 1 ? res.writeHead(503).end() : res.writeHead(200).end('{}');
  if (ruta === '/429-siempre') return res.writeHead(429).end();
  if (ruta === '/400') return res.writeHead(400).end('malo');
  if (ruta === '/401') return res.writeHead(401).end();
  if (ruta === '/lento') return; // nunca responde: fuerza el timeout
  res.writeHead(404).end();
});

await new Promise<void>((r) => server.listen(0, r));
const puerto = (server.address() as { port: number }).port;
const base = `http://127.0.0.1:${puerto}`;

console.log('\nfetchGhl — timeout y reintento\n');

const ok = await fetchGhl(`${base}/ok`);
verificar('200 responde a la primera', ok.status === 200 && golpes['/ok'] === 1);

const rec = await fetchGhl(`${base}/503-luego-ok`);
verificar('503 y luego 200: reintenta una vez y sale bien', rec.status === 200 && golpes['/503-luego-ok'] === 2);

let lanzo = false;
try { await fetchGhl(`${base}/429-siempre`); } catch { lanzo = true; }
verificar('429 dos veces: dos intentos y lanza', lanzo && golpes['/429-siempre'] === 2);

const malo = await fetchGhl(`${base}/400`);
verificar('400 no se reintenta (un solo golpe)', malo.status === 400 && golpes['/400'] === 1);

const sinToken = await fetchGhl(`${base}/401`);
verificar('401 no se reintenta (un solo golpe)', sinToken.status === 401 && golpes['/401'] === 1);

// El timeout real son 8 s por intento: aquí no se espera 16 s, solo se
// comprueba que el servidor recibió los dos intentos y que se lanzó.
const inicio = Date.now();
let timeout = false;
try { await fetchGhl(`${base}/lento`); } catch (e) { timeout = e instanceof Error && /timeout|abort/i.test(e.name + e.message); }
const tardo = Date.now() - inicio;
verificar('sin respuesta: dos intentos, lanza por timeout', timeout && golpes['/lento'] === 2, `${Math.round(tardo / 1000)} s`);

server.closeAllConnections();
server.close();

if (fallos > 0) { console.log(`\n${fallos} prueba(s) fallaron.`); process.exit(1); }
console.log('\nTodas las pruebas pasaron.');
