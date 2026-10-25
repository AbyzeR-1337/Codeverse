// ИИ-помощник: локальный разбор (работает всегда) + чат с Claude (если указан ключ в настройках).
import { useRef, useState } from 'react';
import type { Lang } from '../content/types';
import { analyzeCode, explainError } from '../ai/explain';
import { askClaude, ChatMessage, describeClaudeError, hasClaude } from '../ai/claude';
import { traceCode } from '../runtime/runner';
import { Markdown } from './Markdown';
import { bump, weakTopics } from '../store/actions';
import { topicTitle } from '../content/topics';
import { navigate } from '../router';

export interface AiContext {
  lang: Lang;
  code: string;
  task?: string;
  lastError?: string;
  hints?: string[];
  stdin?: string[];
}

/** Таблица изменения переменных по шагам — «как меняются значения». */
async function variableTable(ctx: AiContext): Promise<string> {
  const res = await traceCode(ctx.lang, ctx.code, ctx.stdin ?? [], 400);
  const trace = res.trace ?? [];
  if (!trace.length) return res.error ? `Не удалось выполнить код по шагам: ${res.error}` : 'В программе нет шагов для показа.';
  const names = [...new Set(trace.flatMap((t) => t.vars.filter(([, v]) => v.type !== 'function').map(([k]) => k)))].slice(0, 6);
  const rows: string[] = [];
  let prev = '';
  for (const [i, t] of trace.entries()) {
    const vals = names.map((n) => t.vars.find(([k]) => k === n)?.[1].text ?? '—');
    const key = vals.join('|');
    if (key === prev) continue;
    prev = key;
    rows.push(`| ${i + 1} | ${t.line} | ${vals.map((v) => v.replace(/\|/g, '\\|').slice(0, 30)).join(' | ')} |`);
    if (rows.length >= 25) {
      rows.push(`| … | | ${names.map(() => '…').join(' | ')} |`);
      break;
    }
  }
  return `**Как меняются переменные по шагам** (показаны только шаги, где что-то изменилось):\n\n| шаг | строка | ${names.join(' | ')} |\n|---|---|${names.map(() => '---').join('|')}|\n${rows.join('\n')}\n\n${res.ok ? '✅ Программа завершилась.' : `⛔ Остановилась с ошибкой: ${res.error}`}\n\n> 💡 Открой пошаговый отладчик (кнопка 🐞), чтобы пройти по каждой строке и увидеть память.`;
}

function localAnswer(question: string, ctx: AiContext, hintLevel: number): string {
  const parts: string[] = [];
  const q = question.toLowerCase();
  if (ctx.lastError && (/ошиб|почему|не работ|error|сломал/.test(q) || !q)) {
    const ex = explainError(ctx.lastError, ctx.lang);
    parts.push(`### 🔎 ${ex.title}\n${ex.simple}\n\n**Как исправить:**\n${ex.fix.map((f) => `- ${f}`).join('\n')}`);
  }
  const issues = analyzeCode(ctx.code, ctx.lang);
  if (issues.length && (/провер|код|ошиб|не работ|почему|анализ/.test(q) || !q)) {
    parts.push(`### 🧐 Что я заметил в коде\n${issues.slice(0, 6).map((i) => `- Строка ${i.line}: ${i.message}`).join('\n')}`);
  }
  if (/подсказ|hint|как решить|не знаю|помоги|с чего начать/.test(q) || (!parts.length && ctx.hints?.length)) {
    if (ctx.hints?.length) {
      const shown = ctx.hints.slice(0, hintLevel + 1);
      parts.push(`### 💡 Подсказка ${Math.min(hintLevel + 1, ctx.hints.length)} из ${ctx.hints.length}\n${shown.map((h, i) => `${i + 1}. ${h}`).join('\n')}${hintLevel + 1 < ctx.hints.length ? '\n\n_Спроси ещё раз — дам следующую подсказку._' : ''}`);
    } else parts.push('### 💡 Как подойти к задаче\n1. Перечитай условие и выпиши, что дано и что нужно получить.\n2. Реши задачу на бумаге для маленького примера.\n3. Переведи каждый шаг в строку кода.\n4. Запусти и сравни с ожиданием — используй print/console.log для проверки промежуточных значений.');
  }
  if (/способ|иначе|альтернатив|оптимиз|быстрее/.test(q)) {
    parts.push('### 🔁 Другие способы решения\n- **Перебор** — проще всего написать, но может быть медленным (часто O(n²)).\n- **Словарь/множество** — запоминаем увиденное и ищем за O(1); типичный путь к O(n).\n- **Два указателя** — для отсортированных данных.\n- **Встроенные функции** (`sum`, `max`, `sorted`, `map/filter`) — короче и понятнее.\n\nПопробуй переписать решение одним из способов и сравни время в режиме собеседования.');
  }
  const weak = weakTopics(3);
  if (/слаб|что повторить|рекоменд|похож/.test(q)) {
    parts.push(weak.length ? `### 🎯 Твои слабые темы\n${weak.map((w) => `- **${topicTitle(w.topic)}** — ошибок ${w.fail} из ${w.ok + w.fail}`).join('\n')}\n\nЯ добавил задания по этим темам в раздел [Тренировка](#/practice).` : 'Пока явных слабых тем нет — так держать! Загляни в [Тренировку](#/practice) за свежими заданиями.');
  }
  if (!parts.length) {
    parts.push('Я локальный помощник: умею объяснять ошибки, проверять код на типичные промахи, давать подсказки по шагам, показывать изменение переменных и подбирать задания на слабые темы.\n\nПопробуй спросить:\n- «Почему ошибка?»\n- «Дай подсказку»\n- «Покажи переменные по шагам»\n- «Какие есть другие способы?»\n- «Что мне повторить?»\n\n> 💡 Для свободного диалога добавь ключ Claude API в [Настройках](#/settings).');
  }
  return parts.join('\n\n');
}

