/**
 * Pruebas del freno de fuerza bruta del login. Se corre con: npm run probar:intentos
 */
import { bloqueoRestante, registrarFallo, registrarExito } from '../src/lib/intentos.ts';

let fallos = 0;
const verificar = (t: string, ok: boolean) => { if (!ok) fallos++; console.log(`${ok ? '  ok  ' : ' FALLA'} ${t}`); };

console.log('\nFreno de intentos\n');
const t0 = 1_000_000;
verificar('sin historial no hay bloqueo', bloqueoRestante('a', t0) === 0);
for (let i = 0; i < 4; i++) registrarFallo('a', t0 + i);
verificar('4 fallos todavía dejan intentar', bloqueoRestante('a', t0 + 5) === 0);
registrarFallo('a', t0 + 5);
verificar('el 5° fallo bloquea ~15 min', bloqueoRestante('a', t0 + 6) > 14 * 60);
verificar('otra IP no se ve afectada', bloqueoRestante('b', t0 + 6) === 0);
verificar('pasados 15 min se libera', bloqueoRestante('a', t0 + 5 + 15 * 60 * 1000 + 1) === 0);
for (let i = 0; i < 3; i++) registrarFallo('c', t0);
registrarExito('c');
registrarFallo('c', t0 + 1);
verificar('un acierto reinicia el conteo', bloqueoRestante('c', t0 + 2) === 0);
for (let i = 0; i < 3; i++) registrarFallo('d', t0);
for (let i = 0; i < 3; i++) registrarFallo('d', t0 + 16 * 60 * 1000);
verificar('fallos viejos (fuera de la ventana) no cuentan', bloqueoRestante('d', t0 + 16 * 60 * 1000 + 1) === 0);

if (fallos) { console.log(`\n${fallos} prueba(s) fallaron.`); process.exit(1); }
console.log('\nTodas las pruebas pasaron.');
