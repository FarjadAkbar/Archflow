"use client"

import {
  NodeResizer,
  NodeToolbar,
  Position,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react"
import { useCallback, useState } from "react"
import { useCanvasFlow } from "@/components/editor/canvas-flow-context"
import { CanvasNodeLabelEditor } from "@/components/editor/canvas-node-label-editor"
import { CanvasTextBlock } from "@/components/editor/canvas-text-block"
import { CanvasNodeHandles } from "@/components/editor/canvas-node-handles"
import { CanvasNodeShapeView } from "@/components/editor/canvas-node-shape"
import { NodeColorToolbar } from "@/components/editor/node-color-toolbar"
import { NodeDeleteButton } from "@/components/editor/node-delete-button"
import { useApplyEnterClassName } from "@/hooks/use-apply-enter"
import { useStoryPlayback } from "@/hooks/use-story-playback"
import { STORY_TONE_COLOR } from "@/lib/story-playback"
import {
  MIN_NODE_HEIGHT,
  MIN_NODE_WIDTH,
} from "@/lib/canvas-node-constants"
import { cn } from "@/lib/utils"
import { resolveNodeTextColor, type CanvasNode } from "@/types/canvas"

export function CanvasNode({ id, data, selected }: NodeProps<CanvasNode>) {
  const { deleteElements } = useReactFlow()
  const { updateNodeLabel, updateNodeColor, updateTextStyle } = useCanvasFlow()
  const [isEditing, setIsEditing] = useState(false)
  const textColor = resolveNodeTextColor(data)
  const applyEnterClass = useApplyEnterClassName()
  const story = useStoryPlayback()
  const storyState = story?.step?.nodes[id]

  const handleLabelChange = useCallback(
    (label: string) => {
      updateNodeLabel(id, label)
    },
    [id, updateNodeLabel]
  )

  const handleColorSelect = useCallback(
    (color: string, nextTextColor: string) => {
      updateNodeColor(id, color, nextTextColor)
    },
    [id, updateNodeColor]
  )

  const handleDelete = useCallback(() => {
    if (isEditing) {
      return
    }

    void deleteElements({ nodes: [{ id }] })
  }, [deleteElements, id, isEditing])

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} offset={12}>
        <div className="flex items-center gap-1.5">
          {data.textStyle ? <div className="flex gap-1 rounded-2xl border border-surface-border bg-bg-surface p-1">
            {(["heading", "paragraph"] as const).map((style) => <button key={style} type="button" aria-pressed={data.textStyle === style} onClick={() => updateTextStyle(id, style)} className={cn("rounded-xl px-3 py-1.5 text-xs capitalize", data.textStyle === style ? "bg-bg-subtle text-copy-primary" : "text-copy-muted")}>{style}</button>)}
          </div> : <NodeColorToolbar
            activeFill={data.color}
            onSelect={handleColorSelect}
          />}
          <NodeDeleteButton disabled={isEditing} onDelete={handleDelete} />
        </div>
      </NodeToolbar>
      <NodeResizer
        isVisible={selected}
        minWidth={data.componentKind ? 104 : MIN_NODE_WIDTH}
        minHeight={data.componentKind ? 128 : MIN_NODE_HEIGHT}
        color="var(--color-border-subtle)"
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 2,
          backgroundColor: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border-subtle)",
        }}
        lineStyle={{ borderColor: "var(--color-border-subtle)" }}
      />
      <div className={cn("group/node relative h-full w-full", applyEnterClass)}>
        {!data.textStyle ? <CanvasNodeHandles /> : null}
        {storyState ? (
          <div className="pointer-events-none absolute -inset-1 z-10 rounded-2xl border-2" style={{ borderColor: STORY_TONE_COLOR[storyState.tone] }}>
            <span className="absolute -top-3 right-1 max-w-full truncate rounded-xl border bg-bg-surface px-2 py-1 text-[10px] font-medium" style={{ borderColor: STORY_TONE_COLOR[storyState.tone], color: STORY_TONE_COLOR[storyState.tone] }}>{storyState.label}</span>
          </div>
        ) : null}
        {data.textStyle ? <CanvasTextBlock label={data.label} style={data.textStyle} selected={selected} onChange={handleLabelChange} /> : <CanvasNodeShapeView
          shape={data.shape}
          label={data.label}
          fill={data.color}
          textColor={textColor}
          selected={selected}
          componentKind={data.componentKind}
          renderLabel={(labelTextColor) => (
            <div className="absolute inset-0">
              <CanvasNodeLabelEditor
                label={data.label}
                textColor={labelTextColor}
                isEditing={isEditing}
                onStartEdit={() => setIsEditing(true)}
                onLabelChange={handleLabelChange}
                onEndEdit={() => setIsEditing(false)}
              />
            </div>
          )}
        />}
      </div>
    </>
  )
}
