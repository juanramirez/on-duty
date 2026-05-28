# Expand button for preferences bar

**Date:** 2026-05-28

## Problem

The preferences percentage bar in the sidebar is 60px tall. The drag handles that separate segments are only 2px wide, making them hard to grab precisely, especially when there are many segments close together.

## Goal

Add an expand button that opens a larger modal version of the bar so the user can adjust segment boundaries more comfortably.

## Design

### Trigger

A small expand icon button (⛶) placed to the right of the "Preferences" section label (inside the `<details>` summary, same row as the label).

### Modal structure

- Centered overlay with a semi-transparent dark background (`bg-black/50`), same pattern as the existing `hard-constraints-modal`.
- Modal box: white, rounded, max-width ~640px, full-width on mobile.
- **Header:** "Preferencias" / "Preferences" label + ✕ close button (top-right).
- **Bar:** Same colored segments as the panel bar, but ~120px tall. Drag handles are 4px wide for easier grabbing.
- **Preference list:** Below the bar, one row per preference: color dot · name · numeric percentage input. Identical to the existing list in the panel.
- **Footer:** "Cancelar" and "Aplicar" buttons, right-aligned.

### State management

- Opening the modal copies the current `configState.algorithm.evaluatorWeights` into a local modal state — it does **not** read from the DOM `weight-field` inputs to avoid any unsaved partial edits from the panel.
- While the modal is open, dragging handles and editing percentage inputs keep the bar and inputs in sync (same redistribution logic as the panel).
- **Cancelar / ✕:** discards modal state, closes without touching the panel.
- **Aplicar:** writes the modal weights back into the hidden `weight-field` inputs in the panel, calls `savePreferences()`, marks the config as dirty (`setDirty(true)`), then closes the modal.

### i18n

Two new translation keys added to both `ui.en` and `ui.es`:

| Key | en | es |
|---|---|---|
| `expandPreferences` | "Expand" | "Ampliar" |
| `applyPreferences` | "Apply" | "Aplicar" |

### Implementation scope

All changes are inside `web/index.html`:

1. New modal `<div>` in the HTML (after the existing `hard-constraints-modal`).
2. `openPrefsModal()` — builds modal bar + list from current weights, attaches drag/input logic.
3. `applyPrefsModal()` — writes weights to panel `weight-field` inputs, calls `savePreferences()` and `setDirty(true)`.
4. Expand button added to the preferences `<details>` summary.
5. Translation keys added to `ui.en` and `ui.es`.

`renderConfig` is not modified. The modal is self-contained.

## Out of scope

- Persisting modal state separately from the panel.
- Animating the modal open/close.
- Showing constraint descriptions inside the modal.
