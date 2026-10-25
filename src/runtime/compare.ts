// Сравнение результата программы с ожидаемым (общий код для JS- и Python-песочниц).

export function normalizeOut(s: string) {
  return s.replace(/\r/g, '').split('\n').map((l) => l.trimEnd()).join('\n').trim();
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9;
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

/** json=true: сравниваем значения выражения как JSON; иначе — текст вывода. */
export function sameResult(got: string, expected: string, json: boolean) {
  if (!json) return normalizeOut(got) === normalizeOut(expected);
  try {
    return deepEqual(JSON.parse(got), JSON.parse(expected));
  } catch {
    return got.trim() === expected.trim();
  }
}
