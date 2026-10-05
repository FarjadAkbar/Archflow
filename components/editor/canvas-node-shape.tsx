import { ArchitectureKindIcon } from "@/components/editor/architecture-icons"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import {
  DEFAULT_NODE_COLOR,
  textColorForFill,
  type CanvasNodeShape,
} from "@/types/canvas"
import { getComponentKindDefinition, isComponentKind, type ComponentKind } from "@/types/component-kind"

interface CanvasNodeShapeViewProps {
  shape: CanvasNodeShape
  label: string
  fill?: string
  textColor?: string
  selected?: boolean
  className?: string
  componentKind?: ComponentKind
  renderLabel?: (textColor: string) => ReactNode
}

function borderColor(selected: boolean): string {
  return selected ? "var(--color-brand)" : "var(--color-border-subtle)"
}

function ShapeLabel({
  label,
  textColor,
  renderLabel,
}: {
  label: string
  textColor: string
  renderLabel?: (textColor: string) => ReactNode
}) {
  if (renderLabel) {
    return <>{renderLabel(textColor)}</>
  }

  return <NodeLabel label={label} textColor={textColor} />
}

function NodeLabel({
  label,
  textColor,
}: {
  label: string
  textColor: string
}) {
  return (
    <span
      className="pointer-events-none absolute inset-0 flex items-center justify-center px-3 text-center text-sm"
      style={{ color: textColor }}
    >
      <span className="truncate">{label || "\u00A0"}</span>
    </span>
  )
}

function ArchitectureKindCard({
  kind,
  label,
  selected,
  textColor,
  fill,
  renderLabel,
}: {
  kind: ComponentKind
  label: string
  selected: boolean
  textColor: string
  fill: string
  renderLabel?: (textColor: string) => ReactNode
}) {
  return (
    <div
      className="canvas-component-card relative flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-2"
      style={{
        background: `linear-gradient(155deg, color-mix(in srgb, ${fill} 72%, var(--color-bg-elevated)), var(--color-bg-surface))`,
        borderColor: selected ? "var(--color-brand)" : `color-mix(in srgb, ${textColor} 28%, var(--color-border-default))`,
        boxShadow: selected ? "0 0 0 2px var(--color-brand-dim)" : undefined,
      }}
    >
      <ArchitectureKindIcon kind={kind} withTile size="lg" />
      <div className="relative min-h-6 w-full shrink-0">
        {renderLabel ? (
          renderLabel("var(--color-copy-primary)")
        ) : (
          <span
            className="block truncate text-center text-sm font-medium text-copy-primary"
          >
            {label || "\u00A0"}
          </span>
        )}
      </div>
      <span className="pointer-events-none max-w-full truncate text-[9px] font-medium uppercase tracking-widest text-copy-muted">
        {getComponentKindDefinition(kind).label}
      </span>
    </div>
  )
}

function CssShape({
  shape,
  fill,
  selected,
  label,
  textColor,
  renderLabel,
}: {
  shape: "rectangle" | "pill" | "circle"
  fill: string
  selected: boolean
  label: string
  textColor: string
  renderLabel?: (textColor: string) => ReactNode
}) {
  const border = borderColor(selected)

  return (
    <div className="relative h-full w-full">
      <div
        className={cn(
          "h-full w-full border",
          shape === "rectangle" && "rounded-2xl",
          shape === "pill" && "rounded-full",
          shape === "circle" && "rounded-full"
        )}
        style={{
          background: `linear-gradient(145deg, ${fill}, color-mix(in srgb, ${fill} 65%, var(--color-bg-base)))`,
          borderColor: selected ? border : `color-mix(in srgb, ${textColor} 32%, var(--color-border-default))`,
        }}
      />
      <ShapeLabel label={label} textColor={textColor} renderLabel={renderLabel} />
    </div>
  )
}

function DiamondShape({
  fill,
  selected,
  label,
  textColor,
  renderLabel,
}: {
  fill: string
  selected: boolean
  label: string
  textColor: string
  renderLabel?: (textColor: string) => ReactNode
}) {
  const stroke = borderColor(selected)

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden
      >
        <polygon
          points="50,4 96,50 50,96 4,50"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <ShapeLabel label={label} textColor={textColor} renderLabel={renderLabel} />
    </div>
  )
}

function HexagonShape({
  fill,
  selected,
  label,
  textColor,
  renderLabel,
}: {
  fill: string
  selected: boolean
  label: string
  textColor: string
  renderLabel?: (textColor: string) => ReactNode
}) {
  const stroke = borderColor(selected)

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden
      >
        <polygon
          points="28,6 72,6 96,50 72,94 28,94 4,50"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <ShapeLabel label={label} textColor={textColor} renderLabel={renderLabel} />
    </div>
  )
}

function CylinderShape({
  fill,
  selected,
  label,
  textColor,
  renderLabel,
}: {
  fill: string
  selected: boolean
  label: string
  textColor: string
  renderLabel?: (textColor: string) => ReactNode
}) {
  const stroke = borderColor(selected)

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-hidden
      >
        <path
          d="M12 22v58c0 6 17 11 38 11s38-5 38-11V22"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <ellipse
          cx="50"
          cy="22"
          rx="38"
          ry="11"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="12"
          y1="22"
          x2="12"
          y2="80"
          stroke={stroke}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="88"
          y1="22"
          x2="88"
          y2="80"
          stroke={stroke}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <ellipse
          cx="50"
          cy="80"
          rx="38"
          ry="11"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <ShapeLabel label={label} textColor={textColor} renderLabel={renderLabel} />
    </div>
  )
}

export function CanvasNodeShapeView({
  shape,
  label,
  fill = DEFAULT_NODE_COLOR.fill,
  textColor: textColorProp,
  selected = false,
  className,
  componentKind,
  renderLabel,
}: CanvasNodeShapeViewProps) {
  const textColor = textColorProp ?? textColorForFill(fill)

  if (componentKind && isComponentKind(componentKind)) {
    return (
      <div className={cn("relative h-full w-full", className)}>
        <ArchitectureKindCard
          kind={componentKind}
          fill={fill}
          label={label}
          selected={selected}
          textColor={textColor}
          renderLabel={renderLabel}
        />
      </div>
    )
  }

  return (
    <div className={cn("canvas-geometric-shape relative h-full w-full", className)}>
      {shape === "rectangle" || shape === "pill" || shape === "circle" ? (
        <CssShape
          shape={shape}
          fill={fill}
          selected={selected}
          label={label}
          textColor={textColor}
          renderLabel={renderLabel}
        />
      ) : null}
      {shape === "diamond" ? (
        <DiamondShape
          fill={fill}
          selected={selected}
          label={label}
          textColor={textColor}
          renderLabel={renderLabel}
        />
      ) : null}
      {shape === "hexagon" ? (
        <HexagonShape
          fill={fill}
          selected={selected}
          label={label}
          textColor={textColor}
          renderLabel={renderLabel}
        />
      ) : null}
      {shape === "cylinder" ? (
        <CylinderShape
          fill={fill}
          selected={selected}
          label={label}
          textColor={textColor}
          renderLabel={renderLabel}
        />
      ) : null}
    </div>
  )
}
