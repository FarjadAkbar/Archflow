"use client"

import type { DragEvent, RefObject } from "react"
import { useEffect, useRef, useState } from "react"
import { Layers, Shapes, Group, Heading, AlignLeft, X, Search } from "lucide-react"
import type { CanvasTextStyle } from "@/lib/canvas-text"
import { ComponentKindIcon } from "@/components/editor/component-kind-icon"
import { useShapeDrag } from "@/components/editor/shape-drag-preview"
import { cn } from "@/lib/utils"
import {
  CANVAS_GROUP_DRAG_TYPE,
  CANVAS_SHAPE_DRAG_TYPE,
  CANVAS_TEXT_DRAG_TYPE,
  DEFAULT_GROUP_SIZE,
  NODE_SHAPES,
  SHAPE_DEFAULT_SIZES,
  type CanvasNodeShape,
} from "@/types/canvas"
import {
  COMPONENT_KINDS,
  getComponentKindDefinition,
  type ComponentKind,
} from "@/types/component-kind"

type PanelTab = "components" | "shapes" | "groups"

function ShapeIcon({ shape }: { shape: CanvasNodeShape }) {
  const className = "h-5 w-5 stroke-[1.75]"

  switch (shape) {
    case "rectangle":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <rect x="4" y="7" width="16" height="10" rx="2" stroke="currentColor" />
        </svg>
      )
    case "diamond":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path
            d="M12 3 21 12 12 21 3 12Z"
            stroke="currentColor"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "circle":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" />
        </svg>
      )
    case "pill":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <rect x="3" y="8" width="18" height="8" rx="4" stroke="currentColor" />
        </svg>
      )
    case "cylinder":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <ellipse cx="12" cy="7" rx="7" ry="2.5" stroke="currentColor" />
          <path
            d="M5 7v10c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V7"
            stroke="currentColor"
          />
          <ellipse cx="12" cy="17" rx="7" ry="2.5" stroke="currentColor" />
        </svg>
      )
    case "hexagon":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path
            d="M8 4h8l4 7-4 7H8L4 11Z"
            stroke="currentColor"
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}

function handleShapeDragStart(
  event: DragEvent<HTMLButtonElement>,
  shape: CanvasNodeShape,
  startShapeDrag: (state: {
    shape: CanvasNodeShape
    width: number
    height: number
    x: number
    y: number
    componentKind?: ComponentKind
  }) => void,
  dragImageRef: RefObject<HTMLImageElement | null>
) {
  const size = SHAPE_DEFAULT_SIZES[shape]

  event.dataTransfer.setData(
    CANVAS_SHAPE_DRAG_TYPE,
    JSON.stringify({
      shape,
      width: size.width,
      height: size.height,
    })
  )
  event.dataTransfer.effectAllowed = "move"

  if (dragImageRef.current) {
    event.dataTransfer.setDragImage(dragImageRef.current, 0, 0)
  }

  startShapeDrag({
    shape,
    width: size.width,
    height: size.height,
    x: event.clientX,
    y: event.clientY,
  })
}

function handleComponentDragStart(
  event: DragEvent<HTMLButtonElement>,
  kind: ComponentKind,
  startShapeDrag: (state: {
    shape: CanvasNodeShape
    width: number
    height: number
    x: number
    y: number
    componentKind?: ComponentKind
  }) => void,
  dragImageRef: RefObject<HTMLImageElement | null>
) {
  const definition = getComponentKindDefinition(kind)

  event.dataTransfer.setData(
    CANVAS_SHAPE_DRAG_TYPE,
    JSON.stringify({
      componentKind: kind,
      shape: definition.shape,
      width: definition.width,
      height: definition.height,
    })
  )
  event.dataTransfer.effectAllowed = "move"

  if (dragImageRef.current) {
    event.dataTransfer.setDragImage(dragImageRef.current, 0, 0)
  }

  startShapeDrag({
    shape: definition.shape,
    width: definition.width,
    height: definition.height,
    componentKind: kind,
    x: event.clientX,
    y: event.clientY,
  })
}

