import type { XYPosition } from "@xyflow/react"
import { createCanvasNode } from "@/lib/canvas-node-factory"
import { CANVAS_NODE_TYPE, type CanvasFlowNode, type CanvasNode } from "@/types/canvas"

export type CanvasTextStyle = "heading" | "paragraph"

export function isTextNode(node: CanvasFlowNode): boolean {
  return node.type === CANVAS_NODE_TYPE && (node.data.textStyle === "heading" || node.data.textStyle === "paragraph")
}

export function parseTextDragPayload(raw: string): CanvasTextStyle | null {
  try {
    const value: unknown = JSON.parse(raw)
    return value === "heading" || value === "paragraph" ? value : null
  } catch { return null }
}

export function createCanvasText(style: CanvasTextStyle, position: XYPosition): CanvasNode {
  const node = createCanvasNode({ shape: "rectangle", width: 360, height: style === "heading" ? 72 : 144, position })
  return {
    ...node,
    data: { ...node.data, textStyle: style, label: style === "heading" ? "Your heading" : "Write a description, explain a flow, or add a design decision…" },
  }
}
