import { describe, expect, it } from "vitest"
import { createCanvasText, isTextNode, parseTextDragPayload } from "./canvas-text"
import { buildSpecTriggerBody } from "./build-spec-trigger-body"

describe("canvas text annotations", () => {
  it("preserves paragraph style and multiline content in a snapshot round-trip", () => {
    const node = createCanvasText("paragraph", { x: 200, y: 200 })
    node.data.label = "First paragraph\nSecond paragraph"
    const restored = JSON.parse(JSON.stringify(node))
    expect(isTextNode(restored)).toBe(true)
    expect(restored.data.label).toBe("First paragraph\nSecond paragraph")
    expect(restored.data.componentKind).toBeUndefined()
  })
  it("validates drag styles rather than accepting arbitrary payloads", () => {
    expect(parseTextDragPayload('"heading"')).toBe("heading")
    expect(parseTextDragPayload('"paragraph"')).toBe("paragraph")
    expect(parseTextDragPayload('{"style":"heading"}')).toBeNull()
    expect(parseTextDragPayload("broken")).toBeNull()
  })
  it("does not send annotations or their edges as infrastructure to spec generation", () => {
    const note = createCanvasText("heading", { x: 0, y: 0 })
    const body = buildSpecTriggerBody({ roomId: "room", chatHistory: [], nodes: [note], edges: [{ id: "legacy-edge", source: note.id, target: note.id }] })
    expect(body.nodes).toEqual([])
    expect(body.edges).toEqual([])
  })
})
