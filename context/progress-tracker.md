# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Foundation

## Current Goal

- None

## Completed
  - Installed shadcn/ui with dark theme configuration
  - Added 14 UI components: button, input, select, dialog, tooltip, badge, card, avatar, dropdown-menu, separator, sheet, tabs, alert, alert-dialog
  - Created lib/utils.ts with cn() helper function
  - Fixed globals.css semantic tokens (`text-copy-*`, `text-brand`, `bg-bg-*`) so icons and headings are readable on dark backgrounds
  - Resolved mistaken use of `text-primary` / `text-secondary` (shadcn surface colors) for UI copy
  - Installed lucide-react for icons
- Editor chrome (02-editor)
  - `editor-navbar.tsx`: fixed top bar, sidebar toggle with readable icons, three sections
  - `project-sidebar.tsx`: overlay Sheet from left, tabs (My Projects / Shared), empty states, New Project button, backdrop closes on outside tap
  - `dialog-pattern.tsx`: title, description, close, footer using design tokens and `rounded-3xl`
  - `editor-shell.tsx` + `/editor` route wiring home + sidebar + navbar without pushing canvas content
- Clerk authentication
  - ClerkProvider, sign-in/sign-up pages, proxy protection, UserButton in navbar, post-auth redirect to `/editor`
- Project dialogs (04-project-dialogs)
  - Create / rename / delete dialogs with slug preview and owned-only sidebar actions
- Prisma data layer (05-prisma)
  - `prisma/models/project.prisma`: `Project`, `ProjectCollaborator`, `ProjectStatus` enum
  - `prisma.config.ts` with multi-file schema (`schema: "prisma"`)
  - `lib/prisma.ts`: cached singleton; Accelerate when `DATABASE_URL` starts with `prisma+postgres://`, else `@prisma/adapter-pg`
  - Initial migration `20260531141632_init_projects` applied
  - Added `pg` dependency and `postinstall` / `db:migrate` scripts
- Project APIs (06-project-apis)
  - `GET /api/projects` — list projects for authenticated owner
  - `POST /api/projects` — create project (`Untitled Project` default name, optional custom `id` for room alignment)
  - `PATCH /api/projects/[roomId]` — rename (owner only)
  - `DELETE /api/projects/[roomId]` — delete (owner only)
  - `401` / `403` / `404` / `400` responses via `lib/api/auth.ts` and `lib/api/responses.ts`
- Wire editor to APIs (07-wire-editor)
  - `lib/projects.ts` — server-side `getProjectsForUser()` (owned + shared via collaborator email)
  - `/editor` and `/editor/[roomId]` server pages fetch projects and pass to client shells
  - `useProjectActions` hook: create (slug + suffix room ID, POST, navigate), rename (PATCH + refresh), delete (DELETE + redirect or refresh)
  - Sidebar, dialogs, and list navigation wired to real API data
  - Project ID doubles as Liveblocks room ID
- Editor workspace shell (08-editor-workspace-shell)
  - `lib/project-access.ts` — Clerk identity, owner/collaborator access checks, `getAccessibleProject()`
  - `/editor/[roomId]` server page: redirect to sign-in, `AccessDenied` for missing/forbidden, workspace shell on success
  - `components/editor/access-denied.tsx` — lock icon, message, link to `/editor`
  - `EditorWorkspaceShell` — full-viewport layout with project navbar, canvas placeholder, AI sidebar placeholder
  - Workspace navbar: project name, Share button, AI toggle, sidebar toggle
  - Active room highlighted in `ProjectSidebar`
- Share dialog (09-share-dialog)
  - `GET/POST /api/projects/[roomId]/collaborators` — list and invite (owner-only for invite)
  - `DELETE /api/projects/[roomId]/collaborators/[collaboratorId]` — remove (owner-only)
  - `lib/clerk-users.ts` — Clerk Backend API enrichment for display name and avatar by email
  - `ShareDialog` — invite by email, collaborator list, remove (owners), read-only list (collaborators), copy link with `Copied!` feedback
  - Share button wired in workspace navbar
