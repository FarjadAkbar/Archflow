import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { ArchitectureKindIcon } from "./architecture-icons"
import { CanvasNodeShapeView } from "./canvas-node-shape"
import { COMPONENT_KINDS } from "@/types/component-kind"

describe("architecture rendering", () => {
  it.each(COMPONENT_KINDS)("renders catalog icon %s", (kind) => {
    expect(renderToStaticMarkup(createElement(ArchitectureKindIcon, {
      kind, withTile: true,
    }))).toContain("<svg")
  })

  it("keeps a saved node with an unknown component kind visible", () => {
    const savedNode = JSON.parse('{"componentKind":"legacy-service","shape":"rectangle","label":"Existing service"}')
    expect(renderToStaticMarkup(createElement(CanvasNodeShapeView, savedNode)))
      .toContain("Existing service")
  })

  it("renders an unknown icon kind without throwing", () => {
    const savedIcon = JSON.parse('{"kind":"legacy-service","withTile":true}')
    expect(renderToStaticMarkup(createElement(ArchitectureKindIcon, savedIcon)))
      .toContain("<svg")
  })
})
