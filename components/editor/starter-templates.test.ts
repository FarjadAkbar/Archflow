import { describe, expect, it, vi } from "vitest"
import { CANVAS_TEMPLATES, applyCanvasTemplate, getNodeDimensions, getTemplateNodePosition } from "./starter-templates"
import { isTextNode } from "@/lib/canvas-text"

describe("reference system templates", () => {
  it.each(CANVAS_TEMPLATES)("keeps $name readable, contained, and connected", (template) => {
    const ids = new Set(template.nodes.map((node) => node.id))
    expect(ids.size).toBe(template.nodes.length)
    for (const node of template.nodes) {
      if (!node.parentId) continue
      const group = template.nodes.find((item) => item.id === node.parentId)!
      const size = getNodeDimensions(node)
      expect(node.position.x).toBeGreaterThanOrEqual(0)
      expect(node.position.y).toBeGreaterThanOrEqual(40)
      expect(node.position.x + size.width).toBeLessThanOrEqual(group.width!)
      expect(node.position.y + size.height).toBeLessThanOrEqual(group.height!)
      for (const sibling of template.nodes.filter((item) => item.parentId === node.parentId && item.id !== node.id)) {
        const other = getNodeDimensions(sibling)
        const intersects = node.position.x < sibling.position.x + other.width && node.position.x + size.width > sibling.position.x && node.position.y < sibling.position.y + other.height && node.position.y + size.height > sibling.position.y
        expect(intersects).toBe(false)
      }
    }
    for (const edge of template.edges) {
      expect(ids.has(edge.source) && ids.has(edge.target)).toBe(true)
      expect(edge.sourceHandle).toBeTruthy()
      expect(edge.targetHandle).toBeTruthy()
      expect(edge.data?.label).toBeTruthy()
      expect(template.nodes.some((node) => node.id === edge.source && isTextNode(node))).toBe(false)
    }
  })
  it("converts child positions to the same absolute coordinates used by the canvas", () => {
    const template = CANVAS_TEMPLATES[0]
    const child = template.nodes.find((node) => Boolean(node.parentId))!
    const group = template.nodes.find((node) => node.id === child.parentId)!
    expect(getTemplateNodePosition(child, template.nodes)).toEqual({ x: group.position.x + child.position.x, y: group.position.y + child.position.y })
  })
})

describe("high-level architecture coverage", () => {
  it.each(CANVAS_TEMPLATES)("includes a logical data architecture in $name", (template) => {
    const group = template.nodes.find(node => node.id === `${template.id}-data-model`)
    expect(group).toBeDefined()
    const entities = template.nodes.filter(node => node.parentId === group?.id && !isTextNode(node))
    expect(entities.length).toBeGreaterThanOrEqual(4)
    const notes = template.nodes.filter(node => node.parentId === group?.id && isTextNode(node))
    expect(notes.every(node => node.data.label.includes("PK") || node.data.label.includes("event_id"))).toBe(true)
    const relationships = template.edges.filter(edge => edge.data?.relationship)
    expect(relationships.length).toBeGreaterThanOrEqual(3)
    expect(relationships.every(edge => entities.some(node => node.id === edge.source) && entities.some(node => node.id === edge.target) && edge.data?.sequence === undefined)).toBe(true)
  })
  it("covers messaging ingress, services, delivery and distinct storage tiers", () => {
    const template = CANVAS_TEMPLATES.find(template => template.id === "whatsapp")!
    const ids = new Set(template.nodes.map(node => node.id))
    for (const id of ["wa-lb", "wa-auth", "wa-router", "wa-presence", "wa-cache", "wa-media", "wa-objects", "wa-users", "wa-store", "wa-events", "wa-delivery", "wa-push", "wa-recipient"]) expect(ids.has(id)).toBe(true)
    expect(template.edges.some(edge => edge.source === "wa-gateway" && edge.target === "wa-recipient")).toBe(true)
  })
})

it("replaces existing canvas contents through the collaborative deletion callback", () => {
  const old = CANVAS_TEMPLATES.find(template => template.id === "youtube")!
  const next = CANVAS_TEMPLATES.find(template => template.id === "whatsapp")!
  const onDelete = vi.fn()
  const onNodesChange = vi.fn()
  const onEdgesChange = vi.fn()
  applyCanvasTemplate(next, old.nodes, old.edges, onNodesChange, onEdgesChange, onDelete)
  expect(onDelete).toHaveBeenCalledWith({ nodes: old.nodes, edges: old.edges })
  expect(onNodesChange).toHaveBeenCalledWith(next.nodes.map(item => ({ type: "add", item })))
  expect(onEdgesChange).toHaveBeenCalledWith(next.edges.map(item => ({ type: "add", item })))
  expect(onDelete.mock.invocationCallOrder[0]).toBeLessThan(onNodesChange.mock.invocationCallOrder[0])
  expect(onNodesChange.mock.invocationCallOrder[0]).toBeLessThan(onEdgesChange.mock.invocationCallOrder[0])
})
