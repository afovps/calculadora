#!/usr/bin/env node
// Servidor local de Control de Gastos. Sin dependencias: solo necesita Node.js.
// Uso: node server.js [puerto] [--solo-local] [--no-abrir]
//   --solo-local  acepta conexiones solo desde este equipo (no desde el móvil)
//   --no-abrir    no abre el navegador al arrancar
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const DIR = __dirname;
const DATOS = path.join(DIR, 'datos');
const TICKETS = path.join(DATOS, 'tickets');
const COPIAS = path.join(DATOS, 'copias');
const FICHERO = path.join(DATOS, 'datos.json');

const args = process.argv.slice(2);
const SOLO_LOCAL = args.includes('--solo-local');
const NO_ABRIR = args.includes('--no-abrir');
let puerto = parseInt(args.find(a => /^\d+$/.test(a)) || process.env.PORT || '8080', 10);

const ESTATICOS = { '/': 'index.html', '/index.html': 'index.html', '/manifest.json': 'manifest.json', '/icon.svg': 'icon.svg', '/sw.js': 'sw.js',
  '/apple-touch-icon.png': 'apple-touch-icon.png', '/icon-192.png': 'icon-192.png', '/icon-512.png': 'icon-512.png' };
// Archivos que forman la app completa para compartir (sin datos)
const APP = ['index.html', 'server.js', 'manifest.json', 'sw.js', 'icon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'LEEME.txt', 'iniciar-windows.bat', 'iniciar-mac.command', 'iniciar-linux.sh'];
const TIPOS = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.js': 'text/javascript; charset=utf-8' };
const ID = /^[A-Za-z0-9_-]{1,64}$/;
const URL_TICKET = /^tickets\/[A-Za-z0-9_-]{1,64}\.jpg(\?v=[a-z0-9]+)?$/;
const MAX_CUERPO = 25 * 1024 * 1024;

// ---------- Datos ----------
fs.mkdirSync(TICKETS, { recursive: true });
fs.mkdirSync(COPIAS, { recursive: true });
let D = { gastos: [], fijos: [], ajustes: null };
if (fs.existsSync(FICHERO)) {
  try {
    D = { ...D, ...JSON.parse(fs.readFileSync(FICHERO, 'utf8')) };
  } catch (e) {
    console.error(`\n✖ No se puede leer ${FICHERO}: ${e.message}`);
    console.error('  Restaura una copia de datos/copias/ y vuelve a arrancar.\n');
    process.exit(1);
  }
  // Una copia automática al día; se conservan las 30 más recientes
  const copia = path.join(COPIAS, `datos-${new Date().toISOString().slice(0, 10)}.json`);
  if (!fs.existsSync(copia)) fs.copyFileSync(FICHERO, copia);
  fs.readdirSync(COPIAS).filter(f => f.endsWith('.json')).sort().slice(0, -30)
    .forEach(f => fs.unlinkSync(path.join(COPIAS, f)));
}

function guardar() {
  const tmp = FICHERO + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(D));
  fs.renameSync(tmp, FICHERO);
}

// Las fotos llegan como data URL y se guardan como archivo en datos/tickets/
function guardarFoto(id, foto) {
  const archivo = path.join(TICKETS, id + '.jpg');
  if (typeof foto === 'string' && foto.startsWith('data:image/')) {
    fs.writeFileSync(archivo, Buffer.from(foto.slice(foto.indexOf(',') + 1), 'base64'));
    return `tickets/${id}.jpg?v=${Date.now().toString(36)}`;
  }
  if (typeof foto === 'string' && URL_TICKET.test(foto) && fs.existsSync(archivo)) return foto;
  fs.rmSync(archivo, { force: true });
  return null;
}

// ---------- ZIP (sin compresión) para compartir la app completa ----------
const CRC = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xEDB88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(buf) {
  let c = ~0;
  for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8);
  return (~c) >>> 0;
}
function zip(archivos) {
  const partes = [], central = [];
  let offset = 0;
  for (const { nombre, datos, ejecutable } of archivos) {
    const n = Buffer.from(nombre), crc = crc32(datos), len = datos.length;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0x21, 12); local.writeUInt32LE(crc, 14); local.writeUInt32LE(len, 18);
    local.writeUInt32LE(len, 22); local.writeUInt16LE(n.length, 26);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(0x0314, 4); cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0x0800, 8); cen.writeUInt16LE(0x21, 14); cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(len, 20); cen.writeUInt32LE(len, 24); cen.writeUInt16LE(n.length, 28);
    cen.writeUInt32LE(((ejecutable ? 0o100755 : 0o100644) << 16) >>> 0, 38); cen.writeUInt32LE(offset, 42);
    partes.push(local, n, datos);
    central.push(cen, n);
    offset += 30 + n.length + len;
  }
  const cd = Buffer.concat(central), fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50, 0); fin.writeUInt16LE(archivos.length, 8); fin.writeUInt16LE(archivos.length, 10);
  fin.writeUInt32LE(cd.length, 12); fin.writeUInt32LE(offset, 16);
  return Buffer.concat([...partes, cd, fin]);
}

