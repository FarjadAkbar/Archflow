# UI Context

## Theme

Dark only. No light mode. The visual language is a dark technical workspace — near-black backgrounds, layered surfaces, and vivid accent colors for interactive elements.

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens via `@theme inline`. Components must use these tokens — no hardcoded hex values or raw Tailwind color classes like `zinc-*`.

| Role             | CSS Variable           | Hex / Value               |
| ---------------- | ---------------------- | ------------------------- |
| Page background  | `--bg-base`            | `#080809`                 |
| Surface          | `--bg-surface`         | `#111114`                 |
| Elevated surface | `--bg-elevated`        | `#18181c`                 |
| Subtle surface   | `--bg-subtle`          | `#1e1e23`                 |
| Default border   | `--border-default`     | `#2a2a30`                 |
| Subtle border    | `--border-subtle`      | `#3a3a42`                 |
| Primary text     | `--text-primary`       | `#f0f0f4`                 |
| Secondary text   | `--text-secondary`     | `#c0c0cc`                 |
| Muted text       | `--text-muted`         | `#808090`                 |
| Faint text       | `--text-faint`         | `#505060`                 |
| Brand accent     | `--accent-primary`     | `#6366f1` (cyan)          |
| Brand dim        | `--accent-primary-dim` | `rgba(99, 102, 241, 0.12)` |
| AI accent        | `--accent-ai`          | `#6457f9` (indigo-purple) |
| AI text          | `--accent-ai-text`     | `#8b82ff`                 |
| Error            | `--state-error`        | `#ff4d4f`                 |
| Success          | `--state-success`      | `#34d399`                 |
| Warning          | `--state-warning`      | `#fbbf24`                 |

Tailwind utility names map to these variables. Use `bg-base`, `bg-surface`, `text-copy-primary`, `text-copy-muted`, `border-surface-border`, `text-brand`, `bg-accent-dim`, etc.

## Typography

| Role      | Font       | CSS Variable        |
| --------- | ---------- | ------------------- |
| UI text   | Geist Sans | `--font-geist-sans` |
| Code/mono | Geist Mono | `--font-geist-mono` |

Both fonts are loaded via `next/font/google` and applied as CSS variables on the `<html>` element. The base `body` uses Geist Sans with `antialiased`.

## Border Radius

Radius increases with surface depth — smaller for inner elements, larger for outer containers.

| Context           | Class         |
| ----------------- | ------------- |
| Inline / small UI | `rounded-xl`  |
| Cards / panels    | `rounded-2xl` |
| Modal / overlay   | `rounded-3xl` |

## Canvas

### Node Color Palette

8 defined color pairs. Each pair specifies a dark node fill and a vivid contrasting text color tuned for readability on the dark canvas. Defined in `types/canvas.ts` as `NODE_COLORS`.

| Node fill | Text color | Character              |
| --------- | ---------- | ---------------------- |
| `#1F1F1F` | `#EDEDED`  | Neutral dark (default) |
| `#10233D` | `#52A8FF`  | Blue                   |
| `#2E1938` | `#BF7AF0`  | Purple                 |
| `#331B00` | `#FF990A`  | Orange                 |
| `#3C1618` | `#FF6166`  | Red                    |
| `#3A1726` | `#F75F8F`  | Pink                   |
| `#0F2E18` | `#62C073`  | Green                  |
| `#062822` | `#0AC7B4`  | Teal                   |

Default node color: `#1F1F1F` with `#EDEDED` text.

### Edge Style

Continuous Bézier curves with an arrow marker; connection previews use the same curve geometry. Default edge color: `#f8fafc`. Stroke width is thin — edges are visually secondary to nodes. Labels follow the curve midpoint. Direct dragging must not inherit AI layout transitions.

### Node Shapes

The palette is a compact bottom dock with an on-demand component/shape/group picker. Its picker can be closed, searches component names, and uses a bounded scroll area rather than permanently covering the canvas. Heading and Paragraph tools add borderless text annotations. Text supports multiline wrapping, double-click editing, dragging, resizing, and a selected-only Heading/Paragraph style toggle; annotations have no connection handles.

6 supported shapes, defined in `types/canvas.ts` as `NODE_SHAPES`. Complex shapes (diamond, hexagon, cylinder) are rendered as inline SVGs rather than CSS borders.

- `rectangle` — default general-purpose node
- `diamond` — decision / gateway
- `circle` — event / endpoint
- `pill` — service / process
- `cylinder` — database / storage
- `hexagon` — external system / boundary

### Connection Handles

Small circular handles, invisible at rest and revealed on node hover, keyboard focus, or an active connection drag. Invisible handles remain mounted for edge anchoring. Appear at all four sides of a node.

### Architecture Components

Components use tinted dark cards with a subtle accent border, a stroke icon tile, an editable high-contrast label, and a small component-type caption. Color selections tint the card and its outline. The catalog includes dedicated AWS EC2, Amazon S3, and Cloudflare R2 entries alongside generic infrastructure. Database, compute, storage, routing, and messaging use consistent blue, amber, green, violet, and rose accent tokens. Generic shapes use thin tinted outlines and restrained depth.

### Story Controls

The canvas uses a continuous flex height chain beneath the fixed navbar. The story player is a compact card without an internal scroll area. A short header, narration, progress indicator, labeled Play/Pause action, and single-row case-study import keep the canvas visible. Long narration wraps fully; the player does not impose a clipped percentage-height limit.

A collapsible top-left Story panel offers the current diagram or the traffic-spike case study, failure/recovery tabs, narration, a step counter, and play/pause/back/next/replay controls. Warning/error/success tokens indicate busy/failed/recovered nodes and edges. Animation pauses in place and replay starts at the first step. Reduced-motion users retain static highlights and step controls. Case-study import explicitly states that it adds nodes to the shared canvas.

### Canvas Background

React Flow `<Background>` component. Canvas sits on the base background color.

## Component Library

shadcn/ui on top of Tailwind. No custom design system. Components live in `components/ui/`. Use the `shadcn` CLI to add new components rather than writing them from scratch.

## Layout Patterns

- Editor workspace: full-viewport layout — floating sidebar overlay on the left, center canvas, slide-over AI sidebar on the right.
- Sidebars: floating overlay with dark semi-transparent background and subtle border.
- Modals and dialogs: centered overlay, `rounded-3xl`, dark background with backdrop blur.
- Navbar: top bar with dark background and bottom border.

## Icons

Lucide React. Stroke-based icons only — no filled variants. Icon sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons, `h-8 w-8` for feature icons in empty states.

### Selection deletion

Ctrl/Cmd+A selects canvas nodes, groups, annotations, and edges when focus is outside an editor. A floating Delete selection action appears for any selection. Deleting a group through its frame toolbar removes only the frame and preserves children; deleting a selection removes selected items and React Flow descendants/connections.
