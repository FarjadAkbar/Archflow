"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { CanvasTextStyle } from "@/lib/canvas-text"

export function CanvasTextBlock({ label, style, selected, onChange }: {
  label: string
  style: CanvasTextStyle
  selected: boolean
  onChange: (label: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const input = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { if (editing) input.current?.focus() }, [editing])
  const typography = style === "heading" ? "text-2xl font-semibold leading-tight tracking-tight text-copy-primary" : "text-sm leading-relaxed text-copy-secondary"
  return (
    <div className={cn("h-full w-full rounded-xl border p-3", selected ? "border-brand/50" : "border-transparent")} onDoubleClick={(event) => { event.stopPropagation(); setEditing(true) }}>
      {editing ? <textarea
        ref={input} aria-label={`Edit ${style}`} value={label}
        onChange={(event) => onChange(event.target.value)} onBlur={() => setEditing(false)}
        onKeyDown={(event) => { event.stopPropagation(); if (event.key === "Escape") setEditing(false) }}
        className={cn("nodrag nopan nowheel h-full w-full resize-none bg-transparent outline-none", typography)}
      /> : <div role="textbox" tabIndex={0} aria-label={`Edit ${style}`} aria-multiline="true" onKeyDown={(event) => {
        if (event.key === "Enter") { event.stopPropagation(); event.preventDefault(); setEditing(true) }
      }} className={cn("h-full w-full overflow-auto whitespace-pre-wrap break-words outline-none", typography)}>{label || (style === "heading" ? "Heading" : "Paragraph")}</div>}
    </div>
  )
}
