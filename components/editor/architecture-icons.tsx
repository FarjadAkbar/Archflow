import {
  Smartphone, UserRound, Network, Server, Workflow, Database,
  ListOrdered, RadioTower, Zap, Settings2, Container, Cloud,
  ShieldCheck, AppWindow, Cpu, PackageOpen, Layers3, Box,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { isComponentKind, type ComponentKind } from "@/types/component-kind"

interface IconAccent {
  tile: string
  ink: string
}

function accent(token: string): IconAccent {
  const ink = "var(--color-diagram-" + token + ")"
  return {
    tile: "color-mix(in srgb, " + ink + " 14%, var(--color-bg-elevated))",
    ink,
  }
}

export const ARCHITECTURE_ICON_ACCENT: Record<ComponentKind, IconAccent> = {
  client: accent("blue"),
  user: accent("blue"),
  "load-balancer": accent("violet"),
  server: accent("amber"),
  "api-gateway": accent("violet"),
  database: accent("blue"),
  queue: accent("rose"),
  "message-broker": accent("rose"),
  cache: accent("teal"),
  worker: accent("amber"),
  "blob-storage": accent("green"),
  cdn: accent("teal"),
  firewall: accent("rose"),
  saas: accent("violet"),
  ec2: accent("amber"),
  s3: accent("green"),
  r2: accent("amber"),
}

const ARCHITECTURE_GLYPHS: Record<ComponentKind, LucideIcon> = {
  client: Smartphone,
  user: UserRound,
  "load-balancer": Network,
  server: Server,
  "api-gateway": Workflow,
  database: Database,
  queue: ListOrdered,
  "message-broker": RadioTower,
  cache: Zap,
  worker: Settings2,
  "blob-storage": Container,
  cdn: Cloud,
  firewall: ShieldCheck,
  saas: AppWindow,
  ec2: Cpu,
  s3: PackageOpen,
  r2: Layers3,
}

interface ArchitectureKindIconProps {
  kind: ComponentKind
  className?: string
  withTile?: boolean
  size?: "sm" | "md" | "lg"
}

const SIZE_CLASS = {
  sm: { wrap: "h-8 w-8", glyph: "h-4 w-4" },
  md: { wrap: "h-11 w-11", glyph: "h-6 w-6" },
  lg: { wrap: "h-14 w-14", glyph: "h-8 w-8" },
} as const

export function ArchitectureKindIcon({
  kind, className, withTile = false, size = "md",
}: ArchitectureKindIconProps) {
  // Saved room data can outlive the catalog that created it.
  const knownKind = typeof kind === "string" && isComponentKind(kind)
  const Glyph = knownKind ? ARCHITECTURE_GLYPHS[kind] : Box
  const colors = knownKind ? ARCHITECTURE_ICON_ACCENT[kind] : accent("blue")
  const dims = SIZE_CLASS[size]

  if (!withTile) {
    return <Glyph className={className ?? dims.glyph} style={{ color: colors.ink }} strokeWidth={1.7} aria-hidden />
  }

  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-xl border shadow-sm", dims.wrap, className)}
      style={{
        backgroundColor: colors.tile,
        borderColor: "color-mix(in srgb, " + colors.ink + " 28%, transparent)",
        color: colors.ink,
      }}
      aria-hidden
    >
      <Glyph className={dims.glyph} strokeWidth={1.7} />
    </span>
  )
}