- Liveblocks setup (10-liveblock-setup)
  - `liveblocks.config.ts` — `Presence` (cursor, `isThinking`), `UserMeta` (id, name, avatar, color)
  - `lib/liveblocks.ts` — cached `@liveblocks/node` client (`LIVEBLOCKS_SECRET_KEY`)
  - `lib/liveblocks-user-color.ts` — deterministic cursor color from user ID palette
  - `lib/liveblocks-room.ts` — `getOrCreateRoom` for project room IDs (private rooms)
  - `POST /api/liveblocks-auth` — Clerk auth, project access check, room ensure, session token with user metadata; `403` when access denied
  - Installed `@liveblocks/node`, `@liveblocks/client`, `@liveblocks/react`
- Base canvas (11-base-canvas)
  - `types/canvas.ts` — `CanvasNodeData` (label, color, shape), `canvasNode` / `canvasEdge` types, `NODE_COLORS`, `NODE_SHAPES`
  - `EditorCanvas` — `LiveblocksProvider` (`/api/liveblocks-auth`), `RoomProvider`, initial presence (`cursor: null`), `ClientSideSuspense`, connection error guard
  - `EditorFlowCanvas` — `useLiveblocksFlow` (suspense, empty nodes/edges), React Flow with loose connections, `fitView`, `MiniMap`, dot `Background`
  - Workspace shell wired to live canvas; `/editor/[roomId]` page remains server-rendered
  - Installed `@xyflow/react`, `@liveblocks/react-flow`
- Shape panel (12-shape-panel)
  - `ShapePanel` — floating pill toolbar at bottom-center with draggable shape icons
  - `SHAPE_DEFAULT_SIZES` and `CANVAS_SHAPE_DRAG_TYPE` drag payload (shape + width/height)
  - Canvas wrapper `dragover` / `drop` with `screenToFlowPosition` and Liveblocks node add
  - `lib/canvas-node-factory.ts` — node ID (`{shape}-{timestamp}-{counter}`), drop parsing, node creation
  - `CanvasNode` — basic bordered rectangle renderer with centered label (all shapes for now)
- Node shapes (13-node-shape)
  - `CanvasNodeShapeView` — CSS shapes (rectangle, pill, circle) and SVG shapes (diamond, hexagon, cylinder) with scaled borders
  - Selected nodes use `border-brand`; unselected use subtle border
  - `ShapeDragPreviewProvider` — ghost preview follows cursor during shape panel drag; hidden on drop/cancel
  - Drop/node creation logic unchanged
- Node editing (14-node-editing)
  - `NodeResizer` on selected nodes with min size (48×40) and subtle dark-theme handles
  - `CanvasNodeLabelEditor` — double-click to edit, centered textarea, live label sync via `onNodesChange`
  - `CanvasFlowProvider` — collaborative label updates through Liveblocks flow state
  - Editing closes on blur or Escape; pointer events stopped to avoid canvas drag/pan
- Node color toolbar (15-nodes-color-toolbar)
  - `NodeColorToolbar` — floating swatch bar above selected nodes via `NodeToolbar`
  - 8 predefined fill/text pairs from `NODE_COLORS`; active swatch highlighted with brand border + text-color glow
  - Hover glow per swatch text color; interactions use `nodrag` / `nopan`
  - `updateNodeColor` in `CanvasFlowProvider` syncs `color` + `textColor` through Liveblocks `onNodesChange`
  - `CanvasNodeData.textColor` added; `resolveNodeTextColor` fallback for existing nodes
- Edge behavior (16-edge-behavior)
  - `CanvasNodeHandles` — source + target handles on all four sides; white dots, fade in on node hover
  - `CanvasEdge` — smooth-step routing, dimmed at rest / bright when hovered or selected, `interactionWidth` for easier clicks
  - Arrow markers via `defaultEdgeOptions`; new connections use `canvasEdge` type
  - `CanvasEdgeLabelEditor` — double-click to edit at `getSmoothStepPath` midpoint via `EdgeLabelRenderer`; pill badges; growing input; save on blur/Enter/Escape
  - `updateEdgeLabel` in `CanvasFlowProvider` syncs through Liveblocks `onEdgesChange`
- Canvas ergonomics (17-canvas-ergonomics)
  - `CanvasControlBar` — bottom-left pill toolbar (zoom out, fit view, zoom in | undo, redo)
  - Zoom wired to React Flow with `CANVAS_ZOOM_DURATION_MS` animation
  - Undo/redo via Liveblocks `useUndo` / `useRedo`; disabled state when history empty
  - `useKeyboardShortcuts` — `+`/`=`, `-`, `Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`, `Cmd/Ctrl+Y`; skips editable fields
  - MiniMap removed
