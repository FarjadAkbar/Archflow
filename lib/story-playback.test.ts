import { describe, expect, it } from "vitest"
import { INITIAL_STORY_STATE, storyPlaybackReducer } from "./story-playback"
import { createTrafficStory } from "./traffic-story"

describe("story timeline", () => {
  it("pauses with elapsed time preserved and resumes the same step", () => {
    const started = storyPlaybackReducer(INITIAL_STORY_STATE, { type: "play", count: 6 })
    const paused = storyPlaybackReducer(started, { type: "pause", elapsedMs: 800 })
    const resumed = storyPlaybackReducer(paused, { type: "play", count: 6 })
    expect(resumed).toMatchObject({ playing: true, index: 0, elapsedMs: 800 })
    expect(storyPlaybackReducer(paused, { type: "tick", count: 6 })).toEqual(paused)
  })
  it("steps while paused and clamps at both ends", () => {
    expect(storyPlaybackReducer(INITIAL_STORY_STATE, { type: "back", count: 6 }).index).toBe(0)
    const end = { ...INITIAL_STORY_STATE, index: 5, playing: true }
    expect(storyPlaybackReducer(end, { type: "next", count: 6 })).toMatchObject({ index: 5, playing: false, elapsedMs: 0 })
  })
  it("finishes once and can replay from the beginning", () => {
    const end = storyPlaybackReducer({ ...INITIAL_STORY_STATE, index: 5, playing: true }, { type: "tick", count: 6 })
    expect(end.playing).toBe(false)
    expect(storyPlaybackReducer(end, { type: "replay", count: 6 })).toMatchObject({ index: 0, playing: true, elapsedMs: 0 })
  })
  it("does not start an empty story", () => {
    expect(storyPlaybackReducer(INITIAL_STORY_STATE, { type: "play", count: 0 }).playing).toBe(false)
  })
})

describe("traffic case study", () => {
  it("keeps every narrated highlight bound to the imported graph", () => {
    const story = createTrafficStory({ x: 0, y: 0 })
    const nodes = new Set(story.nodes.map((node) => node.id))
    const edges = new Set(story.edges.map((edge) => edge.id))
    for (const step of [...story.failure, ...story.recovery]) {
      expect(step.edgeIds.every((id) => edges.has(id))).toBe(true)
      expect(Object.keys(step.nodes).every((id) => nodes.has(id))).toBe(true)
    }
    expect(story.failure.at(-1)?.tone).toBe("failed")
    expect(story.recovery.at(-1)?.tone).toBe("healthy")
    expect(story.failure.some((step) => step.travelers > 1)).toBe(true)
  })
  it("generates disjoint IDs when adding another case study", () => {
    const first = createTrafficStory({ x: 0, y: 0 })
    const second = createTrafficStory({ x: 1200, y: 0 })
    const ids = new Set(first.nodes.map((node) => node.id))
    expect(second.nodes.every((node) => !ids.has(node.id))).toBe(true)
  })
})
