import { afterEach, describe, expect, it } from 'vitest';
import { getPlanModel, resetPlanModel } from '../data/planStore';
import {
  runExplainCriticalPath,
  runGetWorkOrder,
  runLookupGlossary,
  runResourceSlack,
  runUpdateScheduleBlock,
} from './planningTools';

afterEach(() => {
  resetPlanModel();
});

describe('lookupGlossary', () => {
  it('defines finite capacity from the shop-floor aliases', () => {
    const text = runLookupGlossary('finite capacity');
    expect(text).toMatch(/Finite capacity/);
    expect(text).toMatch(/does not create a second machine/i);
  });
});

describe('getWorkOrder', () => {
  it('lists WO-1842 operations across mill, assembly, QC, and pack', () => {
    const text = runGetWorkOrder('WO-1842');
    expect(text).toMatch(/Housing mill/);
    expect(text).toMatch(/Press \+ torque/);
    expect(text).toMatch(/FAI \+ CMM/);
    expect(text).toMatch(/Pack & label/);
  });

  it('points at the sample WOs when the ticket is missing', () => {
    expect(runGetWorkOrder('WO-9999')).toMatch(/Try WO-1842/);
  });
});

describe('explainCriticalPath', () => {
  it('walks the FS chain that sets the WO-1842 promise', () => {
    const text = runExplainCriticalPath();
    expect(text).toMatch(/FS mill → assembly → QC → pack/);
    expect(text).toMatch(/CNC-12/);
    expect(text).toMatch(/Promise at pack finish 19:00 UTC/);
  });
});

describe('updateScheduleBlock', () => {
  it('stretches the mill and flags the broken promise', () => {
    const mill = getPlanModel().segments.find((seg) => seg.blockId === 'block-1');
    expect(mill).toBeDefined();
    const before = mill!.blockEndTime - mill!.blockStartTime;

    const text = runUpdateScheduleBlock({
      workOrder: 'WO-1842',
      stretchHours: 2,
    });

    const after = getPlanModel().segments.find((seg) => seg.blockId === 'block-1');
    expect(after!.blockEndTime - after!.blockStartTime).toBe(before + 2 * 3_600_000);
    expect(text).toMatch(/broken promise/);
  });

  it('refuses a zero-duration write', () => {
    const mill = getPlanModel().segments.find((seg) => seg.blockId === 'block-1');
    const hours = (mill!.blockEndTime - mill!.blockStartTime) / 3_600_000;
    expect(runUpdateScheduleBlock({ blockId: 'block-1', stretchHours: -hours })).toMatch(/Refused/);
  });
});

describe('reportResourceSlack', () => {
  it('shows CNC-12 mill plus flange hours against the 16h horizon', () => {
    const text = runResourceSlack();
    expect(text).toMatch(/16h horizon/);
    expect(text).toMatch(/CNC-12: 7h loaded/);
    expect(text).toMatch(/9h slack/);
  });
});