- Starter templates (18-starter-template)
  - `starter-templates.ts` — `CanvasTemplate` type, `CANVAS_TEMPLATES` (microservices, CI/CD pipeline, event-driven), bounds helpers, `applyCanvasTemplate` replace import
  - `starter-templates-modal.tsx` — dialog with scrollable template grid, lightweight SVG previews, per-card import
  - Workspace navbar **Templates** button opens modal; import clears then replaces nodes/edges via Liveblocks flow changes and `fitView`
- Presence avatars and cursors (19-presence-avatars-cursor)
  - `liveblocks.config.ts` — Presence uses `cursor` + `thinking`
  - `canvas-presence-avatars.tsx` — top-right canvas overlay with collaborator stack (max 5 + overflow), Clerk UserButton, divider when others present
  - `canvas-presence-cursor.tsx` — colored pointer + name badge for other participants
  - `Cursors` from `@liveblocks/react-flow` broadcasts pointer position; workspace navbar UserButton removed (home navbar unchanged)
- AI sidebar shell (20-ai-sidebar-shell)
  - `editor-ai-sidebar.tsx` — floating right overlay with slide-in animation, header, AI Architect + Specs tabs
  - AI Architect: empty state, starter chips, local chat UI, auto-resizing textarea, Enter/Shift+Enter handling
  - Specs: Generate Spec button + static demo spec card with disabled download
  - Added shadcn `Textarea`; removed placeholder component
- Canvas autosave (21-canvas-autosave)
  - `canvasJsonPath` on Project stores Vercel Blob URL; JSON at `canvas/{roomId}.json`
  - `GET/PUT /api/projects/[roomId]/canvas` — access-checked load/save via Prisma + `@vercel/blob`
  - `useCanvasAutosave` — debounced PUT, blob restore when Liveblocks room is empty, save status
  - Workspace navbar **Save** button shows idle / saving / saved / error
- Design agent API (22-design-agent-api)
  - `TaskRun` Prisma model — `runId`, `projectId`, `userId`, indexes
  - `trigger/design-agent.ts` — minimal `design-agent` task (logs/echoes payload)
  - `POST /api/ai/design` — access-checked trigger + TaskRun record, returns `runId`
  - `POST /api/ai/design/token` — run ownership verify + Trigger.dev public token
  - Installed `@trigger.dev/sdk`, added `trigger.config.ts`
- Design agent logic (23-design-agent-logic)
  - `trigger/design-agent.ts` — Gemini plan via `@ai-sdk/google`, canvas mutations via `mutateFlow`, status feed + Miro AI presence, error handling
  - `lib/design-agent-gemini.ts` — `generateDesignPlan()` with Zod action schema
  - `lib/canvas-design-actions.ts` — add/move/resize/update/delete nodes, add/delete edges through Liveblocks flow
  - `lib/liveblocks-ai-agent.ts` — `publishAiStatus`, `setAiAgentPresence`, `clearAiAgentPresence` via `@liveblocks/node`
  - `types/design-agent-actions.ts` — Zod schemas for canvas actions
  - `types/tasks.ts` — `AI_AGENT_USER_ID`, feed IDs, status message validation, `isAiGenerationActive()`
  - `EditorAiSidebar` wired to `POST /api/ai/design`; rendered inside `RoomProvider` in `EditorCanvas`
  - Installed `ai`, `@ai-sdk/google`, `zod`; aligned `@liveblocks/node` to 3.19.5 for `mutateFlow` type compatibility
- AI presence state (24-ai-presence-state)
  - `types/tasks.ts` — `aiStatusFeedMessageSchema` (Zod), `parseAiStatusFeedMessage`, `isAiGenerationActive()`
  - `hooks/use-ai-generation-state.ts` — subscribes to `ai-status-feed` + Miro AI `thinking` presence; latest validated status only
  - `components/editor/ai-status-indicator.tsx` — shared status bar in AI sidebar
  - Sidebar disables input/send while generating; send button shows spinner; Enter blocked during generation
  - `canvas-presence-cursor.tsx` — `Loader2` spinner in name badge when `thinking: true`
