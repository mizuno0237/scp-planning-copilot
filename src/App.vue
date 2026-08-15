<script setup lang="ts">
import ChatPanel from './components/ChatPanel.vue';
import PlanningGantt from './components/PlanningGantt.vue';

const shiftLabel = '14 Aug 2026  ·  Day shift 06:00–22:00';
</script>

<template>
  <div class="shell">
    <header class="mast">
      <div>
        <p class="mast__kicker">Heijunka board</p>
        <h1>SCP Planning Copilot</h1>
      </div>
      <p class="mast__shift">{{ shiftLabel }}</p>
    </header>
    <div class="workspace">
      <ChatPanel />
      <section class="board" aria-label="Resource schedule">
        <div class="board__rail">
          <span>Finite capacity</span>
          <span>FS links · WO-1842 · tools can rewrite the sample</span>
        </div>
        <PlanningGantt />
      </section>
    </div>
  </div>
</template>

<style scoped>
.shell {
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
}

.mast {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  padding: 14px 20px 12px;
  border-bottom: 3px solid var(--brass);
  background: #1f241e;
}

.mast__kicker {
  margin: 0 0 4px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--brass);
}

.mast h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.mast__shift {
  margin: 0;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--mist);
}

.workspace {
  display: grid;
  grid-template-columns: minmax(240px, 320px) 1fr;
  min-height: 0;
}

.board {
  display: grid;
  grid-template-rows: auto 1fr;
  min-width: 0;
  background: #fff;
}

.board__rail {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 14px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: #3d4338;
  background: #ece6d4;
  border-bottom: 1px solid #d2cbb6;
}

@media (max-width: 800px) {
  .workspace {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(180px, 32%) 1fr;
  }
}
</style>
