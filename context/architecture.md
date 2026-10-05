# Architecture Context

## Stack

| Layer            | Technology              | Role                                                           |
| ---------------- | ----------------------- | -------------------------------------------------------------- |
| Framework        | Next.js 16 + TypeScript | Full-stack app with server/client boundaries                   |
| UI               | Tailwind + shadcn/ui    | Component composition and styling                              |
| Auth             | Clerk                   | User identity and route protection                             |
| Database         | Prisma + PostgreSQL     | Relational metadata: projects, collaborators, specs, task runs |
| Canvas           | Liveblocks + React Flow | Real-time collaborative canvas, presence, and cursors          |
| Background tasks | Trigger.dev             | Durable AI generation workflows                                |
| Artifact storage | Vercel Blob             | Canvas snapshots and generated Markdown specs                  |
| AI               | OpenAI (`gpt-4o` default) | Design chat + Spec generation via Vercel AI SDK              |

## System Boundaries

- `app/api` — Authenticated request handlers: input validation, ownership checks, task triggering, and persistence.
- `trigger` — Long-running background jobs: AI design generation and spec generation.
- `lib` — Shared infrastructure: Prisma client, access control helpers, and utilities.
- `components` — UI composition: canvas surfaces, sidebars, dialogs, and interactive elements.
- `prisma` — Database schema and generated client output.
- `data` — Legacy local directory. Not used for new artifacts.

## Storage Model

- **Database**: metadata, ownership, relationships, and task run records.
- **Vercel Blob**: generated artifacts — canvas snapshots at `canvas/{projectId}.json` and specs at `specs/{projectId}/{specId}.md`.
- Project records, spec records, and task run records belong in PostgreSQL.
- Canvas content and Markdown output are stored in and retrieved from Vercel Blob.
- The blob URL is stored in the database (`canvasJsonPath`, `filePath`) as the reference to the artifact.

## Auth and Collaboration Model

- Every project has a single owner (Clerk user ID).
- Projects can include additional collaborators.
- Only authenticated users can access protected routes.
- Only the owner or a collaborator can mutate project resources.
- Liveblocks room tokens are issued only after verifying project membership.

## Starter System Designs

Text annotations use the existing `canvasNode` storage contract with an optional `textStyle` (`heading` or `paragraph`). They are not architecture components and have no handles. They sync/autosave/undo through existing node mutations; spec generation excludes annotation nodes, and Design snapshots identify them as annotations to preserve. Starter templates include explanatory annotations, roomier component cards, explicit connection handles, and realistic labeled request/async/data paths. WhatsApp-style and YouTube-style examples are reference designs rather than claims about proprietary infrastructure.

- Prebuilt templates are static canvas snapshots stored in the codebase. Each includes a high-level system view and a separate logical data model with entity keys, relationships, and storage guidance. Database-model edges carry optional relationship=true metadata, describe data ownership rather than execution steps, and are excluded from story/presentation travelers. WhatsApp includes ingress, chat/auth/presence/media services, async delivery, and persistent/ephemeral storage; client-side E2EE and pending ciphertext retention are explicit.
- Templates are loaded into the active Liveblocks room when a user imports one.
- Import can occur on canvas creation or from within the editor at any time.
- Template data follows the same node/edge schema as user-created canvas content.
- Templates do not require a separate database record; they are resolved by template ID at import time.

## AI Generation Model

### Design Generation

- Input: user prompt, project context, and current canvas state.
- Execution: durable background task via Trigger.dev.
- Output: structured node and edge updates written into the shared Liveblocks room.

### Spec Generation

- Input: current canvas graph and project context.
- Execution: durable background task via Trigger.dev.
- Output: Markdown technical spec saved to the filesystem and linked to the project in the database.

## Scenario Playback

Scenario definitions and playback state live in client memory. A pure timeline reducer governs play/pause/step/replay, while browser CSS animates travelers without shared-storage writes per frame. Loading the built-in case study adds ordinary nodes/edges through the existing collaborative flow API; the graph autosaves normally. Failure/recovery node states, queue annotations, and the playhead are viewer-local overlays and never change persisted node data. Edited/deleted scenario elements invalidate playback until the diagram is reloaded. Case-study values are illustrative annotations, not measured capacity or a production simulator.

## Invariants

1. Request handlers do not run long-lived AI work — that belongs in background tasks.
2. Metadata and large generated artifacts are stored in separate layers.
3. Auth and ownership are enforced at every mutation boundary.
4. Client components are used only where browser interactivity or real-time state requires them.
5. The canvas schema must remain consistent between user-created content and imported templates.