// ---------- HTTP ----------
function direcciones() {
  if (SOLO_LOCAL) return [];
  return Object.values(os.networkInterfaces()).flat()
    .filter(i => i && i.family === 'IPv4' && !i.internal)
    .map(i => `http://${i.address}:${puerto}/`);
}
function json(res, datos, estado = 200) {
  res.writeHead(estado, { 'Content-Type': TIPOS['.json'], 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(datos));
}
function cuerpo(req) {
  return new Promise((ok, ko) => {
    const trozos = [];
    let total = 0;
    req.on('data', c => {
      total += c.length;
      if (total > MAX_CUERPO) { ko(Object.assign(new Error('Demasiado grande'), { estado: 413 })); req.destroy(); }
      else trozos.push(c);
    });
    req.on('end', () => {
      try { ok(JSON.parse(Buffer.concat(trozos).toString('utf8'))); }
      catch { ko(Object.assign(new Error('JSON no válido'), { estado: 400 })); }
    });
    req.on('error', ko);
  });
}

async function api(req, res, ruta) {
  const [col, id] = ruta.split('/');
  const m = req.method;
  if (m === 'GET' && col === 'estado') return json(res, { app: 'control-gastos', direcciones: direcciones() });
  if (m === 'GET' && col === 'datos') return json(res, D);
  if (m === 'DELETE' && col === 'datos') {
    D.gastos = []; D.fijos = [];
    fs.rmSync(TICKETS, { recursive: true, force: true });
    fs.mkdirSync(TICKETS, { recursive: true });
    guardar();
    return json(res, { ok: true });
  }
  if (m === 'GET' && col === 'app.zip') {
    const archivos = APP.filter(f => fs.existsSync(path.join(DIR, f))).map(f => ({
      nombre: 'control-gastos/' + f, datos: fs.readFileSync(path.join(DIR, f)), ejecutable: /\.(sh|command)$/.test(f)
    }));
    res.writeHead(200, { 'Content-Type': 'application/zip', 'Content-Disposition': 'attachment; filename="control-gastos.zip"' });
    return res.end(zip(archivos));
  }
  if (m === 'PUT' && col === 'ajustes') {
    const v = await cuerpo(req);
    D.ajustes = v && typeof v === 'object' ? v : null;
    guardar();
    return json(res, D.ajustes || {});
  }
  if ((col === 'gastos' || col === 'fijos') && ID.test(id || '')) {
    if (m === 'PUT') {
      const v = await cuerpo(req);
      if (!v || typeof v !== 'object' || Array.isArray(v)) return json(res, { error: 'Datos no válidos' }, 400);
      v.id = id;
      if (col === 'gastos') v.foto = guardarFoto(id, v.foto);
      D[col] = D[col].filter(x => x.id !== id).concat(v);
      guardar();
      return json(res, v);
    }
    if (m === 'DELETE') {
      D[col] = D[col].filter(x => x.id !== id);
      if (col === 'gastos') guardarFoto(id, null);
      guardar();
      return json(res, { ok: true });
    }
  }
  json(res, { error: 'No encontrado' }, 404);
}

function servirArchivo(res, archivo, cache) {
  fs.readFile(archivo, (err, datos) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream', 'Cache-Control': cache });
    res.end(datos);
  });
}

const servidor = http.createServer(async (req, res) => {
  try {
    const ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (ruta.startsWith('/api/')) return await api(req, res, ruta.slice(5));
    if (ESTATICOS[ruta]) return servirArchivo(res, path.join(DIR, ESTATICOS[ruta]), 'no-cache');
    const t = ruta.match(/^\/tickets\/([A-Za-z0-9_-]{1,64}\.jpg)$/);
    if (t) return servirArchivo(res, path.join(TICKETS, t[1]), 'private, max-age=31536000');
    res.writeHead(404); res.end('No encontrado');
  } catch (e) {
    if (!res.headersSent) json(res, { error: e.message }, e.estado || 500);
    if (!e.estado) console.error(e);
  }
});

let intentos = 0;
servidor.on('error', e => {
  if (e.code === 'EADDRINUSE' && intentos++ < 10) { puerto++; return servidor.listen(puerto, SOLO_LOCAL ? '127.0.0.1' : '0.0.0.0'); }
  console.error('✖ No se pudo arrancar el servidor:', e.message);
  process.exit(1);
});
servidor.on('listening', () => {
  const local = `http://localhost:${puerto}/`;
  console.log('\n  💶 Control de Gastos en marcha\n');
  console.log(`  En este equipo:  ${local}`);
  for (const u of direcciones()) console.log(`  Desde el móvil:  ${u}   (misma Wi-Fi)`);
  console.log(`\n  Datos guardados en: ${DATOS}`);
  console.log('  Para cerrar, pulsa Ctrl+C o cierra esta ventana.\n');
  if (!NO_ABRIR) {
    const cmd = process.platform === 'win32' ? `start "" "${local}"` : process.platform === 'darwin' ? `open "${local}"` : `xdg-open "${local}"`;
    exec(cmd, () => {});
  }
});
servidor.listen(puerto, SOLO_LOCAL ? '127.0.0.1' : '0.0.0.0');
