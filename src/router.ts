// Простой hash-роутер: #/learn, #/lesson/<id>, #/problem/<id> ...
// Hash-адреса работают и в PWA, и при открытии файла без сервера.
import { useSyncExternalStore } from 'react';

const read = () => location.hash.replace(/^#/, '') || '/';

export function navigate(path: string) {
  if (read() !== path) location.hash = path;
  window.scrollTo({ top: 0 });
}

export function useRoute() {
  const path = useSyncExternalStore(
    (cb) => {
      window.addEventListener('hashchange', cb);
      return () => window.removeEventListener('hashchange', cb);
    },
    read,
    () => '/',
  );
  const [pathname, query = ''] = path.split('?');
  return { path: pathname, parts: pathname.split('/').filter(Boolean), query: new URLSearchParams(query) };
}
