# SCP Planning Copilot

Vue 3 workbench for **finite-capacity supply chain planning**: a [pixi-gantt](https://github.com/mizuno0237/pixi-gantt) resource board plus a dispatch-pad copilot.

| Day | Scope |
| --- | --- |
| **D1 (this commit)** | Vite + Vue 3 scaffold, sample Heijunka-style plan, pixi-gantt mounted in the board |
| D2 | Planning tools + streaming chat (`@ai-sdk/vue`) |
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

## License

MIT
