# SCP Planning Copilot

Vue 3 workbench for **finite-capacity supply chain planning**: a [pixi-gantt](https://github.com/mizuno0237/pixi-gantt) resource board plus a dispatch-pad copilot.

| Day | Scope |
| --- | --- |
| D1 | Vite + Vue 3 scaffold, sample Heijunka-style plan, pixi-gantt mounted in the board |
| **D2 (this commit)** | Planning tools + streaming dispatch pad (`lookupGlossary`, `getWorkOrder`, `explainCriticalPath`, `updateScheduleBlock`) |
| D3 | Demo walkthrough + README polish |

## Quick start

```bash
# sibling of pixi-gantt (Vite aliases the library source until it is on npm)
cd GitHub-project/scp-planning-copilot
npm install
npm run dev
```

Open http://localhost:5175

`pixi-gantt` is not on the npm registry yet. This app resolves it from `../pixi-gantt/src` via the Vite alias in `vite.config.ts`. After `npm publish` of pixi-gantt, switch the dependency to the registry package.

## Sample board

Five resource lanes (CNC, assembly, QC, pack) with FS links on **WO-1842** so the critical path is visible without a live planner backend.

## Planning tools (D2)

The dispatch pad streams a local planner over the sample model. No API key. Writes stay on the demo board.

| Tool | What it does |
| --- | --- |
| `lookupGlossary` | WO / FS / ATP / bottleneck / Heijunka / FAI |
| `getWorkOrder` | Operations and UTC windows for a WO |
| `explainCriticalPath` | FS chain mill → assembly → QC → pack |
| `updateScheduleBlock` | Shift or stretch a block; gantt redraws |

Try “What slips if CNC-12 loses two hours?” — CNC-12 mill stretches two hours and the pad flags the WO-1842 promise.

## License

MIT
