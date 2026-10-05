"use client"

import { useReactFlow, useStore } from "@xyflow/react"
import { Trash2, X } from "lucide-react"

export function CanvasSelectionActions() {
  const reactFlow = useReactFlow()
  const count = useStore(state => state.nodes.filter(node => node.selected).length + state.edges.filter(edge => edge.selected).length)
  if (!count) return null

  const deleteSelection = () => {
    void reactFlow.deleteElements({
      nodes: reactFlow.getNodes().filter(node => node.selected).map(node => ({ id: node.id })),
      edges: reactFlow.getEdges().filter(edge => edge.selected).map(edge => ({ id: edge.id })),
    })
  }
  const clearSelection = () => {
    reactFlow.setNodes(nodes => nodes.map(node => ({ ...node, selected: false })))
    reactFlow.setEdges(edges => edges.map(edge => ({ ...edge, selected: false })))
  }

  return (
    <div role="toolbar" aria-label="Selection actions" className="nodrag nopan nowheel absolute bottom-40 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-2xl border border-surface-border bg-bg-elevated/95 px-3 py-2 shadow-lg backdrop-blur-sm sm:bottom-24">
      <span className="text-xs tabular-nums text-copy-secondary">{count} selected</span>
      <button type="button" onClick={deleteSelection} className="flex items-center gap-2 rounded-xl bg-bg-subtle px-3 py-2 text-xs font-medium text-state-error hover:bg-bg-surface"><Trash2 className="h-4 w-4" />Delete selection</button>
      <button type="button" aria-label="Clear selection" onClick={clearSelection} className="rounded-xl p-2 text-copy-muted hover:text-copy-primary"><X className="h-4 w-4" /></button>
    </div>
  )
}
