import { applyBlockChangeToModel } from '../../../pixi-gantt/src/core/applyBlockChange';
import type { GanttModel, GanttSegment } from '../../../pixi-gantt/src/core/types';
import { lookupGlossary } from '../data/glossary';
import { getPlanModel, setPlanModel } from '../data/planStore';
import { SHIFT_START } from '../data/samplePlan';

const HOUR = 3_600_000;

export type ToolName =
  | 'lookupGlossary'
  | 'getWorkOrder'
  | 'explainCriticalPath'
  | 'updateScheduleBlock'
  | 'reportResourceSlack';

export type ToolTrace = {
  name: ToolName;
  args: Record<string, string | number>;
  result: string;
};

export const PLANNING_TOOLS: Array<{ name: ToolName; description: string }> = [
  { name: 'lookupGlossary', description: 'Define an SCP term used on the board (WO, FS, ATP, bottleneck).' },
  { name: 'getWorkOrder', description: 'List operations and times for a work order on the sample plan.' },
  { name: 'explainCriticalPath', description: 'Walk the FS chain that sets the WO-1842 promise.' },
  { name: 'updateScheduleBlock', description: 'Shift or stretch a sample block; the gantt redraws immediately.' },
  { name: 'reportResourceSlack', description: 'Hours loaded vs the 16h sample horizon on each lane — finite-capacity slack.' },
];

function formatClock(ms: number): string {
  const d = new Date(ms);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function segmentsForWo(model: GanttModel, wo: string): GanttSegment[] {
  const needle = wo.toUpperCase();
  return model.segments.filter((seg) => (seg.label ?? '').toUpperCase().includes(needle));
}

export function runLookupGlossary(term: string): string {
  const hits = lookupGlossary(term);
  return hits.map((entry) => `${entry.term}: ${entry.definition}`).join('\n');
}

export function runGetWorkOrder(wo: string): string {
  const model = getPlanModel();
  const segs = segmentsForWo(model, wo);
  if (!segs.length) {
    return `No operations for ${wo} on the sample board. Try WO-1842, WO-1843, WO-1847, WO-1839 or WO-1850.`;
  }
  const lines = segs.map((seg) => {
    const row = model.rows.find((r) => r.id === seg.rowId);
    return `${row?.label ?? seg.rowId}  ${seg.label}  ${formatClock(seg.startTime)}–${formatClock(seg.endTime)}`;
  });
  return `${wo} operations\n${lines.join('\n')}`;
}

export function runExplainCriticalPath(): string {
  const model = getPlanModel();
  const chain = ['block-1', 'block-4', 'block-6', 'block-8']
    .map((id) => model.segments.find((seg) => seg.blockId === id))
    .filter((seg): seg is GanttSegment => Boolean(seg));
  const last = chain[chain.length - 1];
  const steps = chain.map((seg, i) => {
    const row = model.rows.find((r) => r.id === seg.rowId);
    return `${i + 1}. ${row?.label ?? seg.rowId} · ${seg.label} · ${formatClock(seg.startTime)}–${formatClock(seg.endTime)}`;
  });
  return [
    'Critical path is WO-1842 (FS mill → assembly → QC → pack).',
    ...steps,
    last ? `Promise at pack finish ${formatClock(last.endTime)} UTC on 14 Aug 2026.` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function runUpdateScheduleBlock(input: {
  workOrder?: string;
  blockId?: string;
  hoursDelta?: number;
  stretchHours?: number;
}): string {
  const model = getPlanModel();
  const wo = (input.workOrder ?? 'WO-1842').toUpperCase();
  let target = input.blockId
    ? model.segments.find((seg) => seg.blockId === input.blockId)
    : segmentsForWo(model, wo)[0];

  if (!target) {
    return `Cannot update: no block for ${input.blockId ?? wo}.`;
  }

  const shift = (input.hoursDelta ?? 0) * HOUR;
  const stretch = (input.stretchHours ?? 0) * HOUR;
  const nextStart = target.blockStartTime + shift;
  const nextEnd = target.blockEndTime + shift + stretch;
  if (nextEnd <= nextStart) {
    return 'Refused: block would have zero or negative duration.';
  }

  const siblings = model.segments.filter((seg) => seg.blockId === target.blockId);
  const updated = siblings.map((seg) => ({
    ...seg,
    startTime: seg.startTime + shift,
    endTime: seg.endTime + shift + stretch,
    blockStartTime: nextStart,
    blockEndTime: nextEnd,
  }));

  const next = applyBlockChangeToModel(model, {
    blockId: target.blockId,
    rowId: target.rowId,
    previousRowId: target.rowId,
    blockStartTime: nextStart,
    blockEndTime: nextEnd,
    segments: updated,
  });
  setPlanModel(next);

  const label = target.label ?? target.blockId;
  const parts = [
    `Applied to sample board: ${label}.`,
    `New window ${formatClock(nextStart)}–${formatClock(nextEnd)} UTC.`,
  ];
  if (target.blockId === 'block-1' && (shift > 0 || stretch > 0)) {
    parts.push('FS successors on WO-1842 (assembly, QC, pack) are now at risk of a broken promise.');
  }
  return parts.join(' ');
}

export function runResourceSlack(): string {
  const model = getPlanModel();
  const start = SHIFT_START;
  const end = model.timeRange.max;
  const horizon = (end - start) / HOUR;
  const lines = model.rows.map((row) => {
    const loaded =
      model.segments
        .filter((seg) => seg.rowId === row.id)
        .reduce((sum, seg) => sum + (seg.endTime - seg.startTime), 0) / HOUR;
    const slack = Math.round((horizon - loaded) * 10) / 10;
    const util = Math.round((loaded / horizon) * 1000) / 10;
    return `${row.label}: ${loaded}h loaded / ${horizon}h horizon · ${slack}h slack · ${util}%`;
  });
  return [`Finite-capacity slack on the sample shift (${horizon}h horizon, 06:00–22:00 UTC).`, ...lines].join('\n');
}

export function describeBoard(): string {
  const model = getPlanModel();
  const last = model.segments.find((seg) => seg.blockId === 'block-8');
  return [
    `Sample shift starts ${formatClock(SHIFT_START)} UTC, 14 Aug 2026.`,
    `${model.rows.length} resources, ${model.segments.length} operations, ${model.links.length} FS links.`,
    last ? `WO-1842 pack currently finishes ${formatClock(last.endTime)}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}