- Sidebar chat feed (25-sidebar-chat-feed)
  - `AI_CHAT_FEED_ID` (`ai-chat`) — separate from `ai-status-feed`
  - `types/tasks.ts` — `aiChatMessageSchema` (sender, role, content, timestamp)
  - `hooks/use-ai-chat-feed.ts` — subscribe, validate, send via `useCreateFeedMessage`
  - `components/editor/ai-chat-message.tsx` — sender, timestamp, content bubbles
  - `editor-ai-sidebar.tsx` — real-time room chat; input clears on send; error state on failure
- Design agent frontend (26-design-agent-frontend)
  - `lib/design-agent-client.ts` — `POST /api/ai/design` + token fetch for `runId` / `publicToken`
  - `hooks/use-design-agent-run.ts` — `useRealtimeRun` tracks active runs; disables input while running
  - `hooks/use-ai-chat-feed.ts` — `sendUserMessage` + `sendAssistantMessage` to `ai-chat`
  - `components/editor/ai-run-status-strip.tsx` — compact status above input during active runs (reads `ai-status-feed`)
  - `editor-ai-sidebar.tsx` — submit pushes chat + triggers design; completion/error replies in feed; green chat/submit tokens
  - Installed `@trigger.dev/react-hooks`; added `--color-accent-chat` tokens in `globals.css`
- Spec generation flow (27-spec-generation-flow)
  - `POST /api/ai/spec` — validates `roomId`, `chatHistory`, `nodes`, `edges`; access from `roomId` only; triggers `generate-spec`; creates `TaskRun`
  - `POST /api/ai/spec/token` — run ownership verify; public token scoped to run with `expirationTime: "1h"`
  - `trigger/generate-spec.ts` — Zod validation, Gemini Markdown generation, run metadata (`status`, `progress`)
  - `types/spec-agent.ts` — payload + request Zod schemas
  - `lib/spec-agent-gemini.ts` — `generateSpecMarkdown()` via `@ai-sdk/google`
- Spec persistence and download (28-spec-persistence-download)
  - `ProjectSpec` Prisma model — `id`, `projectId`, `filePath`, `createdAt`
  - `lib/save-project-spec.ts` — uploads Markdown to Vercel Blob at `specs/{projectId}/{specId}.md`; stores URL in Prisma
  - `trigger/generate-spec.ts` — persists spec after generation; returns `{ markdown, specId }`; metadata includes `specId`
  - `GET /api/projects/[roomId]/specs/[specId]/download` — access-checked Markdown attachment download
- Spec UI integration (29-spec-ui-integration)
  - `GET /api/projects/[roomId]/specs` — metadata list (`id`, `createdAt`, `filename`; no blob URLs)
  - `hooks/use-project-specs.ts` — fetches spec list for current project
  - `components/editor/ai-specs-tab.tsx` — scrollable spec list with filename + date; download per item
  - `components/editor/spec-preview-modal.tsx` — Dialog preview via download endpoint; Markdown render; download action
  - `components/editor/spec-markdown.tsx` — styled Markdown renderer
  - Installed `react-markdown`, `@radix-ui/react-scroll-area`; added shadcn `ScrollArea`
- Fix flow storage on shape drop (30-fix-flow-storage-shape-drop)
  - Aligned all `@liveblocks/*` packages to `3.19.5`
  - `lib/flow-storage.ts` — `FLOW_STORAGE_KEY`, `isValidFlowStorage()` for LiveObject + LiveMap checks
  - `hooks/use-flow-storage-ready.ts` — repairs corrupted `"flow"` storage; returns `isFlowReady` after init
  - `editor-flow-canvas.tsx` — guards shape drop and template import until flow storage is ready
  - `use-canvas-autosave.ts` — waits for `isFlowReady` before Blob restore
- OpenAI for AI generation (post-30)
  - Replaced Gemini with OpenAI (`@ai-sdk/openai`) for Design chat and Spec generation
  - `lib/openai.ts` — `OPENAI_API_KEY` + optional `OPENAI_MODEL` (default `gpt-4o`)
  - `lib/design-agent-openai.ts`, `lib/spec-agent-openai.ts` — replaced `*-gemini` modules
  - `lib/canvas-flow-snapshot.ts` — Design chat reads Liveblocks flow before planning (reuse nodes + edges)
  - Removed `@ai-sdk/google`; ADR `docs/adr/0001-openai-for-ai-generation.md`; `CONTEXT.md` glossary
- Fix AI presence cursor `resolveUsers` crash
  - `canvas-presence-cursor.tsx` — stop using `useUser` (needs `resolveUsers`); read name/color/`thinking` from room `useOther` info instead (works for humans + `miro-ai`)

