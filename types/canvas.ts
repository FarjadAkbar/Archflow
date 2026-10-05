import type { Edge, Node } from "@xyflow/react"
import type { ComponentKind } from "@/types/component-kind"

export const CANVAS_NODE_TYPE = "canvasNode" as const
export const CANVAS_GROUP_TYPE = "canvasGroup" as const
export const CANVAS_EDGE_TYPE = "canvasEdge" as const

export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const

export type CanvasNodeShape = (typeof NODE_SHAPES)[number]

export const NODE_COLORS = [
  { fill: "#1F1F1F", text: "#EDEDED" },
  { fill: "#10233D", text: "#52A8FF" },
  { fill: "#2E1938", text: "#BF7AF0" },
  { fill: "#331B00", text: "#FF990A" },
  { fill: "#3C1618", text: "#FF6166" },
  { fill: "#3A1726", text: "#F75F8F" },
  { fill: "#0F2E18", text: "#62C073" },
  { fill: "#062822", text: "#0AC7B4" },
] as const

export const DEFAULT_NODE_COLOR = NODE_COLORS[0]

export const DEFAULT_EDGE_COLOR = "#f8fafc"

export const DEFAULT_GROUP_SIZE = { width: 420, height: 280 } as const

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color: string
  textColor: string
  shape: CanvasNodeShape
  componentKind?: ComponentKind
  textStyle?: "heading" | "paragraph"
}

export interface CanvasGroupData extends Record<string, unknown> {
  label: string
}

export interface CanvasEdgeData extends Record<string, unknown> {
  label: string
  /** Travel hop order for Flow animation (1-based). */
  sequence?: number
  /** Logical data relationship; excluded from runtime playback. */
  relationship?: boolean
}

export type CanvasNode = Node<CanvasNodeData, typeof CANVAS_NODE_TYPE>
export type CanvasGroup = Node<CanvasGroupData, typeof CANVAS_GROUP_TYPE>
export type CanvasFlowNode = CanvasNode | CanvasGroup
export type CanvasEdge = Edge<CanvasEdgeData, typeof CANVAS_EDGE_TYPE>

export const CANVAS_SHAPE_DRAG_TYPE = "application/canvas-shape"
export const CANVAS_GROUP_DRAG_TYPE = "application/canvas-group"
export const CANVAS_TEXT_DRAG_TYPE = "application/canvas-text"

export interface CanvasShapeDragPayload {
  shape: CanvasNodeShape
  width: number
  height: number
  componentKind?: ComponentKind
}

export interface CanvasGroupDragPayload {
  width: number
  height: number
}

export const SHAPE_DEFAULT_SIZES: Record<
  CanvasNodeShape,
  { width: number; height: number }
> = {
  rectangle: { width: 160, height: 88 },
  circle: { width: 96, height: 96 },
  diamond: { width: 132, height: 132 },
  pill: { width: 152, height: 64 },
  cylinder: { width: 112, height: 128 },
  hexagon: { width: 120, height: 120 },
}

export function textColorForFill(fill: string): string {
  return (
    NODE_COLORS.find((entry) => entry.fill === fill)?.text ??
    DEFAULT_NODE_COLOR.text
  )
}

export function resolveNodeTextColor(
  data: Pick<CanvasNodeData, "color" | "textColor">
): string {
  if (data.textColor) {
    return data.textColor
  }

  return textColorForFill(data.color)
}

export type NodeColorPair = (typeof NODE_COLORS)[number]
