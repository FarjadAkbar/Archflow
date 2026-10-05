"use client"

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react"
import { resolveTravelSequences } from "@/lib/flow-animation"
import { INITIAL_STORY_STATE, storyPlaybackReducer, type StoryStep } from "@/lib/story-playback"
import type { TrafficStory } from "@/lib/traffic-story"
import type { CanvasEdge, CanvasFlowNode } from "@/types/canvas"

interface StoryContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  mode: "diagram" | "failure" | "recovery"
  setMode: (mode: "diagram" | "failure" | "recovery") => void
  loadCaseStudy: () => void
  hasCaseStudy: boolean
  valid: boolean
  playing: boolean
  index: number
  count: number
  revision: number
  step: StoryStep | undefined
  playPause: () => void
  next: () => void
  back: () => void
  replay: () => void
}

const StoryContext = createContext<StoryContextValue | null>(null)

export function StoryPlaybackProvider({ nodes, edges, onLoadCaseStudy, children }: {
  nodes: CanvasFlowNode[]
  edges: CanvasEdge[]
  onLoadCaseStudy: () => TrafficStory | null
  children: ReactNode
}) {
  const [open, setOpenState] = useState(false)
  const [mode, setModeState] = useState<StoryContextValue["mode"]>("diagram")
  const [story, setStory] = useState<TrafficStory | null>(null)
  const [state, dispatch] = useReducer(storyPlaybackReducer, INITIAL_STORY_STATE)
  const startedAt = useRef(0)

  const sequences = useMemo(() => resolveTravelSequences(
    edges.filter(edge => !edge.data?.relationship).map((edge) => ({ ...edge, sequence: edge.data?.sequence }))
  ), [edges])

  const diagramSteps = useMemo(() => {
    const labels = new Map(nodes.map((node) => [node.id, node.data.label]))
    const groups = new Map<number, CanvasEdge[]>()
    for (const edge of edges) {
      if (edge.data?.relationship) continue
      if (!labels.has(edge.source) || !labels.has(edge.target)) continue
      const sequence = sequences.get(edge.id) ?? 1
      groups.set(sequence, [...(groups.get(sequence) ?? []), edge])
    }
    return [...groups.entries()].sort(([a], [b]) => a - b).map(([, group]): StoryStep => ({
      title: group.length > 1 ? "Parallel connections" : `${labels.get(group[0].source) || "Source"} → ${labels.get(group[0].target) || "Destination"}`,
      description: group.map((edge) => `${labels.get(edge.source) || "Source"} → ${labels.get(edge.target) || "Destination"}${edge.data?.label ? `: ${edge.data.label}` : ""}`).join(" · "),
      durationMs: 2600, edgeIds: group.map((edge) => edge.id),
      nodes: Object.fromEntries(group.flatMap((edge) => [
        [edge.source, { tone: "active", label: "Sending" }],
        [edge.target, { tone: "active", label: "Receiving" }],
      ])),
      tone: "active", travelers: 1,
    }))
  }, [nodes, edges, sequences])

  const steps = mode === "diagram" ? diagramSteps : story?.[mode] ?? []
  const valid = mode === "diagram" ? steps.length > 0 : Boolean(story &&
    story.nodes.every((item) => nodes.some((node) => node.id === item.id)) &&
    story.edges.every((item) => edges.some((edge) => edge.id === item.id && edge.source === item.source && edge.target === item.target)))
  const count = steps.length
  const step = steps[state.index]
  const duration = step?.durationMs ?? 2600
  // Ignore position changes; only graph changes reset the local walkthrough.
  const topology = JSON.stringify([
    nodes.map((node) => node.id).sort(),
    edges.map((edge) => [edge.id, edge.source, edge.target, edge.data?.sequence, edge.data?.relationship]).sort(),
  ])
  useEffect(() => { dispatch({ type: "reset" }) }, [topology])

  useEffect(() => {
    if (!state.playing || !open || !valid) return
    startedAt.current = performance.now()
    const timer = window.setTimeout(() => dispatch({ type: "tick", count }), Math.max(0, duration - state.elapsedMs))
    return () => window.clearTimeout(timer)
  }, [state.playing, state.index, state.elapsedMs, state.revision, duration, count, open, valid])

  useEffect(() => {
    if (!valid) dispatch({ type: "reset" })
  }, [valid])

  const value: StoryContextValue = {
    open,
    setOpen: (next) => { setOpenState(next); if (!next) dispatch({ type: "reset" }) },
    mode,
    setMode: (next) => { setModeState(next); dispatch({ type: "reset" }) },
    loadCaseStudy: () => {
      const imported = onLoadCaseStudy()
      if (!imported) return
      setStory(imported); setModeState("failure"); dispatch({ type: "reset" })
    },
    hasCaseStudy: Boolean(story), valid, playing: state.playing,
    index: state.index, count, revision: state.revision,
    step: open && valid ? step : undefined,
    playPause: () => {
      if (!valid) return
      if (state.playing) dispatch({ type: "pause", elapsedMs: Math.min(duration, state.elapsedMs + performance.now() - startedAt.current) })
      else if (state.elapsedMs >= duration) dispatch({ type: "replay", count })
      else dispatch({ type: "play", count })
    },
    next: () => dispatch({ type: "next", count }),
    back: () => dispatch({ type: "back", count }),
    replay: () => dispatch({ type: "replay", count }),
  }

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>
}

export function useStoryPlayback() { return useContext(StoryContext) }