## In Progress

- Architecture canvas v2 — Flow animation + Present mode done (initiative complete)

## Next Up

- #5 Delete/Backspace shortcuts
- #6 Empty canvas hint
- #7 Change node shape after drop
- #8 Specs tab empty state

## Open Questions

- None yet.

## Architecture Decisions

- Prisma client uses Accelerate URL when configured; otherwise direct PostgreSQL via `PrismaPg` adapter.
- Project `id` is the Liveblocks room ID (`{slugified-name}-{suffix}` on create).
- `/editor` is the project home; `/editor/[roomId]` is the workspace shell.
- Collaborators stored by email in `ProjectCollaborator`; profile enrichment via Clerk Backend API only (no local user table).
- Liveblocks uses access-token auth via `prepareSession` + per-request `session.allow(room)` after Prisma access checks; rooms created with `defaultAccesses: []`.
- Canvas state synced via `useLiveblocksFlow` in Liveblocks Storage; node shapes rendered via shared `CanvasNodeShapeView`.
- AI design agent runs as Trigger.dev task; canvas updates use server-side `mutateFlow`; Archflow presence via `setPresence` (`archflow-ai` user ID).
- Shared AI progress uses Liveblocks feed `ai-status-feed` (single latest message) plus presence `thinking` flag.
- Room chat uses separate Liveblocks feed `ai-chat`; messages validated with Zod before render.
- Spec generation runs as Trigger.dev `generate-spec` task; `projectId` derived server-side from authenticated `roomId` access.
- Spec content stored in Vercel Blob; `ProjectSpec` holds metadata + `filePath`; download served through access-checked API route.
- Design chat and Spec generation use OpenAI (`gpt-4o` default); Design chat plans against a Liveblocks canvas snapshot so existing nodes are reused.
- Design chat planning goes through `runDesignAgentTurn` (snapshot + message → turn result); OpenAI `generateDesignPlan` is injected as the plan dependency so the turn seam stays testable without Liveblocks/UI.
- Nodes may carry optional `componentKind` (v1 catalog in `types/component-kind.ts`); geometric `shape` remains required for rendering; Design plans prefer kinds and fill shape/color/size from the catalog when omitted.
- Groups are `canvasGroup` flow nodes with real React Flow containment (`parentId` + `extent: "parent"`); Design plans use `add_group` / `update_group` / `delete_group` and `parentId` on nodes; absolute coords convert to Group-relative on apply/drop.
- Hybrid Design chat: `decideDesignAgentTurn` chooses interview vs plan; interview replies go to `ai-chat` with optional `offerGenerate`; Generate on canvas uses `intent: "generate"` to force a plan from chat history; clear edits still plan/apply immediately.
- Apply animation: while Archflow apply is active, new Nodes/Groups/Edges play short CSS enter motion; React Flow node transform/size soft-transitions; Design plan actions are paced with `APPLY_ACTION_GAP_MS`.
- Flow animation + Present mode: edges carry `sequence` (Design or topological); travelers + hop badges while playing; brief play after apply; Present mode toggle keeps Flow on.

## Session Notes

