# Workshop ↔ Portal integration

For the agent working on `download-portal`. The workshop app (this repo, served at
`download.lol/workshop`) now exposes client-scoped, access-code-gated surfaces the
portal can link to or pull from. Nothing on the portal side is required for the
workshop to function — integrate whenever it fits.

## The model

- Every workshop **client** has an `access_code` (e.g. `K7MN-PW3R`), stored in the
  shared Render Postgres, schema `workshop`, table `clients`. Admins manage codes in
  the workshop's internal view (`download.lol/workshop/clients`) and can set a
  **custom code** — so a client's workshop code can be made identical to their portal
  access code (e.g. AeroPress → `BETTERPRESS`). That is the intended way to unify
  credentials: same code on both sides, no shared auth infrastructure needed.
- Every workshop **session** (one per client + service + date) stores the full
  workshop output as JSON, plus an optional AI-written strategic brief
  (`workshop_data.aiBrief`).

## Surfaces the portal can use

### 1. Deep link (simplest — recommended first step)

```
https://download.lol/workshop/share/<ACCESS_CODE>
```

Read-only, client-facing, fully rendered workshop summary (all sessions for that
client, switchable, printable). No login needed; the code IS the credential; it can
only ever show that one client's data. Add it as a "Workshop" card/section in the
portal dashboard and link out.

### 2. JSON API (for rendering inside the portal)

```
GET https://download.lol/workshop/api/portal-brief?code=<ACCESS_CODE>
```

Returns `401` for a missing/unknown code, otherwise:

```json
{
  "client": { "name": "AeroPress", "facilitator": "Aiden" },
  "sessions": [
    {
      "id": "uuid",
      "serviceType": "social",
      "date": "2026-09-15",
      "status": "completed",
      "updatedAt": "...",
      "workshopData": { "goldenCircle": {}, "audiences": [], "aiBrief": "..." }
    }
  ],
  "shareUrl": "https://download.lol/workshop/share/<ACCESS_CODE>"
}
```

`workshopData` keys: `config, goldenCircle, audiences, empathyMaps, beforeAfter,
competitors, landscapePositions, landscapeAxes, voiceAttributes, personalitySliders,
voiceGuardrails, toneDimensions, contentPillars, platformStrategies, logistics,
videoStyles, campaignIdeas, priorities, aiBrief`. Shapes are in this repo's
`src/lib/types.ts`.

### 3. Direct DB (same Postgres)

The portal already talks to the same Render Postgres (its own `portal` schema). If
server-side is easier than HTTP: `workshop.clients` (has `access_code`) and
`workshop.sessions` (has `workshop_data` jsonb). Read-only, please — the workshop
app owns writes to these tables.

## Security notes

- Both `/workshop/share/*` and `/workshop/api/portal-brief` are exempt from the HQ
  admin login in `src/proxy.ts`; everything else in the workshop stays admin-only.
- Codes are unguessable 8-char strings from a 31-char alphabet unless an admin sets
  a custom one. A code only unlocks its own client — there is no enumeration
  endpoint and no cross-client query path.
- If a code leaks, regenerate it in the internal view; old links die instantly.
