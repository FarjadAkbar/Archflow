import { describe, expect, it } from "vitest"
import {
  COMPONENT_KINDS,
  getComponentKindDefinition,
  isComponentKind,
} from "@/types/component-kind"

describe("component kind catalog", () => {
  it("exposes the architecture component kinds including cloud services", () => {
    expect(COMPONENT_KINDS).toEqual([
      "client",
      "user",
      "load-balancer",
      "server",
      "api-gateway",
      "database",
      "queue",
      "message-broker",
      "cache",
      "worker",
      "blob-storage",
      "cdn",
      "firewall",
      "saas",
      "ec2",
      "s3",
      "r2",
    ])
  })

  it("resolves database to cylinder geometry and a default label", () => {
    const definition = getComponentKindDefinition("database")

    expect(definition.shape).toBe("cylinder")
    expect(definition.label).toBe("Database")
    expect(definition.width).toBeGreaterThan(0)
    expect(definition.height).toBeGreaterThan(0)
  })

  it("resolves load-balancer to hexagon geometry", () => {
    expect(getComponentKindDefinition("load-balancer").shape).toBe("hexagon")
  })

  it("rejects unknown kind strings", () => {
    expect(isComponentKind("database")).toBe(true)
    expect(isComponentKind("mystery-box")).toBe(false)
  })
})
