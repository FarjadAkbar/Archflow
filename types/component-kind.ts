import { NODE_COLORS, type CanvasNodeShape } from "@/types/canvas"

export const COMPONENT_KINDS = [
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
] as const

export type ComponentKind = (typeof COMPONENT_KINDS)[number]

export interface ComponentKindDefinition {
  id: ComponentKind
  label: string
  shape: CanvasNodeShape
  colorIndex: number
  width: number
  height: number
}

const COMPONENT_KIND_DEFINITIONS: Record<
  ComponentKind,
  Omit<ComponentKindDefinition, "id">
> = {
  ec2: { label: "AWS EC2", shape: "rectangle", colorIndex: 3, width: 144, height: 144 },
  s3: { label: "Amazon S3", shape: "rectangle", colorIndex: 6, width: 144, height: 144 },
  r2: { label: "Cloudflare R2", shape: "rectangle", colorIndex: 3, width: 144, height: 144 },
  client: {
    label: "Client",
    shape: "rectangle",
    colorIndex: 1,
    width: 112,
    height: 128,
  },
  user: {
    label: "User",
    shape: "circle",
    colorIndex: 1,
    width: 104,
    height: 120,
  },
  "load-balancer": {
    label: "Load Balancer",
    shape: "hexagon",
    colorIndex: 2,
    width: 120,
    height: 128,
  },
  server: {
    label: "Server",
    shape: "rectangle",
    colorIndex: 3,
    width: 120,
    height: 128,
  },
  "api-gateway": {
    label: "API Gateway",
    shape: "hexagon",
    colorIndex: 2,
    width: 120,
    height: 128,
  },
  database: {
    label: "Database",
    shape: "cylinder",
    colorIndex: 1,
    width: 112,
    height: 136,
  },
  queue: {
    label: "Queue",
    shape: "pill",
    colorIndex: 5,
    width: 120,
    height: 120,
  },
  "message-broker": {
    label: "Message Broker",
    shape: "pill",
    colorIndex: 5,
    width: 128,
    height: 128,
  },
  cache: {
    label: "Cache",
    shape: "cylinder",
    colorIndex: 6,
    width: 112,
    height: 128,
  },
  worker: {
    label: "Worker",
    shape: "rectangle",
    colorIndex: 3,
    width: 120,
    height: 128,
  },
  "blob-storage": {
    label: "Blob Storage",
    shape: "rectangle",
    colorIndex: 6,
    width: 120,
    height: 128,
  },
  cdn: {
    label: "CDN",
    shape: "circle",
    colorIndex: 7,
    width: 112,
    height: 120,
  },
  firewall: {
    label: "Firewall / WAF",
    shape: "diamond",
    colorIndex: 4,
    width: 112,
    height: 128,
  },
  saas: {
    label: "Third-party / SaaS",
    shape: "rectangle",
    colorIndex: 2,
    width: 120,
    height: 128,
  },
}

export function isComponentKind(value: string): value is ComponentKind {
  return (COMPONENT_KINDS as readonly string[]).includes(value)
}

export function getComponentKindDefinition(
  kind: ComponentKind
): ComponentKindDefinition {
  return { id: kind, ...COMPONENT_KIND_DEFINITIONS[kind] }
}

export function componentKindColor(kind: ComponentKind) {
  const { colorIndex } = getComponentKindDefinition(kind)
  return NODE_COLORS[colorIndex] ?? NODE_COLORS[0]
}
