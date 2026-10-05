import { mutateFlow } from "@liveblocks/react-flow/node"
import { getLiveblocks } from "@/lib/liveblocks"
import { isCanvasGroup } from "@/lib/canvas-group"
import type { CanvasEdge, CanvasFlowNode } from "@/types/canvas"

export interface CanvasFlowSnapshot {
  nodes: CanvasFlowNode[]
  edges: CanvasEdge[]
}

/** Read-only snapshot of the room's Liveblocks flow for Design chat / planning. */
export async function getCanvasFlowSnapshot(
  roomId: string
): Promise<CanvasFlowSnapshot> {
  let snapshot: CanvasFlowSnapshot = { nodes: [], edges: [] }

  await mutateFlow<CanvasFlowNode, CanvasEdge>(
    { client: getLiveblocks(), roomId },
    (flow) => {
      const json = flow.toJSON()
      snapshot = {
        nodes: [...json.nodes],
        edges: [...json.edges],
      }
    }
  )

  return snapshot
}

export function formatCanvasFlowSnapshot(snapshot: CanvasFlowSnapshot): string {
  const groups = snapshot.nodes.filter(isCanvasGroup)
  const nodes = snapshot.nodes.filter((node) => !isCanvasGroup(node))

  const groupLines =
    groups.length === 0
      ? "None"
      : groups
          .map((group) => {
            const width = group.width ?? "?"
            const height = group.height ?? "?"
            return `- id="${group.id}" label="${group.data.label}" at (${group.position.x}, ${group.position.y}) size=${width}x${height}`
          })
          .join("\n")

  const nodeLines =
    nodes.length === 0
      ? "None"
      : nodes
          .map((node) => {
            const width = node.width ?? "?"
            const height = node.height ?? "?"
            const kind = node.data.componentKind
              ? ` kind=${node.data.componentKind}`
              : ""
            const annotation = node.data.textStyle ? ` annotation=${node.data.textStyle}` : ""
            const parent = node.parentId ? ` parent=${node.parentId}` : ""
            const parentGroup = node.parentId
              ? groups.find((group) => group.id === node.parentId)
              : null
            const absX = parentGroup
              ? parentGroup.position.x + node.position.x
              : node.position.x
            const absY = parentGroup
              ? parentGroup.position.y + node.position.y
              : node.position.y
            return `- id="${node.id}" label="${node.data.label}" shape=${node.data.shape}${kind}${annotation}${parent} at (${absX}, ${absY}) size=${width}x${height}`
          })
          .join("\n")

  const edges =
    snapshot.edges.length === 0
      ? "None"
      : snapshot.edges
          .map((edge) => {
            const label = edge.data?.label ? ` label="${edge.data.label}"` : ""
            const sequence =
              typeof edge.data?.sequence === "number"
                ? ` sequence=${edge.data.sequence}`
                : ""
            return `- id="${edge.id}" ${edge.source} -> ${edge.target}${label}${sequence}`
          })
          .join("\n")

  return `Existing groups:\n${groupLines}\n\nExisting nodes:\n${nodeLines}\n\nExisting edges:\n${edges}`
}
