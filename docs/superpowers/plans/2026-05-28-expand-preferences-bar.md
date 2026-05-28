# Expand preferences bar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an expand button to the preferences section that opens a modal with a taller bar and editable percentage list, making drag interaction more comfortable.

**Architecture:** All changes in `web/index.html`. New modal `<div>` in HTML; `openPrefsModal()` builds its content from `configState`; `applyPrefsModal()` writes back to `configState`, re-renders panel, and persists. Modal has its own drag state completely isolated from the panel.

**Tech Stack:** Vanilla JS, Tailwind CSS (CDN), Heroicons SVG

---

## File map

- Modify: `web/index.html` (only file changed)
  - HTML: new `#prefs-modal` div; expand button in preferences `<details>` summary
  - JS `el` object: 7 new element references
  - i18n: 3 new keys in `ui.en` and `ui.es`
  - Label init block: 1 new line
  - New functions: `syncModalSegmentsFromInputs`, `updateModalInputsFromSegments`, `openPrefsModal`, `applyPrefsModal`
  - New drag state: `modalDraggingHandle`, `modalDraggingIndex`, `startModalDragging`
  - New event listeners: expand button, modal overlay click, ✕ button, Cancelar, Aplicar, modal list input

---

### Task 1: i18n keys

**Files:** Modify `web/index.html:591` and `web/index.html:735`

- [ ] **Add 3 keys to `ui.en`** — insert after line 591 (`historyLoad: 'Load',`):

```javascript
                expandPreferences: 'Expand',
                cancelPreferences: 'Cancel',
                applyPreferences: 'Apply',
```

- [ ] **Add 3 keys to `ui.es`** — insert after line 735 (`historyLoad: 'Cargar',`) (line number shifts +3 after previous edit):

```javascript
                expandPreferences: 'Ampliar',
                cancelPreferences: 'Cancelar',
                applyPreferences: 'Aplicar',
```

- [ ] **Commit**

```bash
git add web/index.html
git commit -m "feat: add i18n keys for preferences expand modal"
```

---

### Task 2: Modal HTML + el references + label init

**Files:** Modify `web/index.html`

- [ ] **Add modal HTML** — insert after the closing `</div>` of `#hard-constraints-modal` (after line 130):

```html
        <!-- Preferences expand modal -->
        <div id="prefs-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div class="relative mx-4 w-full max-w-2xl rounded-lg border border-line bg-white p-6 shadow-xl">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-base font-semibold text-ink" id="prefs-modal-title"></h2>
                    <button id="prefs-modal-close" type="button" class="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-pine/30">
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
                        </svg>
                    </button>
                </div>
                <div id="prefs-modal-bar" style="position:relative;height:120px;background:#f8fafc;border:1px solid #d8dee7;border-radius:0.375rem;overflow:hidden;"></div>
                <div id="prefs-modal-list" class="mt-4 grid gap-2 max-h-64 overflow-y-auto pr-1"></div>
                <div class="mt-5 flex justify-end gap-3">
                    <button id="prefs-modal-cancel" type="button" class="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-pine/20"></button>
                    <button id="prefs-modal-apply" type="button" class="rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-100 hover:text-pine hover:border hover:border-pine focus:outline-none focus:ring-4 focus:ring-pine/30"></button>
                </div>
            </div>
        </div>
```

- [ ] **Add el references** — replace the closing `}` of the `el` object (line 428, which ends `modalContinueBtn: document.querySelector('#modal-continue-btn')`):

```javascript
            modalContinueBtn: document.querySelector('#modal-continue-btn'),
            prefsModal: document.querySelector('#prefs-modal'),
            prefsModalTitle: document.querySelector('#prefs-modal-title'),
            prefsModalClose: document.querySelector('#prefs-modal-close'),
            prefsModalBar: document.querySelector('#prefs-modal-bar'),
            prefsModalList: document.querySelector('#prefs-modal-list'),
            prefsModalCancel: document.querySelector('#prefs-modal-cancel'),
            prefsModalApply: document.querySelector('#prefs-modal-apply'),
            expandPrefsBtn: document.querySelector('#expand-prefs-btn'),
            labelExpandPrefs: document.querySelector('#label-expand-prefs')
        };
```