- Canvas declutter + text + reference templates (2026-10-05): replaced the permanently expanded palette with a compact bottom dock and a searchable, dismissible picker that closes after a palette drag. Added click/drag Heading and Paragraph tools, multiline collaborative text editing, resizing, and style switching without connection handles. Annotation nodes reuse existing storage/autosave/undo, are identified in Design snapshots, and are excluded from infrastructure spec payloads. Rebuilt all five templates as focused reference systems: WhatsApp-style encrypted delivery, YouTube-style queued video processing, e-commerce orders with inventory/payment/outbox events, immutable-artifact CI/CD, and independent event subscribers with consumer dead-letter handling. Templates include titles/notes, larger readable cards, separated lanes, explicit side handles, and labeled sequences; branded examples are explicitly illustrative. Fixed grouped preview positions, preview curve/arrow rendering, and preservation of edge sequences when labels change. Canvas now fills available workspace height. Existing boards are preserved; reimport applies new template layouts. TypeScript, targeted lint, and all 80 tests passed, including annotation/spec boundaries and template containment/non-overlap/reference checks. The supplied screenshot guided layout cleanup; post-change live browser appearance remains unverified.
- Playable system stories (2026-10-05): added a collapsible System stories panel with play/pause, previous/next, replay, narration, and a step counter. Current diagrams support a connection-order walkthrough. Added an append-only traffic-spike example with Failure/Recovery paths illustrating concurrent requests, slow queries, accumulated work, retry storms, request failure, cache hits, bounded queues, backpressure, and recovery. CSS travelers pause in place; viewer-local node/edge overlays never mutate stored graph data. Loading the case study adds ordinary collaborative nodes/edges beside existing work and fits the example. Playback resets for graph topology changes and disables a case study when its references are removed/rewired; motion respects reduced-motion preferences. Scenario binding/playhead are session-local; the graph autosaves normally. TypeScript, targeted ESLint, and all 71 tests passed before final nonstructural refinements; browser preview attempts failed because the in-app webview could not attach. Temporary preview files/server were removed. Authoring and blog embeds/export remain future units.
- Fixed architecture icon lookup crash (2026-10-05): reproduced `Cannot read properties of undefined (reading 'tile')` through actual React server rendering with an unknown saved component kind. Validate kinds before icon/color lookup; unknown icons use a generic Box, and unknown node kinds retain geometric rendering and labels. Enabled TSX test discovery and added rendering regression coverage for all 17 catalog entries plus unknown saved nodes/icons. All 65 tests passed; live reported page/build has not been inspected.
- Canvas component styling (2026-10-05): added restrained diagram accent tokens and consistent Lucide stroke icons; components now render as tinted cards with readable labels, type captions, subtle borders, and selection rings. Added AWS EC2, Amazon S3, and Cloudflare R2 to the shared catalog (palette, drag/drop, and Design schema). Palette entries show labels; generic shapes have softer outlines, rounded rectangles, gradients, and depth. Handles are invisible at rest and reveal on hover/focus or an active connection drag. Component resize minimums preserve space for icons and labels. TypeScript, targeted ESLint, and all 46 tests passed; live browser appearance remains unverified.
- Smooth canvas connectors (2026-10-05): replaced rounded right-angle edges with continuous Bézier curves; drawing previews use matching geometry and labels follow the curve midpoint. Memoized playback edge inputs to avoid recomputing travel order on node moves. Direct dragging bypasses AI layout transitions; apply animations respect reduced-motion preferences. TypeScript and all 15 flow-animation tests pass; targeted lint stalled without diagnostics and was stopped; live collaborative browser feel remains unverified. Interactive failure scenarios and blog publishing are deferred to the next feature unit.
- Renamed product branding from Miro AI / miro-clone to **Archflow** (package, UI, agent display name, Liveblocks AI user id `archflow-ai`).
- Canvas UX polish: sequential hop Flow playhead; minZoom 0.05; marquee multi-select + Delete; larger connect handles; WhatsApp/YouTube templates; stricter AI layout spacing; architecture icon cards for component kinds (phone, cloud, server stack, bucket, etc.).
- Flow animation + Present mode: `resolveTravelSequences` + brief post-apply play; Present toggle on control bar; edge travelers show direction and hop order (not metrics).
- Apply animation: enter fade/scale for Nodes/Groups and fade for Edges during AI apply; soft RF node transitions; Design apply staggered via `nextApplyActionDelayMs`.
- Wire Spec generation: Specs tab Generate Spec posts canvas+chat via `buildSpecTriggerBody` → `/api/ai/spec` + token; `useSpecAgentRun` tracks Trigger run; list refresh on complete; Groups omitted from Spec payload.
- Hybrid Design interview: turn outcomes interview|plan; Generate on canvas button; history + intent in design API/Trigger.
- Groups: named frames with containment; Groups tab; Design plan group actions; drop-to-nest.
- Component kinds: shape panel Components|Shapes; kind icons; drag/drop + Design plan persist `componentKind`; OpenAI prompt updated.
- Prefactor Design agent turn: added `lib/design-agent-turn.ts` + Vitest; Trigger `design-agent` calls `runDesignAgentTurn` then applies plan; behavior still always-plan.
- Fixed AI presence cursor crash: `CanvasPresenceCursor` called `useUser("miro-ai")`, which requires `resolveUsers`, but none was configured. Switched to room `useOther(...).info` (same source as avatars) so human session `userInfo` and AI `setPresence` `userInfo` both work; removed debug `console.log`s.
- Workspace navbar: board title absolutely centered in the full header width (`left-1/2 -translate-x-1/2`) so unequal left/right action groups no longer bias it; truncates with ellipsis via `max-w-[min(40vw,calc(100%-22rem))]`.
- Fixed `/editor/[roomId]` 404: Next.js requires the same dynamic segment name app-wide (`roomId`); API routes renamed from `[projectId]`; clear `.next` after such changes.
- Feature 23: moved `EditorAiSidebar` inside `RoomProvider` so feed/presence hooks work; aligned `@liveblocks/node@3.19.5` with `@liveblocks/react-flow` to fix duplicate `@liveblocks/core` type errors.
- Feature 25: sidebar chat uses `ai-chat` feed only; design API trigger removed from chat input per feature scope.
- Feature 26: design submit triggers `/api/ai/design` + token route; `useRealtimeRun` tracks run; canvas updates via Liveblocks only.
- Feature 27: spec backend at `/api/ai/spec` + token route; Gemini Markdown output via `generate-spec` task.
- Feature 28: `ProjectSpec` + Blob persistence in generate-spec task; download at `/api/projects/[roomId]/specs/[specId]/download`.
- Feature 29: Specs tab lists project specs, preview modal renders Markdown, download via access-checked API routes.
- Audit (features 12–29): canvas shape/edge tooling exists in code; runtime visibility may need z-index fix. UserButton on canvas is intentional per feature 19. Generate Spec button still unwired.
- Feature 30: flow storage repair on load; shape drop/template/autosave guarded until `"flow"` LiveObject is valid; Liveblocks packages aligned to 3.19.5.
- Switched AI from Gemini to OpenAI; Design chat now receives current canvas snapshot for reuse/connect quality.