export function ShapePanel({ onAddText }: { onAddText: (style: CanvasTextStyle) => void }) {
  const { startShapeDrag, endShapeDrag, dragImageRef } = useShapeDrag()
  const [tab, setTab] = useState<PanelTab>("components")
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState("")
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!pickerOpen) return
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !panelRef.current?.contains(event.target)) setPickerOpen(false)
    }
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setPickerOpen(false) }
    document.addEventListener("pointerdown", dismiss)
    document.addEventListener("keydown", escape)
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape) }
  }, [pickerOpen])
  const selectTab = (next: PanelTab) => {
    setTab(next)
    setPickerOpen((current) => next === tab ? !current : true)
  }

  return (
    <div
      ref={panelRef}
      className="pointer-events-auto absolute bottom-20 left-1/2 z-10 -translate-x-1/2 sm:bottom-6"
      role="toolbar"
      aria-label="Shape panel"
    >
      {pickerOpen ? <div className="absolute bottom-16 left-1/2 flex max-h-[min(24rem,60vh)] w-[min(22rem,85vw)] -translate-x-1/2 flex-col gap-2 overflow-y-auto rounded-2xl border border-surface-border bg-bg-surface/95 p-3 shadow-lg backdrop-blur-sm" onKeyDown={(event) => { if (event.key === "Escape") setPickerOpen(false) }}>
        <div className="flex items-center justify-between px-1"><span className="text-xs font-medium text-copy-primary">Drag onto the canvas</span><button type="button" aria-label="Close component picker" onClick={() => setPickerOpen(false)} className="rounded-xl p-1.5 text-copy-muted hover:bg-bg-subtle"><X className="h-4 w-4" /></button></div>
        <div
          className="flex items-center gap-1 rounded-full bg-bg-subtle p-1"
          role="tablist"
          aria-label="Palette sections"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "components"}
            onClick={() => setTab("components")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              tab === "components"
                ? "bg-bg-elevated text-copy-primary"
                : "text-copy-secondary hover:text-copy-primary"
            )}
          >
            Components
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "shapes"}
            onClick={() => setTab("shapes")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              tab === "shapes"
                ? "bg-bg-elevated text-copy-primary"
                : "text-copy-secondary hover:text-copy-primary"
            )}
          >
            Shapes
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "groups"}
            onClick={() => setTab("groups")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              tab === "groups"
                ? "bg-bg-elevated text-copy-primary"
                : "text-copy-secondary hover:text-copy-primary"
            )}
          >
            Groups
          </button>
        </div>

        {tab === "components" ? (
          <>
          <label className="flex items-center gap-2 rounded-xl border border-surface-border bg-bg-base px-3 py-2 text-copy-muted"><Search className="h-3.5 w-3.5" /><input aria-label="Search components" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search components…" className="w-full bg-transparent text-xs text-copy-primary outline-none" /></label>
          <div className="grid grid-cols-4 gap-1 px-1 pb-1">
            {COMPONENT_KINDS.filter((kind) => getComponentKindDefinition(kind).label.toLowerCase().includes(search.toLowerCase())).map((kind) => {
              const definition = getComponentKindDefinition(kind)
              return (
                <button
                  key={kind}
                  type="button"
                  draggable
                  title={definition.label}
                  onDragStart={(event) =>
                    handleComponentDragStart(
                      event,
                      kind,
                      startShapeDrag,
                      dragImageRef
                    )
                  }
                  onDragEnd={() => { endShapeDrag(); setPickerOpen(false) }}
                  className={cn(
                    "flex min-w-0 cursor-grab flex-col items-center justify-center gap-1 rounded-xl px-1 py-2",
                    "text-copy-secondary transition-colors hover:bg-bg-subtle hover:text-copy-primary",
                    "active:cursor-grabbing"
                  )}
                  aria-label={`Drag ${definition.label} onto canvas`}
                >
                  <ComponentKindIcon kind={kind} withTile size="sm" />
                  <span className="w-full truncate text-center text-[9px] text-copy-muted">{definition.label}</span>
                </button>
              )
            })}
          </div>
          </>
        ) : null}

        {tab === "shapes" ? (
          <div className="flex items-center gap-1 px-1 pb-1">
            {NODE_SHAPES.map((shape) => (
              <button
                key={shape}
                type="button"
                draggable
                onDragStart={(event) =>
                  handleShapeDragStart(
                    event,
                    shape,
                    startShapeDrag,
                    dragImageRef
                  )
                }
                onDragEnd={() => { endShapeDrag(); setPickerOpen(false) }}
                className={cn(
                  "flex h-10 w-10 cursor-grab items-center justify-center rounded-full",
                  "text-copy-secondary transition-colors hover:bg-bg-subtle hover:text-copy-primary",
                  "active:cursor-grabbing"
                )}
                aria-label={`Drag ${shape} onto canvas`}
              >
                <ShapeIcon shape={shape} />
              </button>
            ))}
          </div>
        ) : null}

        {tab === "groups" ? (
          <div className="flex items-center gap-1 px-1 pb-1">
            <button
              type="button"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(
                  CANVAS_GROUP_DRAG_TYPE,
                  JSON.stringify({
                    width: DEFAULT_GROUP_SIZE.width,
                    height: DEFAULT_GROUP_SIZE.height,
                  })
                )
                event.dataTransfer.effectAllowed = "move"
                if (dragImageRef.current) {
                  event.dataTransfer.setDragImage(dragImageRef.current, 0, 0)
                }
                startShapeDrag({
                  shape: "rectangle",
                  width: DEFAULT_GROUP_SIZE.width,
                  height: DEFAULT_GROUP_SIZE.height,
                  x: event.clientX,
                  y: event.clientY,
                })
              }}
              onDragEnd={() => { endShapeDrag(); setPickerOpen(false) }}
              className={cn(
                "flex h-10 items-center gap-2 rounded-full px-3",
                "text-copy-secondary transition-colors hover:bg-bg-subtle hover:text-copy-primary",
                "cursor-grab active:cursor-grabbing"
              )}
              aria-label="Drag Group onto canvas"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 stroke-[1.75]"
                aria-hidden
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeDasharray="3 2"
                />
              </svg>
              <span className="text-xs font-medium">Group</span>
            </button>
          </div>
        ) : null}
      </div> : null}
      <div className="flex items-center gap-1 rounded-2xl border border-surface-border bg-bg-surface/95 p-1.5 shadow-lg backdrop-blur-sm">
        {([
          { id: "components", label: "Components", icon: Layers },
          { id: "shapes", label: "Shapes", icon: Shapes },
          { id: "groups", label: "Groups", icon: Group },
        ] as const).map(({ id, label, icon: Icon }) => <button key={id} type="button" title={label} aria-label={label} aria-expanded={pickerOpen && tab === id} onClick={() => selectTab(id)} className={cn("flex h-10 items-center gap-2 rounded-xl px-3 text-xs transition-colors", pickerOpen && tab === id ? "bg-bg-subtle text-copy-primary" : "text-copy-muted hover:bg-bg-subtle hover:text-copy-primary")}><Icon className="h-4 w-4" /><span className="hidden sm:inline">{label}</span></button>)}
        <div className="mx-1 h-6 w-px bg-surface-border" />
        {([{ style: "heading", icon: Heading }, { style: "paragraph", icon: AlignLeft }] as const).map(({ style, icon: Icon }) => <button key={style} type="button" draggable title={`Add ${style} (click or drag)`} aria-label={`Add ${style}`} onClick={() => { onAddText(style); setPickerOpen(false) }} onDragStart={(event) => { event.dataTransfer.setData(CANVAS_TEXT_DRAG_TYPE, JSON.stringify(style)); event.dataTransfer.effectAllowed = "move" }} className="flex h-10 w-10 items-center justify-center rounded-xl text-copy-muted hover:bg-bg-subtle hover:text-copy-primary"><Icon className="h-4 w-4" /></button>)}
      </div>
    </div>
  )
}
