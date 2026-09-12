# Milestone 0 — Architecture Reconnaissance Report

Status: **STOP after this report.** No product code has been written. No dependencies installed. No Milestone 1 work has begun.

---

## 1. Repository Assessment

* Directory contains **only `project.md`** (the spec). Not a git repository. No `package.json`, no framework, no lockfile, no `.env`, no existing code of any kind.
* Package manager: none installed. **Recommend pnpm** (workspace-friendly if we ever split platform packages later, faster installs).
* Existing routes / components / styling / state / database / auth / storage / deployment config: **none exist.** No conflicts to resolve — this is a clean slate.

Conclusion: nothing to reconcile. Milestone 0 is purely a proposal exercise.

---

## 2. Architecture Proposal

### Application (routes/layouts)

```
app/
  (app)/
    layout.tsx              → shell layout: sidebar + content region
    dashboard/page.tsx
    projects/page.tsx
    projects/[id]/page.tsx  → workspace (editor | preview split), own layout
    recipients/page.tsx
    assets/page.tsx
    settings/page.tsx
  api/
    projects/...             → route handlers or Server Actions (CRUD)
    recipients/...
    assets/...
```
The workspace route (`projects/[id]`) keeps the sidebar but its main region splits into Editor (42–46%) / Preview (54–58%) per spec. It gets its own layout, not a special-cased dashboard layout.

### UI

* Design tokens: CSS variables (color, radius, spacing, elevation) defined once, consumed by a Tailwind theme extension — not hardcoded utility values scattered through components.
* `components/ui/` — primitives (button, input, dropdown, popover, tooltip, panel, dialog) built on Radix primitives, styled to the dark/minimal/Apple-like direction. This is the shadcn/ui *pattern* (own the component source, not a black-box library).
* `components/shell/` — Sidebar, Workspace shell, top-level navigation chrome.
* `components/editor/`, `components/preview/` — feature-specific, composed from `ui/` primitives only. No feature component reaches into another feature's internals.

### State

Four explicitly separate concerns, matching spec §31:

| Store | Owns | Persisted? |
|---|---|---|
| `useUIStore` | sidebar collapsed, command palette open/closed, active panel, zoom/fit mode | no (session only) |
| `useEditorStore` | current project's messages[], selection, dirty flag, undo/redo history stack | working copy, debounced-synced to DB |
| `useProjectStore` | project metadata (name, platform, device, appearance, statusBar, background), list/cache of projects | working copy, debounced-synced to DB |
| renderer state | **none — derived**, not stored | computed via memoized selectors from editor + project state |

Rule: the renderer never owns state. It's a pure function of `(ConversationData, DeviceDefinition, appearance)`. This is what keeps preview and export identical (spec §13, §19).

### Data

Prisma + PostgreSQL. See §4.

### Rendering pipeline

```
Conversation Data                         (platform-agnostic: recipient, messages[], appearance, metadata)
        ↓
Platform Renderer      platforms/instagram/renderer
                        pure function: ConversationData → ScreenContent
                        (header, bubbles, input bar — screen content only, NO device chrome)
        ↓
Device Renderer         devices/iphone/renderer
                        wraps ScreenContent in a DeviceDefinition-driven frame:
                        screen geometry, corner radius, notch/Dynamic Island,
                        status bar overlay, home indicator, safe-area insets
        ↓
Export Renderer         same component tree as above, rendered off-screen
                        at 1x/2x/3x pixel density via a deterministic capture
                        path (not ad hoc DOM screenshotting of the live app)
```

**Hard rule:** preview and export call the *same* renderer tree. Export is a different render target/scale, never a second visual implementation.

Every platform implements a common `PlatformRenderer<ConversationData> → ScreenContent` interface plus a `capabilities` declaration (which message types, which header elements it supports). The editor and device/export engines only ever talk to this interface — never to Instagram-specific fields. That is the mechanism that lets iMessage/WhatsApp/Messenger get added later **without rewriting the editor.**

