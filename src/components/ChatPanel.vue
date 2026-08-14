<script setup lang="ts">
const prompts = [
  'Which work order is on the critical path?',
  'What slips if CNC-12 loses two hours?',
  'Promise date for WO-1842?',
];
</script>

<template>
  <aside class="dispatch">
    <header class="dispatch__head">
      <span class="dispatch__tag">CH-01</span>
      <h2>Dispatch pad</h2>
    </header>
    <p class="dispatch__note">
      Ask about a work order, a bottleneck, or a promise date. Streaming chat and planning tools land in D2.
    </p>
    <ul class="dispatch__chips">
      <li v-for="line in prompts" :key="line">
        <button type="button" disabled>{{ line }}</button>
      </li>
    </ul>
    <form class="dispatch__form" @submit.prevent>
      <label class="sr-only" for="copilot-draft">Message</label>
      <textarea id="copilot-draft" rows="3" disabled placeholder="Chat input unlocks with D2 streaming…" />
      <button type="submit" disabled>Send</button>
    </form>
  </aside>
</template>

<style scoped>
.dispatch {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 16px 16px;
  background: #22261f;
  border-right: 1px solid #3d4338;
  min-width: 0;
}

.dispatch__head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.dispatch__tag {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--brass);
}

.dispatch__head h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.dispatch__note {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--mist);
}

.dispatch__chips {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dispatch__chips button,
.dispatch__form button,
.dispatch__form textarea {
  width: 100%;
  border: 1px solid #4a5244;
  background: #2a2f28;
  color: var(--ticket);
  border-radius: 2px;
  text-align: left;
  padding: 8px 10px;
}

.dispatch__chips button:disabled,
.dispatch__form button:disabled,
.dispatch__form textarea:disabled {
  opacity: 0.72;
  cursor: not-allowed;
}

.dispatch__form {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dispatch__form button {
  text-align: center;
  background: var(--brass);
  color: var(--ink);
  border-color: var(--brass);
  font-weight: 600;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