- System story layout repair (2026-10-05): corrected the missing flex parent beneath the fixed navbar that collapsed the percentage-height canvas after the previous height change. Redesigned the story player with a fixed header/footer, bounded scrolling body, larger narration, step progress, labeled Play/Pause, and a collapsible traffic-spike chooser. Targeted ESLint and all 80 tests pass; live browser appearance remains unverified because the browser attachment was unavailable in this session.

- Compact story player (2026-10-05): removed the internal scrollbar and percentage max-height, removed the header subtitle, reduced narration spacing, and replaced the bulky expandable case-study card with a single import action and shared-canvas notice. No Interactive walkthrough string or duplicate story panel exists in current source; the supplied screenshot shows the older implementation. Browser appearance remains unverified.

- Group deletion and selection actions (2026-10-05): fixed group toolbar removal by invoking Liveblocks onDelete, since its onNodesChange ignores remove changes. Frame removal preserves direct children and their positions/outer parent, including nested frames. Added Ctrl/Cmd+A canvas selection and a floating count/Delete selection/Clear selection toolbar. Keyboard delete remains available outside text editors; disabled React Flow's duplicate keyboard handler. Added a regression test reproducing the ignored-remove bug and covering root/nested frame removal. Full existing suite plus the initial regression passed (81 tests); final targeted checks recorded below. Live browser interaction remains unverified.
- Final validation: TypeScript and targeted ESLint pass; both root/nested group deletion regression cases pass.

- High-level template architectures (2026-10-05): expanded WhatsApp to ingress/load balancing, API/WSS, authentication/device identities, chat/presence/media services, delivery broker/workers, SQL metadata, partitioned pending ciphertext, Redis sessions, S3/CDN and offline push. All five templates now include a separate logical data model with keys, ownership/index guidance and labeled relationships. Added supporting catalog/storage paths for video/e-commerce, orchestration state for CI/CD, and transactional outbox for events. Relationship edges are dashed and excluded from story/presentation travelers. Template replacement now uses Liveblocks onDelete before adding nodes/edges, and snapshot restore uses the same callback. Reviewed the requested GeeksforGeeks HLD and Meta E2EE reference; designs are educational examples. All 89 tests pass; browser visual validation remains unavailable.
- Final template validation: TypeScript and targeted ESLint pass. Snapshot refs now refresh in an effect to comply with the existing React lint rule; all 89 tests passed before that final ref-sync adjustment.

- README and licensing (2026-10-05): condensed README into a short product introduction, current feature list, local setup and development commands; corrected the demo URL and removed internal architecture/troubleshooting detail. Added the standard MIT LICENSE and matching package/lockfile metadata. Verified referenced files, scripts and JSON metadata; no application code changed.
