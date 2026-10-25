// Подключение ИИ-наставника через Claude API (по ключу, который ученик указал в настройках).
// Ключ хранится только локально в браузере и никогда не отправляется на сервер синхронизации.
import type Anthropic from '@anthropic-ai/sdk';
import { getState } from '../store/progress';

export const TUTOR_SYSTEM = `Ты — ИИ-наставник платформы CodeVerse, которая учит программированию с нуля (JavaScript, Python, алгоритмы).
Отвечай на русском языке, простыми словами, как терпеливый преподаватель.
Правила:
- Не выдавай готовое решение задачи сразу. Сначала дай наводящую подсказку, затем — более конкретную. Полное решение — только если ученик прямо просит его после попыток.
- Объясняя ошибку, укажи строку, причину простыми словами и как исправить.
- Когда полезно, показывай изменение переменных по шагам в виде небольшой таблицы.
- Предлагай похожую мини-задачу для закрепления.
- Код оформляй блоками \`\`\`js или \`\`\`python. Будь краток: 3–10 предложений, если не просят подробнее.`;

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function hasClaude() {
  return !!getState().settings.aiKey;
}

/** Потоковый ответ наставника. onText вызывается по мере генерации. */
export async function askClaude(history: ChatMessage[], context: string, onText: (delta: string) => void, signal?: AbortSignal): Promise<string> {
  const { aiKey, aiModel } = getState().settings;
  const { default: AnthropicClient } = await import('@anthropic-ai/sdk');
  const client: Anthropic = new AnthropicClient({ apiKey: aiKey, dangerouslyAllowBrowser: true });
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));
  if (context && messages.length) {
    const last = messages[messages.length - 1];
    messages[messages.length - 1] = { role: last.role, content: `${context}\n\n---\nВопрос ученика: ${String(last.content)}` };
  }
  const stream = client.beta.messages.stream(
    {
      model: aiModel || 'claude-opus-5-5',
      max_tokens: 16000,
      system: TUTOR_SYSTEM,
      output_config: { effort: 'medium' },
      // При отказе по соображениям безопасности сервер сам переадресует запрос подходящей модели.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages,
    },
    { signal },
  );
  stream.on('text', onText);
  const final = await stream.finalMessage();
  if (final.stop_reason === 'refusal') return 'Наставник не может ответить на этот запрос. Попробуй переформулировать вопрос.';
  return final.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
}

export function describeClaudeError(e: unknown): string {
  const err = e as { status?: number; message?: string; name?: string };
  if (err?.name === 'AbortError') return 'Ответ остановлен.';
  if (err?.status === 401) return 'Неверный API-ключ. Проверь его в Настройках.';
  if (err?.status === 429) return 'Слишком много запросов. Подожди немного и попробуй снова.';
  if (err?.status === 529 || (err?.status ?? 0) >= 500) return 'Сервис временно перегружен. Попробуй через минуту.';
  return `Не удалось получить ответ: ${err?.message ?? String(e)}`;
}