- [ ] **Add label init** — insert after the line `el.labelHistory.textContent = t.history;` (currently ~line 839):

```javascript
        el.prefsModalTitle.textContent = t.preferencesSection;
```

- [ ] **Commit**

```bash
git add web/index.html
git commit -m "feat: add preferences expand modal HTML and el references"
```

---

### Task 3: Expand button in preferences summary

**Files:** Modify `web/index.html:271-276`

- [ ] **Replace the preferences `<details>` summary** — current content:

```html
                    <summary class="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-ink">
                        <span id="label-soft-constraints">Preferences</span>
                        <svg class="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/>
                        </svg>
                    </summary>
```

Replace with:

```html
                    <summary class="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-ink">
                        <span id="label-soft-constraints">Preferences</span>
                        <div class="flex items-center gap-2">
                            <button id="expand-prefs-btn" type="button" class="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-ink focus:outline-none focus:ring-2 focus:ring-pine/30" onclick="event.stopPropagation()">
                                <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06L5.44 6.5H2.75a.75.75 0 0 0 0 1.5h4.5A.75.75 0 0 0 8 7.25v-4.5a.75.75 0 0 0-1.5 0v2.69L3.28 2.22ZM13.5 2.75a.75.75 0 0 0-1.5 0v4.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-2.69l3.22-3.22a.75.75 0 0 0-1.06-1.06L13.5 5.44V2.75ZM3.28 17.78 6.5 14.56v2.69a.75.75 0 0 0 1.5 0v-4.5A.75.75 0 0 0 7.25 12h-4.5a.75.75 0 0 0 0 1.5h2.69l-3.22 3.22a.75.75 0 1 0 1.06 1.06ZM13.5 14.56l3.22 3.22a.75.75 0 1 0 1.06-1.06L14.56 13.5h2.69a.75.75 0 0 0 0-1.5h-4.5a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-2.69Z" clip-rule="evenodd"/>
                                </svg>
                                <span id="label-expand-prefs"></span>
                            </button>
                            <svg class="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                    </summary>
```

- [ ] **Add label init for expand button** — insert after `el.prefsModalTitle.textContent = t.preferencesSection;`:

```javascript
        el.labelExpandPrefs.textContent = t.expandPreferences;
```

- [ ] **Verify the button is visible** — open `http://localhost:3000/` in browser, find the "Preferences" section in the sidebar, confirm the expand icon and label appear to the left of the chevron. Clicking the expand button should not toggle the `<details>` open/closed (the `event.stopPropagation()` handles this).

- [ ] **Commit**

```bash
git add web/index.html
git commit -m "feat: add expand button to preferences summary"
```

---

### Task 4: openPrefsModal + helper functions

**Files:** Modify `web/index.html` — insert after `loadConfig` function (after line ~1464)

- [ ] **Add helper and open functions** — insert the following block after the closing `};` of `loadConfig`:

