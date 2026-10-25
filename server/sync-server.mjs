// Сервер синхронизации прогресса CodeVerse между устройствами.
// Без зависимостей: node server/sync-server.mjs  (PORT=8787, DATA_DIR=./server/data)
// Данные хранятся JSON-файлом на каждый секретный код синхронизации.
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const PORT = Number(process.env.PORT ?? 8787);
const DATA_DIR = process.env.DATA_DIR ?? new URL('./data/', import.meta.url).pathname;
const MAX_BODY = 5 * 1024 * 1024;

await mkdir(DATA_DIR, { recursive: true });

// Имя файла — хеш токена, чтобы токен не лежал на диске открытым текстом.
const fileFor = (token) => join(DATA_DIR, createHash('sha256').update(token).digest('hex') + '.json');

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...cors });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204);
  const m = req.url?.match(/^\/sync\/([\w-]{8,128})$/);
  if (!m) return send(res, 404, { error: 'Not found. Используй /sync/<токен>' });
  const file = fileFor(m[1]);

  if (req.method === 'GET') {
    try {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', ...cors });
      return res.end(await readFile(file));
    } catch {
      return send(res, 404, { error: 'Нет данных' });
    }
  }

  if (req.method === 'PUT') {
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_BODY) return send(res, 413, { error: 'Слишком большой объём данных' });
      chunks.push(chunk);
    }
    try {
      const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (!data || typeof data !== 'object' || !data.state) return send(res, 400, { error: 'Ожидается { state, files }' });
      const tmp = file + '.tmp';
      await writeFile(tmp, JSON.stringify(data));
      await rename(tmp, file);
      return send(res, 200, { ok: true, savedAt: Date.now() });
    } catch {
      return send(res, 400, { error: 'Некорректный JSON' });
    }
  }

  send(res, 405, { error: 'Method not allowed' });
}).listen(PORT, () => console.log(`CodeVerse sync server: http://localhost:${PORT}/sync/<token>`));
