"use client"

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react"
import { useCallback, useState } from "react"
import { useCanvasFlow } from "@/components/editor/canvas-flow-context"
import { CanvasEdgeLabelEditor } from "@/components/editor/canvas-edge-label-editor"
import { useApplyEdgeEnterClassName } from "@/hooks/use-apply-enter"
import { useFlowPlay } from "@/hooks/use-flow-play"
import { useStoryPlayback } from "@/hooks/use-story-playback"
import { StoryTravelers } from "@/components/editor/story-travelers"
import { STORY_TONE_COLOR } from "@/lib/story-playback"
import {
  EDGE_COLOR_REST,
  EDGE_INTERACTION_WIDTH,
} from "@/lib/canvas-edge-constants"
import {
  FLOW_EDGE_DURATION_MS,
  isEdgeActiveForHop,
} from "@/lib/flow-animation"
import { DEFAULT_EDGE_COLOR, type CanvasEdge } from "@/types/canvas"

export function CanvasEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const { updateEdgeLabel } = useCanvasFlow()
  const { isFlowPlaying, activeHop, sequenceByEdgeId } = useFlowPlay()
  const story = useStoryPlayback()
  const [hovered, setHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draftLabel, setDraftLabel] = useState("")
  const applyEnterClass = useApplyEdgeEnterClassName()

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const label = data?.label ?? ""
  const isActive = selected || hovered || isEditing
  const sequence = data?.relationship ? undefined : sequenceByEdgeId.get(id) ?? data?.sequence
  const storyActive = Boolean(story?.step?.edgeIds.includes(id))
  const hopActive = !story?.open && isEdgeActiveForHop(sequence, activeHop)
  const strokeColor = storyActive && story?.step
    ? STORY_TONE_COLOR[story.step.tone]
    : hopActive
    ? "var(--color-accent-ai)"
    : isActive
      ? DEFAULT_EDGE_COLOR
      : EDGE_COLOR_REST

  const startEditing = useCallback(() => {
    setDraftLabel(label)
    setIsEditing(true)
  }, [label])

  const handleSave = useCallback(() => {
    updateEdgeLabel(id, draftLabel)
    setIsEditing(false)
  }, [draftLabel, id, updateEdgeLabel])

  return (
    <>
      <g
        className={applyEnterClass}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <BaseEdge
          id={id}
          path={edgePath}
          interactionWidth={EDGE_INTERACTION_WIDTH}
          markerEnd={markerEnd}
          style={{
            stroke: strokeColor,
            strokeWidth: hopActive || storyActive ? 2.25 : 1.5,
            strokeDasharray: data?.relationship ? "5 4" : undefined,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            transition: "stroke 120ms ease, stroke-width 120ms ease",
          }}
        />
        <StoryTravelers edgeId={id} path={edgePath} />
        {hopActive ? (
          <circle r={4} className="pointer-events-none fill-accent-ai">
            <animateMotion
              key={`hop-${activeHop}-${id}`}
              dur={`${FLOW_EDGE_DURATION_MS / 1000}s`}
              begin="0s"
              repeatCount="1"
              fill="freeze"
              path={edgePath}
              rotate="auto"
            />
          </circle>
        ) : null}
      </g>
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan nowheel pointer-events-auto absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          onDoubleClick={(event) => {
            event.stopPropagation()
            startEditing()
          }}
        >
          <div className="flex flex-col items-center gap-1">
            {!story?.open && isFlowPlaying && sequence ? (
              <span
                className={
                  hopActive
                    ? "rounded-xl bg-accent-ai px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white"
                    : "rounded-xl bg-accent-ai/20 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-accent-ai-text"
                }
                aria-label={`Travel sequence ${sequence}`}
              >
                {sequence}
              </span>
            ) : null}
            <CanvasEdgeLabelEditor
              label={isEditing ? draftLabel : label}
              isEditing={isEditing}
              showHint={isActive}
              onStartEdit={startEditing}
              onLabelChange={setDraftLabel}
              onSave={handleSave}
            />
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
