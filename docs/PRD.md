# DoctorPlan — Product Requirements Document

## Overview

**DoctorPlan** is a web application that generates fair, constraint-aware on-duty schedules for hospital services. It uses an evolutionary algorithm to balance duty counts, respect availability constraints, and honour personal preferences — reducing the time and conflict that manual scheduling causes in medical teams.

The initial version is a local CLI and REST API. The product direction is to evolve it into a hosted, multi-tenant web application with self-service configuration and usage-based pricing.

---

## Users

| Persona | Description |
|---------|-------------|
| **Schedule manager** | The doctor or administrator responsible for producing the monthly roster. Configures doctors, constraints and algorithm parameters; triggers generation; exports the result. |
| **Service admin** | Manages the subscription and can adjust server-level settings (pricing tier, app version). Not exposed in the UI. |

---

## Core features

### Schedule generation

- Generates on-duty schedules for a given month using a genetic algorithm.
- Inputs: doctor list, availability constraints, personal preferences, algorithm parameters.
- Output: a day-by-day schedule with a fairness score and generation statistics.
- Generation runs asynchronously; progress (score, generation, mean) is shown in real time.
- The user can cancel at any point and receive the best schedule found so far.

### Configuration editor

The web UI exposes all user-editable configuration in a sidebar:

- **Doctors** — name, internal ID, unavailable weekdays, back-to-back tolerance.
- **Per-doctor date preferences** — unavailable dates, desired duty dates, desired free dates, duty offset.
- **Algorithm parameters** — population size, generation limit, stop score, mutation, elitism, island options, offset ratio.
- **Constraint weights** — individual weight for each evaluator; set to 0 to disable a constraint.

Changes are held in memory until the user explicitly saves or discards them.

### Price estimation

Before triggering generation, the UI shows an estimated cost based on the complexity of the requested calculation:

```
complexity = (populationSize × islands × generationLimit) / ref_algo
           × (days × doctors × activeConstraints) / ref_env

price = BASE_PRICE × complexity^0.4 × tier_multiplier
price = max(price, tier_floor)
```

The formula uses sublinear scaling so extreme configurations do not produce unreasonable prices. The pricing tier is set server-side and is not editable by users.

### Pricing tiers

| Tier | Internal key | Intended use |
|------|-------------|--------------|
| Free | `free` | Beta / internal testing. Price is always €0. |
| Starter | `low` | Small services, occasional use. ~€0.10 – €2 per generation. |
| Pro | `medium` | Regular use. ~€1 – €10 per generation. |
| Enterprise | `high` | Large services, high-complexity schedules. ~€5 – €50 per generation. |

The active tier is shown as a badge next to the DoctorPlan logotype.

---

## Authentication and subscriptions (planned)

### Google login

Users authenticate with their Google account (OAuth 2.0). No username/password registration.

### Per-user subscription tier

Each authenticated user has a subscription tier (Free / Starter / Pro / Enterprise). The pricing tier badge shown in the UI reflects their own subscription, not a server-wide setting. The server validates the tier on each generation request.

### Billing

Payment integration is out of scope for the initial release. The price estimate is shown to the user before generation, and the actual charge is processed at generation time once billing is wired up.

---

## App version

A version string (e.g. `beta`, `v1.0`, `2026.05`) is set in server configuration and displayed as a badge next to the pricing tier badge in the header. Both badges are read-only for users.

---

## UI principles

- **Progressive disclosure** — Advanced sections (algorithm parameters, constraint weights, API settings) are collapsed by default and expanded on demand.
- **No surprises on save** — The UI tracks unsaved changes and disables Save/Discard when the config is clean.
- **Locale-aware** — The interface detects `navigator.language` and renders in English or Spanish. Dates always use DD/MM/YYYY; prices use the locale's currency format.
- **Tooltips** — Hovering any info icon shows a floating description. No clicks required.

---

## Out of scope (for now)

- Team management (inviting colleagues to a shared workspace).
- Schedule export to PDF or calendar formats.
- Historical schedule storage and comparison.
- Custom constraint authoring.