export function AiAssistant({ ctx, compact = false }: { ctx: AiContext; compact?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const hintLevel = useRef(0);
  const abort = useRef<AbortController | null>(null);

  const ask = async (question: string) => {
    if (busy) return;
    bump('ai_questions');
    const userMsg: ChatMessage = { role: 'user', content: question || 'Помоги разобраться' };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      if (/перемен|по шаг|таблиц|трасс/.test(question.toLowerCase())) {
        const table = await variableTable(ctx);
        setMessages([...next, { role: 'assistant', content: table }]);
      } else if (hasClaude()) {
        const context = `Контекст из CodeVerse.\nЯзык: ${ctx.lang === 'js' ? 'JavaScript' : 'Python'}\n${ctx.task ? `Задание: ${ctx.task}\n` : ''}Код ученика:\n\`\`\`${ctx.lang === 'js' ? 'js' : 'python'}\n${ctx.code}\n\`\`\`\n${ctx.lastError ? `Последняя ошибка: ${ctx.lastError}\n` : ''}Слабые темы ученика: ${weakTopics(3).map((w) => topicTitle(w.topic)).join(', ') || 'нет данных'}`;
        abort.current = new AbortController();
        let acc = '';
        setMessages([...next, { role: 'assistant', content: '…' }]);
        const full = await askClaude(next, context, (d) => {
          acc += d;
          setMessages([...next, { role: 'assistant', content: acc }]);
        }, abort.current.signal);
        setMessages([...next, { role: 'assistant', content: full || acc }]);
      } else {
        const answer = localAnswer(question, ctx, hintLevel.current);
        if (/подсказ|hint|помоги|как решить/.test(question.toLowerCase())) hintLevel.current++;
        setMessages([...next, { role: 'assistant', content: answer }]);
      }
    } catch (e) {
      setMessages([...next, { role: 'assistant', content: `⚠️ ${describeClaudeError(e)}\n\n${localAnswer(question, ctx, hintLevel.current)}` }]);
    } finally {
      setBusy(false);
      abort.current = null;
    }
  };

  const quick = ['Почему ошибка?', 'Дай подсказку', 'Покажи переменные по шагам', 'Другие способы решения', 'Что мне повторить?'];

  return (
    <div className={`ai-panel ${compact ? 'compact' : ''}`}>
      <div className="ai-head">
        <span className="ai-avatar">🤖</span>
        <div>
          <b>ИИ-наставник</b>
          <div className="muted small">{hasClaude() ? 'Claude подключён' : 'Локальный режим · '}{!hasClaude() && <a href="#/settings" onClick={(e) => (e.preventDefault(), navigate('/settings'))}>подключить Claude</a>}</div>
        </div>
      </div>
      <div className="ai-messages">
        {messages.length === 0 && <div className="muted small">Спроси что угодно о своём коде. Я не дам готовый ответ сразу — сначала помогу дойти до него самому 😉</div>}
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ai-${m.role}`}>
            {m.role === 'assistant' ? <Markdown md={m.content} /> : m.content}
          </div>
        ))}
        {busy && !hasClaude() && <div className="ai-msg ai-assistant typing">думаю…</div>}
      </div>
      <div className="ai-quick">
        {quick.map((q) => (
          <button key={q} className="chip" onClick={() => void ask(q)} disabled={busy}>
            {q}
          </button>
        ))}
      </div>
      <form
        className="ai-input"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input.trim());
        }}
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Задай вопрос…" aria-label="Вопрос помощнику" />
        {busy && abort.current ? (
          <button type="button" className="btn btn-sm" onClick={() => abort.current?.abort()}>■</button>
        ) : (
          <button className="btn btn-sm btn-primary" disabled={busy}>➤</button>
        )}
      </form>
    </div>
  );
}
