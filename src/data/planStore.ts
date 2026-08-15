import { reactive } from 'vue';
import type { GanttModel } from 'pixi-gantt';
import { createSamplePlan } from './samplePlan';

const state = reactive({
  model: createSamplePlan() as GanttModel,
  revision: 0,
});

export function getPlanModel(): GanttModel {
  return state.model;
}

export function setPlanModel(next: GanttModel): void {
  state.model = next;
  state.revision += 1;
}

export function resetPlanModel(): void {
  state.model = createSamplePlan();
  state.revision += 1;
}

export function usePlanState() {
  return state;
}
