"use client"

import type { CSSProperties } from "react"
import { useStoryPlayback } from "@/hooks/use-story-playback"
import { STORY_TONE_COLOR } from "@/lib/story-playback"

export function StoryTravelers({ edgeId, path }: { edgeId: string; path: string }) {
  const story = useStoryPlayback()
  const step = story?.step
  if (!story || !step?.edgeIds.includes(edgeId)) return null
  return <g key={`${story.revision}-${story.index}`} className="pointer-events-none" aria-hidden>
    {Array.from({ length: step.travelers }, (_, index) => (
      <circle key={index} r={3.5} className="story-traveler" fill={STORY_TONE_COLOR[step.tone]} style={{
        offsetPath: `path('${path}')`, offsetRotate: "0deg",
        animationDuration: `${step.durationMs}ms`,
        animationDelay: `${-(index / Math.max(1, step.travelers)) * step.durationMs}ms`,
        animationPlayState: story.playing ? "running" : "paused",
      } satisfies CSSProperties} />
    ))}
  </g>
}