```javascript
        const syncModalSegmentsFromInputs = () => {
            const inputs = [...el.prefsModalList.querySelectorAll('.modal-pref-input')];
            const total = inputs.reduce((sum, inp) => sum + (Number(inp.value) || 0), 0);
            const segments = [...el.prefsModalBar.querySelectorAll('.modal-pref-segment')];
            const handles = [...el.prefsModalBar.querySelectorAll('.modal-pref-handle')];
            let cumulative = 0;
            inputs.forEach((inp, idx) => {
                const pct = total > 0 ? Number(inp.value) / total * 100 : 0;
                if (segments[idx]) {
                    segments[idx].style.left = cumulative + '%';
                    segments[idx].style.width = pct + '%';
                }
                if (idx > 0 && handles[idx - 1]) {
                    handles[idx - 1].style.left = cumulative + '%';
                }
                cumulative += pct;
            });
        };

        const updateModalInputsFromSegments = () => {
            const segments = [...el.prefsModalBar.querySelectorAll('.modal-pref-segment')];
            const total = segments.reduce((sum, seg) => sum + parseFloat(seg.style.width), 0);
            segments.forEach(seg => {
                const pct = total > 0 ? parseFloat(seg.style.width) / total * 100 : 0;
                const input = el.prefsModalList.querySelector(`.modal-pref-input[data-key="${seg.dataset.key}"]`);
                if (input) input.value = Math.round(pct * 10) / 10;
            });
        };

        const openPrefsModal = () => {
            if (!configState) return;
            const weights = configState.algorithm.evaluatorWeights || {};
            const softEntries = Object.entries(weights).filter(([k]) => !HARD_CONSTRAINTS.has(k));
            const softTotal = softEntries.reduce((sum, [, v]) => sum + v, 0);
            const softWithPct = softEntries.map(([key, value], index) => ({
                key,
                pct: softTotal > 0 ? Math.round(value / softTotal * 1000) / 10 : 0,
                color: preferenceColors[index % preferenceColors.length]
            }));

            let barHtml = '';
            let cumulative = 0;
            softWithPct.forEach((item, idx) => {
                if (idx > 0) {
                    barHtml += `<div class="modal-pref-handle" data-index="${idx}" style="left:${cumulative}%;position:absolute;width:4px;height:100%;background:rgba(31,41,51,0.5);cursor:ew-resize;z-index:1;"></div>`;
                }
                barHtml += `<div class="modal-pref-segment" data-key="${item.key}" style="left:${cumulative}%;width:${item.pct}%;background-color:${item.color};position:absolute;height:100%;cursor:ew-resize;" title="${t.preferences?.[item.key]?.name || item.key}"></div>`;
                cumulative += item.pct;
            });
            el.prefsModalBar.innerHTML = barHtml;
            el.prefsModalBar.querySelectorAll('.modal-pref-handle').forEach(h => {
                h.addEventListener('mousedown', startModalDragging);
            });

            el.prefsModalList.innerHTML = softWithPct.map(item => {
                const desc = t.preferences?.[item.key]?.description || '';
                const titleAttr = desc ? ` title="${desc}"` : '';
                return `
                <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:#f8fafc;border-radius:4px;border:1px solid #d8dee7;font-size:12px;"${titleAttr}>
                    <div style="width:12px;height:12px;background-color:${item.color};border-radius:2px;flex-shrink:0;"></div>
                    <div style="flex:1;min-width:0;font-weight:500;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;">${t.preferences?.[item.key]?.name || item.key}</div>
                    <input type="number" class="modal-pref-input" data-key="${item.key}" min="0" max="100" value="${Math.round(item.pct)}" style="width:52px;height:28px;padding:2px 4px;border:1px solid #d8dee7;border-radius:3px;font-size:12px;font-weight:600;">
                </div>`;
            }).join('');

            el.prefsModalCancel.textContent = t.cancelPreferences;
            el.prefsModalApply.textContent = t.applyPreferences;
            el.prefsModal.classList.remove('hidden');
        };
```

- [ ] **Commit**

```bash
git add web/index.html
git commit -m "feat: implement openPrefsModal and sync helpers"
```

---

### Task 5: Modal drag state and handlers

**Files:** Modify `web/index.html` — insert after the existing `document.addEventListener('mouseup', ...)` block (~line 2068)

- [ ] **Add modal drag state and startModalDragging** — insert after the `const startDragging` function (after line ~1191):

```javascript
        let modalDraggingHandle = null;
        let modalDraggingIndex = null;

        const startModalDragging = (event) => {
            modalDraggingHandle = event.currentTarget;
            modalDraggingIndex = parseInt(modalDraggingHandle.dataset.index);
            event.preventDefault();
        };
```

- [ ] **Add modal mousemove + mouseup** — insert after the existing `document.addEventListener('mouseup', ...)` block:

```javascript
        document.addEventListener('mousemove', (event) => {
            if (!modalDraggingHandle || modalDraggingIndex === null) return;
            const rect = el.prefsModalBar.getBoundingClientRect();
            const newPosition = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100));
            const segments = [...el.prefsModalBar.querySelectorAll('.modal-pref-segment')];
            const leftSegment = segments[modalDraggingIndex - 1];
            const rightSegment = segments[modalDraggingIndex];
            if (!leftSegment || !rightSegment) return;
            const leftStart = parseFloat(leftSegment.style.left);
            const rightEnd = parseFloat(rightSegment.style.left) + parseFloat(rightSegment.style.width);
            const constrainedPos = Math.max(leftStart + 3, Math.min(rightEnd - 3, newPosition));
            leftSegment.style.width = (constrainedPos - leftStart) + '%';
            rightSegment.style.left = constrainedPos + '%';
            rightSegment.style.width = (rightEnd - constrainedPos) + '%';
            const handles = [...el.prefsModalBar.querySelectorAll('.modal-pref-handle')];
            handles[modalDraggingIndex - 1].style.left = constrainedPos + '%';
            updateModalInputsFromSegments();
        });

        document.addEventListener('mouseup', () => {
            if (modalDraggingHandle) {
                modalDraggingHandle = null;
                modalDraggingIndex = null;
            }
        });
```

