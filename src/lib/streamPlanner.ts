import { resetPlanModel } from '../data/planStore';
import {
  describeBoard,
  runExplainCriticalPath,
  runGetWorkOrder,
  runLookupGlossary,
  runResourceSlack,
  runUpdateScheduleBlock,
  type ToolTrace,
} from '../tools/planningTools';

export type StreamEvent =
  | { type: 'tool'; tool: ToolTrace }
  | { type: 'text'; text: string };

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

async function emitText(
  text: string,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const tokens = text.split(/(\s+)/);
  for (const token of tokens) {
    if (!token) continue;
    onEvent({ type: 'text', text: token });
    await sleep(token.trim() ? 18 : 8, signal);
  }
}

function emitTool(
  onEvent: (event: StreamEvent) => void,
  name: ToolTrace['name'],
  args: ToolTrace['args'],
  result: string,
): void {
  onEvent({ type: 'tool', tool: { name, args, result } });
}

function pickWorkOrder(text: string): string {
  const match = text.toUpperCase().match(/WO-\d+/);
  return match ? match[0] : 'WO-1842';
}

function pickHours(text: string): number {
  const match = text.match(/(-?\d+(?:\.\d+)?)\s*(?:h|hour)/i);
  if (match) return Number(match[1]);
  if (/\btwo\b/i.test(text)) return 2;
  if (/\bthree\b/i.test(text)) return 3;
  return 2;
}

export async function streamPlannerTurn(
  userText: string,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const text = userText.trim();
  const lower = text.toLowerCase();

  if (!text) {
    await emitText('Ask about a work order, a glossary term, or a schedule change.', onEvent, signal);
    return;
  }

  if (/\b(reset|restore|original)\b/.test(lower) && /\b(plan|board|schedule)\b/.test(lower)) {
    resetPlanModel();
    await emitText('Sample plan restored to the 14 Aug 06:00 baseline.', onEvent, signal);
    return;
  }

  if (/\b(slack|idle hours|utilization|remaining capacity|free hours)\b/.test(lower)) {
    const result = runResourceSlack();
    emitTool(onEvent, 'reportResourceSlack', { horizonHours: 16 }, result);
    await emitText(result, onEvent, signal);
    return;
  }

  if (/\b(glossary|what is|what's|define|mean by|atp|mrp|mps|heijunka|fai|cmm|finite capacity|bottleneck)\b/.test(lower)) {
    const term = text.replace(/^(what is|what's|define|mean by)\s+/i, '');
    const result = runLookupGlossary(term);
    emitTool(onEvent, 'lookupGlossary', { term }, result);
    await emitText(`${result}\n\n${describeBoard()}`, onEvent, signal);
    return;
  }

  if (/\b(critical path|promise date|promise)\b/.test(lower) || /\bwo-1842\b/i.test(text) && /\b(when|date|finish)\b/.test(lower)) {
    const path = runExplainCriticalPath();
    emitTool(onEvent, 'explainCriticalPath', { workOrder: 'WO-1842' }, path);
    const wo = runGetWorkOrder('WO-1842');
    emitTool(onEvent, 'getWorkOrder', { workOrder: 'WO-1842' }, wo);
    await emitText(path, onEvent, signal);
    return;
  }

  if (/\b(slips?|loses?|lost|late|delay|stretch|shift|move|push|update|reschedule)\b/.test(lower)) {
    const wo = pickWorkOrder(text);
    const hours = pickHours(text);
    const stretch = /\b(loses?|lost|stretch|extra)\b/.test(lower);
    const result = runUpdateScheduleBlock({
      workOrder: wo,
      stretchHours: stretch ? hours : 0,
      hoursDelta: stretch ? 0 : hours,
    });
    emitTool(onEvent, 'updateScheduleBlock', { workOrder: wo, hours }, result);
    const path = runExplainCriticalPath();
    emitTool(onEvent, 'explainCriticalPath', { workOrder: wo }, path);
    await emitText(`${result}\n\n${path}`, onEvent, signal);
    return;
  }

  if (/\bwo-\d+\b/i.test(text) || /\bwork order\b/.test(lower)) {
    const wo = pickWorkOrder(text);
    const result = runGetWorkOrder(wo);
    emitTool(onEvent, 'getWorkOrder', { workOrder: wo }, result);
    await emitText(result, onEvent, signal);
    return;
  }

  const overview = describeBoard();
  const path = runExplainCriticalPath();
  emitTool(onEvent, 'explainCriticalPath', { workOrder: 'WO-1842' }, path);
  await emitText(
    `${overview}\n\n${path}\n\nTry: “Where is the slack on this board?” or “Define ATP.”`,
    onEvent,
    signal,
  );
}
