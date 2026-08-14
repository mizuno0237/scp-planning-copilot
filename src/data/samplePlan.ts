import type { GanttModel } from 'pixi-gantt';

const HOUR = 3_600_000;
const SHIFT_START = Date.UTC(2026, 7, 14, 6, 0, 0);

const LANES = [
  { id: 'cnc-12', label: 'CNC-12', stamp: 'MC-12' },
  { id: 'cnc-18', label: 'CNC-18', stamp: 'MC-18' },
  { id: 'assy-a', label: 'Assembly A', stamp: 'AS-A' },
  { id: 'qc-gate', label: 'QC Gate', stamp: 'QC-01' },
  { id: 'pack-1', label: 'Pack / Ship', stamp: 'PK-01' },
] as const;

const COLORS = {
  mill: '#4A6B7C',
  assemble: '#C6A039',
  inspect: '#3F7D6A',
  pack: '#B5462A',
};

export function createSamplePlan(): GanttModel {
  const rows = LANES.map((lane) => ({
    id: lane.id,
    label: `${lane.stamp}  ${lane.label}`,
    startTime: SHIFT_START,
    startLabel: '2026-08-14 06:00',
    laneCount: 1,
    height: 36,
  }));

  const jobs: Array<{
    lane: string;
    wo: string;
    label: string;
    startH: number;
    hours: number;
    color: string;
  }> = [
    { lane: 'cnc-12', wo: 'WO-1842', label: 'Housing mill', startH: 0, hours: 4, color: COLORS.mill },
    { lane: 'cnc-12', wo: 'WO-1847', label: 'Flange face', startH: 5, hours: 3, color: COLORS.mill },
    { lane: 'cnc-18', wo: 'WO-1843', label: 'Shaft turn', startH: 1, hours: 5, color: COLORS.mill },
    { lane: 'assy-a', wo: 'WO-1842', label: 'Press + torque', startH: 5, hours: 3, color: COLORS.assemble },
    { lane: 'assy-a', wo: 'WO-1850', label: 'Kit staging', startH: 9, hours: 2, color: COLORS.assemble },
    { lane: 'qc-gate', wo: 'WO-1842', label: 'FAI + CMM', startH: 8.5, hours: 2, color: COLORS.inspect },
    { lane: 'pack-1', wo: 'WO-1839', label: 'Ship ASN-220', startH: 2, hours: 3, color: COLORS.pack },
    { lane: 'pack-1', wo: 'WO-1842', label: 'Pack & label', startH: 11, hours: 2, color: COLORS.pack },
  ];

  const segments = jobs.map((job, i) => {
    const start = SHIFT_START + job.startH * HOUR;
    const end = start + job.hours * HOUR;
    return {
      id: `seg-${i + 1}`,
      blockId: `block-${i + 1}`,
      blockStartTime: start,
      blockEndTime: end,
      rowId: job.lane,
      startTime: start,
      endTime: end,
      label: `${job.wo}  ${job.label}`,
      color: job.color,
      taskType: 'PRODUCTION',
      layer: 0,
    };
  });

  return {
    rows,
    segments,
    links: [
      { id: 'fs-mill-assy', sourceBlockId: 'block-1', targetBlockId: 'block-4', type: 'FS' },
      { id: 'fs-assy-qc', sourceBlockId: 'block-4', targetBlockId: 'block-6', type: 'FS' },
      { id: 'fs-qc-pack', sourceBlockId: 'block-6', targetBlockId: 'block-8', type: 'FS' },
    ],
    timeRange: {
      min: SHIFT_START - HOUR,
      max: SHIFT_START + HOUR * 16,
    },
  };
}
