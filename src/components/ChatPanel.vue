<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { streamPlannerTurn } from '../lib/streamPlanner';
import { PLANNING_TOOLS, type ToolTrace } from '../tools/planningTools';

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  tools: ToolTrace[];
};

const prompts = [
  'Which work order is on the critical path?',
  'What slips if CNC-12 loses two hours?',
  'Promise date for WO-1842?',
  'Define finite capacity',
];

const draft = ref('');
const busy = ref(false);
const log = ref<HTMLElement | null>(null);
const messages = ref<ChatMessage[]>([
  {
    id: 1,
    role: 'assistant',
    text: 'Dispatch pad is live. I can look up glossary terms, walk the WO-1842 critical path, and apply a sample reschedule to the board.',
    tools: [],
  },
]);

let seq = 2;
let abort: AbortController | null = null;

async function scrollLog() {
  await nextTick();
  const el = log.value;
  if (el) el.scrollTop = el.scrollHeight;
}

async function send(text: string) {
  const content = text.trim();
  if (!content || busy.value) return;
  abort?.abort();
  abort = new AbortController();
  draft.value = '';
  messages.value.push({ id: seq++, role: 'user', text: content, tools: [] });
  const assistant: ChatMessage = { id: seq++, role: 'assistant', text: '', tools: [] };
  messages.value.push(assistant);
  busy.value = true;
  await scrollLog();
  try {
    await streamPlannerTurn(
      content,
      (event) => {
        if (event.type === 'text') assistant.text += event.text;
        if (event.type === 'tool') assistant.tools.push(event.tool);
        void scrollLog();
      },
      abort.signal,
    );
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      assistant.text = assistant.text || 'Planner turn failed on the sample board.';
    }
  } finally {
    busy.value = false;
    abort = null;
    await scrollLog();
  }
}

function onSubmit() {
  void send(draft.value);
}

function onChip(line: string) {
  void send(line);
}
</script>

<template>
  <aside class="dispatch">
    <header class="dispatch__head">
      <span class="dispatch__tag">CH-01</span>
      <h2>Dispatch pad</h2>
    </header>
    <p class="dispatch__note">
      Streaming planner over four tools. Schedule writes land on the sample gantt only — no live factory.
    </p>
    <ul class="dispatch__tools" aria-label="Planning tools">
      <li v-for="tool in PLANNING_TOOLS" :key="tool.name">
        <code>{{ tool.name }}</code>
      </li>
    </ul>
    <div ref="log" class="dispatch__log" role="log" aria-live="polite">
      <article v-for="msg in messages" :key="msg.id" :class="['bubble', `bubble--${msg.role}`]">
        <p class="bubble__who">{{ msg.role === 'user' ? 'Planner' : 'Copilot' }}</p>
        <p v-if="msg.text" class="bubble__text">{{ msg.text }}</p>
        <ul v-if="msg.tools.length" class="bubble__tools">
          <li v-for="(tool, i) in msg.tools" :key="`${msg.id}-${i}`">
            <span>{{ tool.name }}</span>
          </li>
        </ul>
      </article>
    </div>
    <ul class="dispatch__chips">
      <li v-for="line in prompts" :key="line">
        <button type="button" :disabled="busy" @click="onChip(line)">{{ line }}</button>
      </li>
    </ul>
    <form class="dispatch__form" @submit.prevent="onSubmit">
      <label class="sr-only" for="copilot-draft">Message</label>
      <textarea
        id="copilot-draft"
        v-model="draft"
        rows="3"
        :disabled="busy"
        placeholder="Ask a term, a work order, or a two-hour slip…"
        @keydown.enter.exact.prevent="onSubmit"
      />
      <button type="submit" :disabled="busy || !draft.trim()">{{ busy ? 'Streaming…' : 'Send' }}</button>
    </form>
  </aside>
</template>

<style scoped>
.dispatch {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 14px 14px;
  background: #22261f;
  border-right: 1px solid #3d4338;
  min-width: 0;
  min-height: 0;
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
  font-size: 12px;
  line-height: 1.45;
  color: var(--mist);
}

.dispatch__tools {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dispatch__tools code {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.02em;
  color: #1a1c18;
  background: var(--brass);
  padding: 2px 6px;
}

.dispatch__log {
  flex: 1;
  min-height: 120px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}

.bubble {
  padding: 8px 9px;
  border: 1px solid #4a5244;
  background: #2a2f28;
}

.bubble--user {
  border-color: #6a6250;
  background: #32362c;
}

.bubble__who {
  margin: 0 0 4px;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brass);
}

.bubble__text {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  white-space: pre-wrap;
}

.bubble__tools {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.bubble__tools span {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--mist);
  border: 1px solid #5a6254;
  padding: 1px 5px;
}

.dispatch__chips {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  padding: 7px 9px;
}

.dispatch__chips button:disabled,
.dispatch__form button:disabled,
.dispatch__form textarea:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.dispatch__chips button:not(:disabled):hover {
  border-color: var(--brass);
}

.dispatch__form {
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
