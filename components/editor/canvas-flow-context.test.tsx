import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { applyNodeChanges } from "@xyflow/react"
import { CanvasFlowProvider, useCanvasFlow } from "./canvas-flow-context"
import { createCanvasGroup } from "@/lib/canvas-group"
import type { CanvasFlowNode } from "@/types/canvas"

describe("group deletion through collaborative canvas", () => {
  it.each([false, true])("deletes the frame and keeps children in place (nested=%s)", (nested) => {
    const group = createCanvasGroup({ id: "frame", position: { x: 100, y: 80 } })
    if (nested) { group.parentId = "outer"; group.extent = "parent" }
    const child = createCanvasGroup({ id: "child", position: { x: 20, y: 30 } })
    let nodes: CanvasFlowNode[] = [group, { ...child, parentId: group.id, extent: "parent" }]
    const onDelete = vi.fn(({ nodes: removed }: { nodes: CanvasFlowNode[] }) => {
      nodes = nodes.filter(node => !removed.some(entry => entry.id === node.id))
    })
    let removeGroup: (id: string) => void = () => { throw new Error("Provider missing") }
    function Probe() { removeGroup = useCanvasFlow().removeGroup; return null }
    renderToStaticMarkup(
      <CanvasFlowProvider
        nodes={nodes}
        edges={[]}
        onDelete={onDelete}
        // Liveblocks ignores remove changes; deletions must use its onDelete callback.
        onNodesChange={changes => { nodes = applyNodeChanges(changes.filter(change => change.type !== "remove"), nodes) }}
        onEdgesChange={() => {}}
      ><Probe /></CanvasFlowProvider>
    )
    removeGroup(group.id)
    expect(onDelete).toHaveBeenCalledOnce()
    expect(nodes.map(node => node.id)).toEqual(["child"])
    expect(nodes[0].position).toEqual({ x: 120, y: 110 })
    expect(nodes[0].parentId).toBe(nested ? "outer" : undefined)
    expect(nodes[0].extent).toBe(nested ? "parent" : undefined)
  })
})
