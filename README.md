# Archflow

A real-time collaborative system design workspace. Describe an architecture in plain English, let an AI agent map it onto a shared canvas, refine it with collaborators, and generate a Markdown technical specification from the resulting graph.

**Live demo:** [archflow-mauve.vercel.app](archflow-mauve.vercel.app)

![Archflow editor — WhatsApp system design on the collaborative canvas with the AI Architect sidebar](./public/Screenshot.png)

## Features

- **Authentication & projects** — Clerk sign-in, project CRUD, owner/collaborator access
- **Collaborative canvas** — Liveblocks + React Flow with live cursors, presence, shapes, edges, undo/redo, and zoom controls
- **Starter templates** — Import prebuilt system designs (microservices, CI/CD, event-driven, and more)
- **Canvas autosave** — Debounced snapshots to Vercel Blob with manual save status in the navbar
- **AI design agent** — Submit prompts from the sidebar; OpenAI plans canvas mutations via Trigger.dev
- **Spec generation** — Generate, preview, and download Markdown specs from the current canvas and chat history
- **Sharing** — Invite collaborators by email with Clerk profile enrichment

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui |
| Auth | Clerk |
| Database | Prisma, PostgreSQL |
| Realtime canvas | Liveblocks, React Flow (`@xyflow/react`) |
| Background jobs | Trigger.dev |
| Artifacts | Vercel Blob (canvas JSON, spec Markdown) |
| AI | OpenAI (`gpt-4o` by default) via Vercel AI SDK |

## Prerequisites

- Node.js 20+
- PostgreSQL database
- Accounts / keys for: [Clerk](https://clerk.com), [Liveblocks](https://liveblocks.io), [Trigger.dev](https://trigger.dev), [Vercel Blob](https://vercel.com/docs/storage/vercel-blob), and [OpenAI](https://platform.openai.com)

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and fill in the values:

   ```bash
   cp .env.example .env
   ```

   | Variable | Purpose |
   | --- | --- |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk authentication |
   | `DATABASE_URL` | PostgreSQL connection string |
   | `LIVEBLOCKS_SECRET_KEY` | Liveblocks server API (room auth, AI mutations) |
   | `TRIGGER_SECRET_KEY` | Trigger.dev task execution |
   | `OPENAI_API_KEY` | OpenAI for Design chat + spec generation |
   | `OPENAI_MODEL` | Optional; defaults to `gpt-4o` |
   | `BLOB_READ_WRITE_TOKEN` | Vercel Blob for canvas snapshots and specs |

   Set `OPENAI_API_KEY` in `.env`. Restart the Next.js and Trigger.dev workers after changing AI env vars.

3. **Run database migrations**

   ```bash
   npm run db:migrate
   ```

4. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). After sign-in, use `/editor` for the project home and `/editor/[roomId]` for a workspace.

5. **Start the Trigger.dev worker** (required for AI design and spec generation)

   In a second terminal:

   ```bash
   npm run trigger:dev
   ```

   Use your project ref from the Trigger.dev dashboard in `TRIGGER_PROJECT_REF` (also set in `trigger.config.ts`). Keep this process running alongside `npm run dev`.

   Trigger.dev v3 is retired — this repo uses SDK v4 (`@trigger.dev/sdk`). If triggers return “v3 is no longer supported”, run `npm run trigger:dev` (or `npx trigger.dev@latest deploy` for cloud) so the environment is on v4.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run trigger:dev` | Start Trigger.dev local worker (v4) |

## Project structure

```
app/              Next.js routes and API handlers
components/       UI (editor canvas, sidebar, dialogs)
context/          Product, architecture, and feature specs
hooks/            Client hooks (autosave, AI runs, specs)
lib/              Shared infrastructure (Prisma, auth, Liveblocks, AI clients)
prisma/           Database schema and migrations
trigger/          Trigger.dev background tasks (design agent, spec generation)
types/            Shared TypeScript types
```

## Architecture notes

- **Project ID = Liveblocks room ID** — each project maps to one private Liveblocks room.
- **Storage split** — PostgreSQL holds metadata (projects, collaborators, spec records, task runs); Vercel Blob holds canvas JSON and generated Markdown.
- **AI work runs in Trigger.dev** — API routes validate access, enqueue tasks, and issue run-scoped tokens; the client tracks progress with `@trigger.dev/react-hooks`.
- **Canvas state** — synced through `useLiveblocksFlow` in Liveblocks Storage; server-side updates use `mutateFlow` from `@liveblocks/react-flow/node`.

For deeper context, see `context/project-overview.md`, `context/architecture-context.md`, and `context/progress-tracker.md`.

## License

none