### Devices

`DeviceDefinition` objects are **data, not components**:

```ts
type DeviceDefinition = {
  id: string; family: "iphone"; model: string;
  width: number; height: number; aspectRatio: number;
  screenRadius: number; frameRadius: number;
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
  statusBarGeometry: { height: number; layout: "notch" | "dynamic-island" | "none" };
  cameraConfig?: { x: number; y: number; diameter: number };
  dynamicIslandConfig?: { width: number; height: number; x: number; y: number };
  homeIndicatorConfig: { width: number; bottomOffset: number };
};
```

A single generic `<DeviceFrame definition={def}>` renders **any** device from its definition. No per-model React component.

### Platforms

```
platforms/<platform>/
  schema/        Zod schemas for that platform's message/appearance metadata
  capabilities/  what content types & UI elements this platform supports in this version
  renderer/      pure ConversationData → ScreenContent
  components/    platform-specific visual pieces (bubble, header, input bar)
```

---

## 3. Folder Structure

```
app/
  (app)/dashboard, projects, projects/[id], recipients, assets, settings
  api/

components/
  ui/                 buttons, inputs, dropdown, popover, tooltip, panel, dialog
  shell/               sidebar, workspace shell
  dashboard/
  projects/
  editor/              message list, message item, add-message, recipient picker
  recipients/
  preview/             device preview canvas, zoom/fit/fullscreen controls
  devices/             <DeviceFrame>, status bar overlay
  export/
  assets/
  command-palette/

platforms/
  instagram/
    schema/  capabilities/  renderer/  components/
  # future: imessage/, whatsapp/, messenger/ — same shape

devices/
  iphone/
    definitions/       one module exporting DeviceDefinition[] for iPhone 13→17 line
    renderer/           generic device-frame renderer

stores/                 useUIStore, useEditorStore, useProjectStore
schemas/                shared Zod schemas (Conversation, Message, Recipient, Project)
lib/                    db client, auth, utils, undo/redo engine
prisma/                 schema.prisma, migrations
```

---

## 4. Data Model Proposal (V1)

```prisma
model User {
  id         String   @id @default(cuid())
  email      String   @unique
  recipients Recipient[]
  projects   Project[]
  assets     Asset[]
}

model Recipient {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  displayName String
  username    String
  avatarAssetId String?
  verified    Boolean @default(false)
  bio         String?
  activityStatus String?
  metadata    Json?     // platform-agnostic bag for future fields
  projects    Project[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

model Project {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  name         String
  platform     String              // "instagram" in V1
  recipientId  String?
  recipient    Recipient? @relation(fields: [recipientId], references: [id])
  device       Json                // { deviceId, appearance }
  statusBar    Json                // mode: auto | manual + fields
  background   Json                // type, color, opacity, blur, scale, position
  exportConfig Json?
  favorite     Boolean  @default(false)
  archivedAt   DateTime?
  messages     ProjectMessage[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId])
  @@index([recipientId])
}

model ProjectMessage {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  sender    String              // "me" | "recipient"
  type      String              // "text" in V1
  content   Json                // shape depends on `type`
  timestamp DateTime
  order     Float               // fractional-index ordering for cheap reorder
  metadata  Json?
  createdAt DateTime @default(now())

  @@index([projectId, order])
}

model Asset {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  kind       String              // avatar | background | media | logo
  url        String              // object storage URL, not binary in Postgres
  width      Int?
  height     Int?
  createdAt  DateTime @default(now())

  @@index([userId])
}
```

Future (not created now): `Template`, `Scene`, `SceneElement`, `Animation`, `Workspace`, `Team`.

`order` as a float (fractional indexing) avoids re-writing every row on reorder/drag — important given spec §11's drag-reorder requirement.

---

## 5. Rendering Architecture

Covered in §2. Restated as the one invariant that matters most:

> **Conversation Data → Platform Renderer → Device Renderer → Export Renderer**, and the Export Renderer never diverges visually from what Preview already showed, because they share the same component tree and only change render target/scale.

