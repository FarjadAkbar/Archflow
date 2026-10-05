"use client"

import { Play, Pause, SkipBack, SkipForward, RotateCcw, X, Clapperboard, ArrowUpRight } from "lucide-react"
import { useStoryPlayback } from "@/hooks/use-story-playback"
import { cn } from "@/lib/utils"

export function StoryPanel() {
  const story = useStoryPlayback()
  if (!story) return null
  if (!story.open) return (
    <button type="button" onClick={() => story.setOpen(true)} className="nodrag nopan absolute left-4 top-4 z-20 flex items-center gap-2 rounded-2xl border border-surface-border bg-bg-surface/95 px-4 py-3 text-sm text-copy-primary shadow-lg sm:left-6 sm:top-6">
      <Clapperboard className="h-4 w-4 text-accent-ai-text" /> System stories
    </button>
  )
  const PlaybackIcon = story.playing ? Pause : Play
  return (
    <section aria-label="System story player" className="nodrag nopan nowheel absolute left-4 top-4 z-20 flex w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-surface-border bg-bg-surface/95 shadow-xl backdrop-blur-sm sm:left-6 sm:top-6" >
      <header className="flex shrink-0 items-center gap-3 border-b border-surface-border px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-dim text-accent-ai-text"><Clapperboard className="h-4 w-4" /></div>
        <div className="flex-1"><h2 className="text-sm font-semibold text-copy-primary">System stories</h2></div>
        <button type="button" aria-label="Close story player" onClick={() => story.setOpen(false)} className="rounded-xl p-2 text-copy-muted hover:bg-bg-subtle focus-visible:outline-accent-ai-text"><X className="h-4 w-4" /></button>
      </header>
      <div className="p-4">
        <div className="flex gap-1 rounded-xl bg-bg-subtle p-1" aria-label="Story selection">
          {(["diagram", "failure", "recovery"] as const).map((mode) => (
            <button key={mode} type="button" disabled={mode !== "diagram" && !story.hasCaseStudy} aria-pressed={story.mode === mode} onClick={() => story.setMode(mode)} className={cn("flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors disabled:opacity-40", story.mode === mode ? "bg-bg-elevated text-copy-primary shadow-sm" : "text-copy-muted hover:text-copy-primary")}>
              {mode === "diagram" ? "My diagram" : mode === "failure" ? "Failure" : "Recovery"}
            </button>
          ))}
        </div>
        <div aria-live="polite" aria-atomic="true" className="py-3">
          <div className="flex items-center justify-between text-[11px] text-copy-muted">
            <span className="font-medium uppercase tracking-wider">{story.valid ? "Now exploring" : "Get started"}</span>
            {story.valid && <span className="tabular-nums">{story.index + 1} / {story.count}</span>}
          </div>
          <h3 className="mt-2 text-base font-semibold leading-snug text-copy-primary">{story.step?.title ?? "Bring your system to life"}</h3>
          <p className="mt-2 text-xs leading-relaxed text-copy-secondary break-words">{story.step?.description ?? (story.mode === "diagram" ? "Connect your components to explore their flow, or start with the traffic-spike example below." : "This example was edited. Undo the change or add a fresh case study to continue.")}</p>
          {story.valid && <div role="progressbar" aria-label="Story progress" aria-valuemin={0} aria-valuemax={story.count} aria-valuenow={story.index + 1} className="mt-4 h-1 overflow-hidden rounded-full bg-bg-subtle"><div className="h-full rounded-full bg-accent-ai transition-[width] motion-reduce:transition-none" style={{ width: `${((story.index + 1) / story.count) * 100}%` }} /></div>}
        </div>
        <button type="button" onClick={story.loadCaseStudy} title="Adds a separate traffic-spike diagram to the shared canvas" className="flex w-full items-center justify-between gap-2 border-t border-surface-border pt-3 text-xs font-medium text-accent-ai-text hover:text-copy-primary">
          <span>{story.hasCaseStudy ? "Add fresh traffic-spike example" : "Add traffic-spike example"}</span><ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
        </button>
        <p className="mt-1 text-[10px] text-copy-muted">Adds a diagram to the shared canvas</p>
      </div>
      <footer className="shrink-0 border-t border-surface-border bg-bg-elevated/60 p-3">
        <div className="flex items-center gap-2" role="toolbar" aria-label="Story playback controls">
          <button type="button" aria-label="Previous step" title="Previous step" onClick={story.back} disabled={!story.valid || story.index === 0} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-border text-copy-secondary hover:bg-bg-subtle disabled:opacity-30"><SkipBack className="h-4 w-4" /></button>
          <button type="button" aria-label={story.playing ? "Pause story" : "Play story"} onClick={story.playPause} disabled={!story.valid} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-dim text-sm font-medium text-accent-ai-text hover:bg-bg-subtle disabled:opacity-40"><PlaybackIcon className="h-4 w-4" />{story.playing ? "Pause" : "Play story"}</button>
          <button type="button" aria-label="Next step" title="Next step" onClick={story.next} disabled={!story.valid || story.index >= story.count - 1} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-border text-copy-secondary hover:bg-bg-subtle disabled:opacity-30"><SkipForward className="h-4 w-4" /></button>
          <button type="button" aria-label="Replay story" title="Replay story" onClick={story.replay} disabled={!story.valid} className="flex h-10 w-8 shrink-0 items-center justify-center rounded-xl text-copy-muted hover:bg-bg-subtle disabled:opacity-30"><RotateCcw className="h-4 w-4" /></button>
        </div>
      </footer>
    </section>
  )
}