- [ ] **Commit**

```bash
git add web/index.html
git commit -m "feat: add modal drag handlers for preferences bar"
```

---

### Task 6: applyPrefsModal + all event listeners

**Files:** Modify `web/index.html`

- [ ] **Add applyPrefsModal** — insert after `openPrefsModal` function:

```javascript
        const applyPrefsModal = () => {
            const inputs = [...el.prefsModalList.querySelectorAll('.modal-pref-input')];
            const total = inputs.reduce((sum, inp) => sum + (Number(inp.value) || 0), 0);
            inputs.forEach(inp => {
                configState.algorithm.evaluatorWeights[inp.dataset.key] = total > 0 ? Number(inp.value) / total : 0;
            });
            renderConfig();
            savePreferences();
            setDirty(true);
            el.prefsModal.classList.add('hidden');
        };
```

- [ ] **Add event listeners** — insert before the `auth.onAuthStateChanged` block:

```javascript
        el.expandPrefsBtn.addEventListener('click', openPrefsModal);
        el.prefsModalClose.addEventListener('click', () => el.prefsModal.classList.add('hidden'));
        el.prefsModalCancel.addEventListener('click', () => el.prefsModal.classList.add('hidden'));
        el.prefsModalApply.addEventListener('click', applyPrefsModal);
        el.prefsModal.addEventListener('click', (e) => {
            if (e.target === el.prefsModal) el.prefsModal.classList.add('hidden');
        });
        el.prefsModalList.addEventListener('input', (event) => {
            if (!event.target.classList.contains('modal-pref-input')) return;
            const changed = event.target;
            const newPct = Math.min(100, Math.max(0, Number(changed.value) || 0));
            changed.value = newPct;
            const others = [...el.prefsModalList.querySelectorAll('.modal-pref-input')].filter(f => f !== changed);
            const othersTotal = others.reduce((sum, f) => sum + (Number(f.value) || 0), 0);
            const remaining = 100 - newPct;
            if (othersTotal === 0) {
                const share = Math.round(remaining / others.length * 10) / 10;
                others.forEach(f => { f.value = share; });
            } else {
                others.forEach(f => {
                    f.value = Math.round(Number(f.value) / othersTotal * remaining * 10) / 10;
                });
            }
            syncModalSegmentsFromInputs();
        });
```

- [ ] **Commit**

```bash
git add web/index.html
git commit -m "feat: add applyPrefsModal and all modal event listeners"
```

---

### Task 7: Manual verification

- [ ] **Open** `http://localhost:3000/` in the browser (server is already running).

- [ ] **Expand button visible** — scroll to Preferences section in the sidebar. The expand icon (four arrows) and "Expand"/"Ampliar" label appear in the summary header.

- [ ] **Button doesn't toggle details** — clicking the expand button opens the modal without toggling the Preferences `<details>` open/closed.

- [ ] **Modal opens correctly** — the modal shows a tall colored bar with drag handles and a scrollable list of preferences with percentage inputs below.

- [ ] **Drag handles work** — drag a handle in the modal bar left/right; the adjacent segments resize and the corresponding inputs update live.

- [ ] **Input editing works** — change a number in one of the modal inputs; the other inputs redistribute proportionally and the bar updates.

- [ ] **Cancelar discards** — make a change in the modal, click Cancelar, confirm the panel bar is unchanged.

- [ ] **Aplicar persists** — make a change in the modal, click Aplicar, confirm the panel bar reflects the new percentages and the Save button becomes enabled.

- [ ] **Overlay click closes** — click outside the modal box (on the dark overlay); the modal closes without applying.

- [ ] **Language** — switch to español in the gear menu, reload; the button shows "Ampliar" and modal buttons show "Cancelar"/"Aplicar".
