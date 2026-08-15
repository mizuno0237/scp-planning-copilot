<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { GanttEngine, GanttState } from 'pixi-gantt';
import { usePlanState } from '../data/planStore';

const host = ref<HTMLElement | null>(null);
const plan = usePlanState();
let engine: GanttEngine | null = null;

function onResize() {
  const el = host.value;
  if (!el || !engine) return;
  engine.resize(el.clientWidth, el.clientHeight);
}

function paint() {
  if (!engine) return;
  engine.setData(plan.model);
  engine.fitToWindow();
}

onMounted(async () => {
  const el = host.value;
  if (!el) return;
  const state = new GanttState();
  engine = new GanttEngine(state, { rowHeight: 36, barHeight: 22 });
  await engine.mount(el);
  paint();
  window.addEventListener('resize', onResize);
});

watch(
  () => plan.revision,
  () => {
    paint();
  },
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  engine?.destroy();
  engine = null;
});
</script>

<template>
  <div ref="host" class="gantt-host" role="img" aria-label="Sample finite-capacity plan for 14 Aug 2026 shift" />
</template>

<style scoped>
.gantt-host {
  width: 100%;
  height: 100%;
  min-height: 280px;
  background: #fff;
}
</style>