---

## 6. Device Architecture

Covered in §2. iPhone 13 through 17, standard/Plus/Pro/Pro Max variants, expressed purely as `DeviceDefinition` entries consumed by one generic frame renderer. Android support later is just more `DeviceDefinition` entries plus an `android` family renderer — no rewrite of the device engine.

---

## 7. State Architecture

* `useEditorStore`: messages array, selection, dirty flag, and an **undo/redo command stack** (recommend a simple command-pattern: each mutation pushes an inverse operation, not full-state snapshots, to stay cheap at 100+ messages).
* `useProjectStore`: current project metadata + a debounced autosave effect that pushes to the DB (Milestone 7) — in Milestones 1–6 this can persist to nothing / localStorage as a stand-in, explicitly marked temporary.
* `useUIStore`: pure UI/session state, never persisted.
* Renderer state: **not a store** — derived via memoized selectors so that editing one message doesn't rerender the whole app (spec §33).

---

## 8. Dependency Proposal

**Install now (Milestone 1 only):** `next`, `react`, `typescript`, `tailwindcss`, Radix primitives + `class-variance-authority` + `tailwind-merge` (shadcn/ui pattern), `framer-motion`, `zustand`, `zod`, `lucide-react`, fonts.

**Defer until their milestone (do not install yet):**
* `prisma`, `@prisma/client`, Postgres driver → Milestone 7
* Auth.js or Clerk → Milestone 7
* S3/R2 SDK → Milestone 6
* export/capture library (e.g. `html-to-image`, or a server-side canvas approach) → Milestone 8
* `react-hook-form` → introduce when the first real form appears (Recipient create/edit, Milestone 6) — not needed for Milestone 1's simple inline editor inputs
* Sentry, PostHog → Milestone 10 polish/RC, not before

This matches spec §37 ("never build everything at once") applied to dependencies, not just features.

---

## 9. Technical Risks

1. **Deterministic rendering** — preview and export must be pixel-consistent. Mitigate by sharing one render tree and picking a single capture strategy early (client-side DOM→canvas vs. server-side render); don't discover this in Milestone 8.
2. **Device geometry accuracy** — notch/Dynamic Island/corner-radius numbers must come from real Apple HIG figures, not eyeballed. Wrong once, wrong across every iPhone.
3. **Export consistency across browsers** — font rendering, subpixel rounding, and `backdrop-filter` support differ (especially Safari vs Chrome). Needs explicit test matrix in Milestone 8.
4. **State synchronization** — editor state, autosave, and derived renderer state must not race (e.g., autosave firing mid-undo). Undo/redo engine and autosave debounce need to be designed together, not bolted on later.
5. **Large images** — avatar/background uploads need an optimization/resize pipeline before hitting object storage, or preview performance and export memory degrade.
6. **Future platform leakage** — the biggest architectural risk is letting Instagram-specific assumptions creep into the shared `Conversation`/editor schema. The `capabilities` abstraction (§2) exists specifically to prevent this; it must be respected even when it's tempting to shortcut it "just for Instagram."
7. **Autosave conflict/error recovery** — spec §7 verification explicitly tests disconnect-during-save; needs a defined retry/conflict strategy, not "hope it works."

---

## 10. Recommended Implementation Order

Confirms alignment with the milestone sequence already defined in `project.md`:

```
M0 Architecture Reconnaissance   ← this report
M1 Foundation & Design System
M2 Application Shell & Workspace
M3 Core Conversation Editor (generic preview)
M4 Instagram Renderer
M5 iPhone Device Engine
M6 Recipient & Asset System
M7 Persistence & Project System
M8 Export Studio
M9 Product Polish & QA
M10 V1 Release Candidate
```

No deviation proposed. Rendering/device/state architecture above is designed specifically so each milestone only ever adds to this structure, never restructures it.

---

**STOP. Milestone 0 complete. Awaiting review/approval before Milestone 1 begins.**
