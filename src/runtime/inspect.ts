// Превращение значений JS в читаемую строку (как в консоли браузера) + «адреса» объектов для просмотра памяти.

export function inspect(v: unknown, depth = 0, seen = new WeakSet<object>()): string {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  const t = typeof v;
  if (t === 'string') return depth === 0 ? (v as string) : JSON.stringify(v);
  if (t === 'number' || t === 'boolean' || t === 'bigint') return String(v) + (t === 'bigint' ? 'n' : '');
  if (t === 'symbol') return (v as symbol).toString();
  if (t === 'function') {
    const f = v as { name?: string; toString(): string };
    return f.toString().startsWith('class') ? `[class ${f.name || 'anonymous'}]` : `[Function: ${f.name || 'anonymous'}]`;
  }
  const o = v as object;
  if (seen.has(o)) return '[Circular]';
  if (depth > 3) return Array.isArray(o) ? '[Array]' : '[Object]';
  seen.add(o);
  try {
    if (o instanceof Error) return `${o.name}: ${o.message}`;
    if (o instanceof Date) return o.toISOString();
    if (o instanceof RegExp) return o.toString();
    if (o instanceof Map) return `Map(${o.size}) {${[...o].map(([k, val]) => `${inspect(k, depth + 1, seen)} => ${inspect(val, depth + 1, seen)}`).join(', ')}}`;
    if (o instanceof Set) return `Set(${o.size}) {${[...o].map((x) => inspect(x, depth + 1, seen)).join(', ')}}`;
    if (Array.isArray(o)) {
      const items = o.slice(0, 100).map((x) => inspect(x, depth + 1, seen));
      if (o.length > 100) items.push(`... ещё ${o.length - 100}`);
      return `[${items.join(', ')}]`;
    }
    if (typeof Promise !== 'undefined' && o instanceof Promise) return 'Promise { <pending> }';
    const ctor = (o as { constructor?: { name?: string } }).constructor?.name;
    const entries = Object.entries(o).slice(0, 50).map(([k, val]) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${inspect(val, depth + 1, seen)}`);
    const prefix = ctor && ctor !== 'Object' ? `${ctor} ` : '';
    return entries.length ? `${prefix}{ ${entries.join(', ')} }` : `${prefix}{}`;
  } finally {
    seen.delete(o);
  }
}

/** Значение для отладчика: примитивы — значением, объекты — ссылкой на «кучу». */
export interface DbgValue {
  type: string;
  text: string;
  ref?: number;
}

export class HeapTracker {
  private ids = new WeakMap<object, number>();
  private next = 1;
  idOf(o: object) {
    let id = this.ids.get(o);
    if (!id) {
      id = this.next++;
      this.ids.set(o, id);
    }
    return id;
  }
  describe(v: unknown): DbgValue {
    if (v !== null && (typeof v === 'object' || typeof v === 'function')) {
      const type = Array.isArray(v) ? 'array' : typeof v === 'function' ? 'function' : (v as object).constructor?.name ?? 'object';
      return { type, text: inspect(v, 1), ref: this.idOf(v as object) };
    }
    return { type: v === null ? 'null' : typeof v, text: inspect(v, 1) };
  }
}
