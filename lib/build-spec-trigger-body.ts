import { isCanvasGroup } from "@/lib/canvas-group"
import { isTextNode } from "@/lib/canvas-text"
import { CANVAS_NODE_TYPE, type CanvasNode, type CanvasEdge, type CanvasFlowNode } from "@/types/canvas"
import type { SpecTriggerBody } from "@/types/spec-agent"
import type { AiChatMessage } from "@/types/tasks"

interface BuildSpecTriggerBodyInput {
  roomId: string
  nodes: CanvasFlowNode[]
  edges: CanvasEdge[]
  chatHistory: AiChatMessage[]
}

/** Map live canvas + Design chat into the Spec generation trigger body. */
export function buildSpecTriggerBody(
  input: BuildSpecTriggerBodyInput
): SpecTriggerBody {
  const groupIds = new Set(
    input.nodes.filter((node) => isCanvasGroup(node) || isTextNode(node)).map((node) => node.id)
  )

  const nodes = input.nodes
    .filter((node): node is CanvasNode => node.type === CANVAS_NODE_TYPE && !isTextNode(node))
    .map((node) => ({
      id: node.id,
      position: { x: node.position.x, y: node.position.y },
      ...(typeof node.width === "number" ? { width: node.width } : {}),
      ...(typeof node.height === "number" ? { height: node.height } : {}),
      data: {
        label: node.data.label,
        color: node.data.color,
        ...(node.data.textColor ? { textColor: node.data.textColor } : {}),
        shape: node.data.shape,
      },
    }))

  const edges = input.edges
    .filter(
      (edge) => !groupIds.has(edge.source) && !groupIds.has(edge.target)
    )
    .map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      data: { label: edge.data?.label ?? "" },
    }))

  return {
    roomId: input.roomId,
    nodes,
    edges,
    chatHistory: input.chatHistory,
  }
}
