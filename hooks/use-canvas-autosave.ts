"use client"

import type { OnDelete, OnEdgesChange, OnNodesChange } from "@xyflow/react"
import { useCallback, useEffect, useRef } from "react"
import { applyCanvasTemplate } from "@/components/editor/starter-templates"
import type { CanvasEdge, CanvasFlowNode } from "@/types/canvas"
import { isCanvasSnapshot } from "@/types/canvas-snapshot"

export type CanvasSaveStatus = "idle" | "saving" | "saved" | "error"

const AUTOSAVE_DEBOUNCE_MS = 1500

interface UseCanvasAutosaveOptions {
  roomId: string
  nodes: CanvasFlowNode[]
  edges: CanvasEdge[]
  onNodesChange: OnNodesChange<CanvasFlowNode>
  onEdgesChange: OnEdgesChange<CanvasEdge>
  onDelete: OnDelete<CanvasFlowNode, CanvasEdge>
  isFlowReady?: boolean
  onStatusChange?: (status: CanvasSaveStatus) => void
  onSaveReady?: (saveNow: () => Promise<void>) => void
  onCanvasRestored?: () => void
}

export function useCanvasAutosave({
  roomId,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onDelete,
  isFlowReady = true,
  onStatusChange,
  onSaveReady,
  onCanvasRestored,
}: UseCanvasAutosaveOptions) {
  const hydrationCompleteRef = useRef(false)
  const skipNextSaveRef = useRef(true)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)

  useEffect(() => {
    nodesRef.current = nodes
    edgesRef.current = edges
  }, [nodes, edges])

  const setStatus = useCallback(
    (status: CanvasSaveStatus) => {
      onStatusChange?.(status)
    },
    [onStatusChange]
  )

  const persistCanvas = useCallback(async () => {
    setStatus("saving")

    try {
      const response = await fetch(`/api/projects/${roomId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodes: nodesRef.current,
          edges: edgesRef.current,
        }),
      })

      if (!response.ok) {
        setStatus("error")
        return
      }

      setStatus("saved")
    } catch {
      setStatus("error")
    }
  }, [roomId, setStatus])

  const saveNow = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    await persistCanvas()
  }, [persistCanvas])

  useEffect(() => {
    onSaveReady?.(saveNow)
  }, [onSaveReady, saveNow])

  useEffect(() => {
    if (!isFlowReady || hydrationCompleteRef.current) {
      return
    }

    let cancelled = false

    async function restoreSavedCanvas() {
      if (nodes.length > 0 || edges.length > 0) {
        hydrationCompleteRef.current = true
        skipNextSaveRef.current = true
        return
      }

      try {
        const response = await fetch(`/api/projects/${roomId}/canvas`, {
          cache: "no-store",
        })

        if (!response.ok || cancelled) {
          return
        }

        const snapshot = await response.json()

        if (
          cancelled ||
          nodesRef.current.length > 0 ||
          edgesRef.current.length > 0 ||
          !isCanvasSnapshot(snapshot) ||
          (snapshot.nodes.length === 0 && snapshot.edges.length === 0)
        ) {
          return
        }

        applyCanvasTemplate(
          {
            id: "restore",
            name: "",
            description: "",
            nodes: snapshot.nodes,
            edges: snapshot.edges,
          },
          nodesRef.current,
          edgesRef.current,
          onNodesChange,
          onEdgesChange,
          onDelete
        )
        skipNextSaveRef.current = true
        onCanvasRestored?.()
      } catch {
        // Restore failure should not block editing.
      } finally {
        if (!cancelled) {
          hydrationCompleteRef.current = true
        }
      }
    }

    void restoreSavedCanvas()

    return () => {
      cancelled = true
    }
  }, [
    edges,
    isFlowReady,
    nodes,
    onCanvasRestored,
    onEdgesChange,
    onDelete,
    onNodesChange,
    roomId,
  ])

  useEffect(() => {
    if (!hydrationCompleteRef.current) {
      return
    }

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false
      return
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      void persistCanvas()
    }, AUTOSAVE_DEBOUNCE_MS)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [edges, nodes, persistCanvas])

  return { saveNow }
}
