export type StoryTone = "active" | "busy" | "failed" | "healthy"

export interface StoryNodeState {
  tone: StoryTone
  label: string
}

export interface StoryStep {
  title: string
  description: string
  durationMs: number
  edgeIds: string[]
  nodes: Record<string, StoryNodeState>
  tone: StoryTone
  travelers: number
}

export interface StoryPlaybackState {
  index: number
  playing: boolean
  elapsedMs: number
  revision: number
}

export const INITIAL_STORY_STATE: StoryPlaybackState = {
  index: 0, playing: false, elapsedMs: 0, revision: 0,
}

export type StoryAction =
  | { type: "play"; count: number }
  | { type: "pause"; elapsedMs: number }
  | { type: "next" | "back" | "tick"; count: number }
  | { type: "replay"; count: number }
  | { type: "reset" }

export function storyPlaybackReducer(state: StoryPlaybackState, action: StoryAction): StoryPlaybackState {
  if (action.type === "reset") {
    return { ...INITIAL_STORY_STATE, revision: state.revision + 1 }
  }
  if (action.type === "pause") {
    return { ...state, playing: false, elapsedMs: Math.max(0, action.elapsedMs) }
  }
  if (action.count < 1) {
    return { ...INITIAL_STORY_STATE, revision: state.revision + 1 }
  }
  if (action.type === "play") return { ...state, playing: true }
  if (action.type === "replay") {
    return { ...INITIAL_STORY_STATE, playing: true, revision: state.revision + 1 }
  }
  if (action.type === "tick" && !state.playing) return state
  if (action.type === "tick" && state.index >= action.count - 1) {
    return { ...state, playing: false, elapsedMs: Number.MAX_SAFE_INTEGER }
  }
  return {
    index: Math.max(0, Math.min(action.count - 1, state.index + (action.type === "back" ? -1 : 1))),
    playing: action.type === "tick" && state.playing,
    elapsedMs: 0,
    revision: state.revision + 1,
  }
}

export const STORY_TONE_COLOR: Record<StoryTone, string> = {
  active: "var(--color-accent-ai)",
  busy: "var(--color-state-warning)",
  failed: "var(--color-state-error)",
  healthy: "var(--color-state-success)",
}
