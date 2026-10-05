import { MarkerType, type OnDelete, type OnEdgesChange, type OnNodesChange } from "@xyflow/react"
import { createCanvasGroup } from "@/lib/canvas-group"
import {
  CANVAS_EDGE_TYPE,
  CANVAS_NODE_TYPE,
  DEFAULT_EDGE_COLOR,
  NODE_COLORS,
  SHAPE_DEFAULT_SIZES,
  type CanvasEdge,
  type CanvasFlowNode,
  type CanvasGroup,
  type CanvasNode,
  type CanvasNodeShape,
} from "@/types/canvas"
import {
  getComponentKindDefinition,
  type ComponentKind,
} from "@/types/component-kind"

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasFlowNode[]
  edges: CanvasEdge[]
}

export interface TemplateBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

function templateGroup(
  id: string,
  label: string,
  x: number,
  y: number,
  width: number,
  height: number
): CanvasGroup {
  return createCanvasGroup({
    id,
    label,
    position: { x, y },
    width,
    height,
  })
}

function maxWidth(width: number): number { return Math.max(184, width) }

function templateNode(
  id: string,
  label: string,
  shape: CanvasNodeShape,
  x: number,
  y: number,
  colorIndex: number,
  options?: {
    width?: number
    height?: number
    componentKind?: ComponentKind
    parentId?: string
  }
): CanvasNode {
  const kind = options?.componentKind
    ? getComponentKindDefinition(options.componentKind)
    : null
  const color =
    NODE_COLORS[options?.componentKind ? kind!.colorIndex : colorIndex] ??
    NODE_COLORS[0]
  const defaults = kind
    ? { width: kind.width, height: kind.height }
    : SHAPE_DEFAULT_SIZES[shape]
  const width = kind ? maxWidth(options?.width ?? 192) : options?.width ?? defaults.width
  const height = kind ? 136 : options?.height ?? defaults.height

  return {
    id,
    type: CANVAS_NODE_TYPE,
    position: { x, y },
    width,
    height,
    ...(options?.parentId
      ? { parentId: options.parentId, extent: "parent" as const }
      : {}),
    data: {
      label,
      color: color.fill,
      textColor: color.text,
      shape: kind?.shape ?? shape,
      ...(options?.componentKind
        ? { componentKind: options.componentKind }
        : {}),
    },
  }
}

function templateEdge(
  id: string,
  source: string,
  target: string,
  label = "",
  sequence?: number
): CanvasEdge {
  return {
    id,
    type: CANVAS_EDGE_TYPE,
    source,
    target,
    data: {
      label,
      ...(sequence !== undefined ? { sequence } : {}),
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: DEFAULT_EDGE_COLOR,
      width: 16,
      height: 16,
    },
  }
}

export function getNodeDimensions(node: CanvasFlowNode): {
  width: number
  height: number
} {
  if (node.type === CANVAS_NODE_TYPE) {
    const defaults = SHAPE_DEFAULT_SIZES[node.data.shape]
    return {
      width: node.width ?? defaults.width,
      height: node.height ?? defaults.height,
    }
  }

  return {
    width: node.width ?? 420,
    height: node.height ?? 280,
  }
}

export function getTemplateBounds(nodes: CanvasFlowNode[]): TemplateBounds {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const node of nodes) {
    const { width, height } = getNodeDimensions(node)
    const position = getTemplateNodePosition(node, nodes)
    minX = Math.min(minX, position.x)
    minY = Math.min(minY, position.y)
    maxX = Math.max(maxX, position.x + width)
    maxY = Math.max(maxY, position.y + height)
  }

  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export function getTemplateNodePosition(node: CanvasFlowNode, nodes: CanvasFlowNode[]): { x: number; y: number } {
  const position = { ...node.position }
  let parentId = node.parentId
  const visited = new Set([node.id])
  while (parentId && !visited.has(parentId)) {
    visited.add(parentId)
    const parent = nodes.find((item) => item.id === parentId)
    if (!parent) break
    position.x += parent.position.x
    position.y += parent.position.y
    parentId = parent.parentId
  }
  return position
}

export function getNodeCenter(node: CanvasFlowNode, nodes: CanvasFlowNode[] = []): { x: number; y: number } {
  const { width, height } = getNodeDimensions(node)
  const position = getTemplateNodePosition(node, nodes)
  return {
    x: position.x + width / 2,
    y: position.y + height / 2,
  }
}

export function applyCanvasTemplate(
  template: CanvasTemplate,
  currentNodes: CanvasFlowNode[],
  currentEdges: CanvasEdge[],
  onNodesChange: OnNodesChange<CanvasFlowNode>,
  onEdgesChange: OnEdgesChange<CanvasEdge>,
  onDelete: OnDelete<CanvasFlowNode, CanvasEdge>
): void {
  onDelete({ nodes: currentNodes, edges: currentEdges })
  onNodesChange(template.nodes.map((item) => ({ type: "add", item })))
  onEdgesChange(template.edges.map((item) => ({ type: "add", item })))
}

function annotation(id: string, label: string, style: "heading" | "paragraph", y: number): CanvasNode {
  return {
    id, type: CANVAS_NODE_TYPE, position: { x: 12, y }, width: 1500,
    height: style === "heading" ? 64 : 84,
    data: { label, textStyle: style, shape: "rectangle", color: NODE_COLORS[0].fill, textColor: NODE_COLORS[0].text },
  }
}

interface ReferenceNode { id: string; label: string; kind: ComponentKind; column: number; row: number }
interface ReferenceEdge { source: string; target: string; label: string; sequence: number }

function referenceTemplate(id: string, name: string, description: string, note: string, items: ReferenceNode[], links: ReferenceEdge[]): CanvasTemplate {
  const columns = Math.max(...items.map((item) => item.column)) + 1
  const frameWidth = columns * 310 + 40
  const rows = [...new Set(items.map((item) => item.row))].sort()
  const groups = rows.map((row) => templateGroup(`${id}-lane-${row}`, id === "whatsapp" ? ["01 · Clients & entry points", "02 · Application & delivery services", "03 · Data stores & notifications", "04 · Recipient delivery"][row] : ["01 · Request / ingestion path", "02 · Delivery / background work", "03 · Supporting services & storage"][row], 0, 160 + row * 320, frameWidth, 240))
  const nodes: CanvasFlowNode[] = [
    annotation(`${id}-title`, name, "heading", 0),
    annotation(`${id}-description`, note, "paragraph", 64),
    ...groups,
    ...items.map((item) => templateNode(item.id, item.label, "rectangle", 30 + item.column * 310, 64, 0, { componentKind: item.kind, parentId: `${id}-lane-${item.row}` })),
  ]
  const byId = new Map(items.map((item) => [item.id, item]))
  const edges = links.map((link, index) => {
    const from = byId.get(link.source)!
    const to = byId.get(link.target)!
    const horizontal = from.row === to.row
    const forward = horizontal ? to.column > from.column : to.row > from.row
    return {
      ...templateEdge(`${id}-e${index + 1}`, link.source, link.target, link.label, link.sequence),
      sourceHandle: horizontal ? (forward ? "right" : "left") : (forward ? "bottom" : "top"),
      targetHandle: horizontal ? (forward ? "left" : "right") : (forward ? "top" : "bottom"),
    }
  })
  return { id, name, description, nodes, edges }
}

interface DataEntity { name: string; fields: string }
interface DataArchitecture { entities: DataEntity[]; relationships: [number, number, string][] }
const DATA_ARCHITECTURES: Record<string, DataArchitecture> = {
  whatsapp: {
    entities: [
      { name: "Users / Devices", fields: "SQL · user_id PK, device_id\nphone, public_key, created_at\nIndex: phone; unique device identity" },
      { name: "Chats", fields: "SQL · chat_id PK\ntype, created_by FK, created_at\nMetadata only; no plaintext history" },
      { name: "Chat Members", fields: "SQL · (chat_id, user_id) PK / FK\nrole, joined_at\nIndex: user_id → chat memberships" },
      { name: "Pending Envelopes", fields: "NoSQL · recipient_device partition PK\nmessage_id sort key, chat_id, ciphertext\nDedup key; delivery ACK / TTL cleanup" },
      { name: "Media Metadata", fields: "SQL · media_id PK, owner_id FK\nobject_key, content_type, size\nEncrypted bytes in S3; keys on clients" },
    ], relationships: [[0, 2, "User 1:N memberships"], [1, 2, "Chat 1:N members"], [1, 3, "Chat 1:N pending envelopes"], [0, 4, "User 1:N uploads"]],
  },
  youtube: {
    entities: [
      { name: "Channels", fields: "SQL · channel_id PK, owner_id\nname, created_at\nIndex: owner_id" },
      { name: "Videos", fields: "SQL · video_id PK, channel_id FK\ntitle, visibility, processing_status\nIndex: channel_id + published_at" },
      { name: "Media Assets", fields: "SQL · asset_id PK, video_id FK\nobject_key, codec, resolution\nSource / renditions stored in S3" },
      { name: "Processing Jobs", fields: "SQL · job_id PK, video_id FK\nstatus, attempts, idempotency_key\nWorkers lease jobs; retry safely" },
      { name: "Engagement", fields: "Partitioned store · video_id\nuser_id, event_id, type, timestamp\nCounters aggregated asynchronously" },
    ], relationships: [[0, 1, "Channel 1:N videos"], [1, 2, "Video 1:N renditions"], [1, 3, "Video 1:N jobs"], [1, 4, "Video 1:N interactions"]],
  },
  microservices: {
    entities: [
      { name: "Orders", fields: "Orders SQL · order_id PK\ncustomer_id, status, total\nIndex: customer_id + created_at" },
      { name: "Order Items", fields: "Orders SQL · (order_id, line_id) PK\nsku, quantity, unit_price\nImmutable price snapshot at checkout" },
      { name: "Reservations", fields: "Inventory SQL · reservation_id PK\norder_id, sku, quantity, expires_at\nAtomic stock check + reservation" },
      { name: "Payments", fields: "Payments store · payment_id PK\norder_id, provider_ref, status\nUnique idempotency_key" },
      { name: "Outbox Events", fields: "Orders SQL · event_id PK\norder_id, payload, published_at\nWritten in the order transaction" },
    ], relationships: [[0, 1, "Order 1:N lines"], [0, 2, "Order 1:N reservations"], [0, 3, "Order 1:N payment attempts"], [0, 4, "Order 1:N events"]],
  },
  "ci-cd-pipeline": {
    entities: [
      { name: "Build Runs", fields: "CI SQL · run_id PK, commit_sha\nstatus, started_at, finished_at\nLogs kept in object storage" },
      { name: "Artifacts", fields: "Registry · digest PK, run_id\nobject_key, signature, sbom_key\nImmutable bytes addressed by digest" },
      { name: "Releases", fields: "Release SQL · release_id PK\nartifact_digest FK, approval\nApproval binds to exact digest" },
      { name: "Deployments", fields: "Release SQL · deployment_id PK\nrelease_id FK, environment, status\nPrevious release retained for rollback" },
    ], relationships: [[0, 1, "Build 1:N artifacts"], [1, 2, "Artifact 1:N releases"], [2, 3, "Release 1:N deployments"]],
  },
  "event-driven": {
    entities: [
      { name: "Order Events", fields: "Broker log · event_id, order_id\ntype, version, payload, timestamp\nPartition by order_id for ordering" },
      { name: "Consumer Inbox", fields: "Consumer SQL · (consumer, event_id) PK\nprocessed_at, result\nDedup + side effect in one transaction" },
      { name: "Shipments", fields: "Fulfillment SQL · shipment_id PK\norder_id, status, tracking_ref\nUnique fulfillment idempotency key" },
      { name: "Failed Deliveries", fields: "DLQ · event_id, consumer\nattempts, reason, failed_at\nRetain original payload for replay" },
    ], relationships: [[0, 1, "Event 1:N consumer receipts"], [1, 2, "Receipt → shipment write"], [0, 3, "Event 0:N failed deliveries"]],
  },
}

function withDataArchitecture(template: CanvasTemplate): CanvasTemplate {
  const model = DATA_ARCHITECTURES[template.id]
  if (!model) return template
  const y = getTemplateBounds(template.nodes).maxY + 100
  const groupId = `${template.id}-data-model`
  const group = templateGroup(groupId, "Logical data model · keys, ownership & relationships", 0, y, model.entities.length * 310 + 40, 368)
  const entities = model.entities.map((entity, index) => templateNode(`${groupId}-${index}`, entity.name, "cylinder", 30 + index * 310, 64, 0, { componentKind: "database", parentId: groupId, width: 224 }))
  const notes = model.entities.map((entity, index): CanvasNode => ({
    ...annotation(`${groupId}-fields-${index}`, entity.fields, "paragraph", 214),
    parentId: groupId, extent: "parent", position: { x: 30 + index * 310, y: 214 }, width: 280, height: 120,
  }))
  const relationships = model.relationships.map(([source, target, label], index): CanvasEdge => ({
    ...templateEdge(`${groupId}-relation-${index}`, entities[source].id, entities[target].id, label),
    sourceHandle: "right", targetHandle: "left", data: { label, relationship: true }, style: { strokeDasharray: "5 4" },
  }))
  return { ...template, nodes: [...template.nodes, group, ...entities, ...notes], edges: [...template.edges, ...relationships] }
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  // High-level educational design; encryption constraints: engineering.fb.com/2021/07/14/security/whatsapp-multi-device/
  referenceTemplate("whatsapp", "WhatsApp · High-level design", "Chat, presence, media, offline delivery, and a connected logical data model.",
    "Illustrative messaging architecture. Clients encrypt/decrypt; servers route ciphertext. Pending envelopes expire after delivery or TTL; durable history stays on devices. SQL owns accounts and chat membership; partitioned storage owns pending delivery. Redis presence is ephemeral. Calls are outside this view.", [
    { id: "wa-sender", label: "Mobile / Web", kind: "client", column: 0, row: 0 },
    { id: "wa-lb", label: "Load Balancer", kind: "load-balancer", column: 1, row: 0 },
    { id: "wa-gateway", label: "API / WSS Gateway", kind: "api-gateway", column: 2, row: 0 },
    { id: "wa-auth", label: "Auth + Device Keys", kind: "server", column: 3, row: 0 },
    { id: "wa-router", label: "Chat Service", kind: "server", column: 2, row: 1 },
    { id: "wa-presence", label: "Presence Service", kind: "server", column: 0, row: 1 },
    { id: "wa-media", label: "Media Service", kind: "server", column: 1, row: 1 },
    { id: "wa-events", label: "Delivery Broker", kind: "message-broker", column: 3, row: 1 },
    { id: "wa-delivery", label: "Delivery Worker", kind: "worker", column: 4, row: 1 },
    { id: "wa-cache", label: "Redis · Sessions", kind: "cache", column: 0, row: 2 },
    { id: "wa-objects", label: "Encrypted Media · S3", kind: "s3", column: 1, row: 2 },
    { id: "wa-store", label: "Pending Envelopes", kind: "database", column: 2, row: 2 },
    { id: "wa-users", label: "Accounts / Chats SQL", kind: "database", column: 3, row: 2 },
    { id: "wa-push", label: "Notification Service", kind: "worker", column: 4, row: 2 },
    { id: "wa-cdn", label: "Media CDN", kind: "cdn", column: 1, row: 3 },
    { id: "wa-recipient", label: "Recipient Devices", kind: "client", column: 2, row: 3 },
    { id: "wa-provider", label: "APNs / FCM", kind: "saas", column: 4, row: 3 },
  ], [
    { source: "wa-sender", target: "wa-lb", label: "HTTPS / persistent WSS", sequence: 1 },
    { source: "wa-lb", target: "wa-gateway", label: "Distribute connections", sequence: 2 },
    { source: "wa-gateway", target: "wa-auth", label: "Validate session / public keys", sequence: 3 },
    { source: "wa-auth", target: "wa-users", label: "Accounts + device identities", sequence: 3 },
    { source: "wa-gateway", target: "wa-router", label: "Send encrypted envelope", sequence: 4 },
    { source: "wa-gateway", target: "wa-presence", label: "Heartbeat / session updates", sequence: 4 },
    { source: "wa-presence", target: "wa-cache", label: "Device → session · TTL", sequence: 4 },
    { source: "wa-gateway", target: "wa-media", label: "Authorize media upload", sequence: 4 },
    { source: "wa-media", target: "wa-objects", label: "Store encrypted object", sequence: 5 },
    { source: "wa-router", target: "wa-users", label: "Chat membership lookup", sequence: 5 },
    { source: "wa-router", target: "wa-store", label: "Persist pending · recipient shard", sequence: 5 },
    { source: "wa-router", target: "wa-events", label: "Publish delivery after persist", sequence: 6 },
    { source: "wa-events", target: "wa-delivery", label: "Consume + deduplicate", sequence: 7 },
    { source: "wa-delivery", target: "wa-cache", label: "Find online device session", sequence: 8 },
    { source: "wa-delivery", target: "wa-gateway", label: "Online: route to connection", sequence: 9 },
    { source: "wa-gateway", target: "wa-recipient", label: "Encrypted delivery / receipts", sequence: 10 },
    { source: "wa-delivery", target: "wa-store", label: "Delivery ACK → delete / expire", sequence: 11 },
    { source: "wa-delivery", target: "wa-push", label: "Offline: wake-up notification", sequence: 9 },
    { source: "wa-push", target: "wa-provider", label: "Push · no plaintext message", sequence: 10 },
    { source: "wa-provider", target: "wa-recipient", label: "Wake device; reconnect to fetch", sequence: 11 },
    { source: "wa-objects", target: "wa-cdn", label: "Media origin", sequence: 6 },
    { source: "wa-cdn", target: "wa-recipient", label: "Download ciphertext; decrypt locally", sequence: 10 },
  ]),
  // Video processing reference: https://docs.aws.amazon.com/solutions/latest/video-on-demand-on-aws/architecture-details.html
  referenceTemplate("youtube", "YouTube-style video platform", "Source upload, queued transcoding, published renditions, and CDN playback.",
    "Reference video-on-demand design, not YouTube's private infrastructure. Upload source media, enqueue an idempotent processing job, publish multiple renditions, and serve playback through the CDN. Real deployments can use signed direct uploads and workflow orchestration.", [
    { id: "yt-creator", label: "Creator", kind: "client", column: 0, row: 0 },
    { id: "yt-upload", label: "Upload API", kind: "api-gateway", column: 1, row: 0 },
    { id: "yt-source", label: "Source Media · S3", kind: "s3", column: 2, row: 0 },
    { id: "yt-jobs", label: "Transcode Jobs", kind: "queue", column: 3, row: 0 },
    { id: "yt-worker", label: "Transcode Workers", kind: "worker", column: 4, row: 0 },
    { id: "yt-catalog", label: "Catalog / Playback API", kind: "server", column: 2, row: 2 },
    { id: "yt-cache", label: "Metadata Cache", kind: "cache", column: 3, row: 2 },
    { id: "yt-search", label: "Search Index", kind: "database", column: 4, row: 2 },
    { id: "yt-meta", label: "Video Metadata", kind: "database", column: 1, row: 1 },
    { id: "yt-viewer", label: "Viewer", kind: "client", column: 2, row: 1 },
    { id: "yt-cdn", label: "Playback CDN", kind: "cdn", column: 3, row: 1 },
    { id: "yt-renditions", label: "Renditions · S3", kind: "s3", column: 4, row: 1 },
  ], [
    { source: "yt-viewer", target: "yt-catalog", label: "Browse / request playback", sequence: 7 },
    { source: "yt-catalog", target: "yt-meta", label: "Authorize + fetch video metadata", sequence: 8 },
    { source: "yt-catalog", target: "yt-cache", label: "Cache popular metadata", sequence: 8 },
    { source: "yt-catalog", target: "yt-search", label: "Search titles + tags", sequence: 8 },
    { source: "yt-worker", target: "yt-search", label: "Index published video", sequence: 6 },
    { source: "yt-creator", target: "yt-upload", label: "Upload video", sequence: 1 },
    { source: "yt-upload", target: "yt-source", label: "Store source object", sequence: 2 },
    { source: "yt-source", target: "yt-jobs", label: "Object-created event", sequence: 3 },
    { source: "yt-jobs", target: "yt-worker", label: "Consume processing job", sequence: 4 },
    { source: "yt-worker", target: "yt-renditions", label: "Write HLS / DASH renditions", sequence: 5 },
    { source: "yt-worker", target: "yt-meta", label: "Publish ready metadata", sequence: 6 },
    { source: "yt-renditions", target: "yt-cdn", label: "Origin response on cache miss", sequence: 7 },
    { source: "yt-cdn", target: "yt-viewer", label: "Stream cached segments", sequence: 8 },
  ]),
  referenceTemplate("microservices", "E-commerce order processing", "Inventory reservation, idempotent payments, and transactional outbox delivery.",
    "The Order API coordinates inventory reservation and payment before committing the order. An outbox relay publishes committed events to a broker; notification workers consume them asynchronously. Failed reservations or charges require compensation and idempotency.", [
    { id: "ms-client", label: "Checkout Client", kind: "client", column: 0, row: 0 },
    { id: "ms-gateway", label: "API Gateway", kind: "api-gateway", column: 1, row: 0 },
    { id: "ms-orders", label: "Order API", kind: "server", column: 2, row: 0 },
    { id: "ms-db", label: "Orders + Outbox", kind: "database", column: 3, row: 0 },
    { id: "ms-relay", label: "Outbox Relay", kind: "worker", column: 4, row: 0 },
    { id: "ms-catalog", label: "Catalog Service", kind: "server", column: 1, row: 2 },
    { id: "ms-products", label: "Products SQL", kind: "database", column: 2, row: 2 },
    { id: "ms-cache", label: "Catalog Cache", kind: "cache", column: 3, row: 2 },
    { id: "ms-email", label: "Notification Worker", kind: "worker", column: 0, row: 1 },
    { id: "ms-events", label: "Order Events", kind: "message-broker", column: 1, row: 1 },
    { id: "ms-inventory", label: "Inventory Service", kind: "server", column: 2, row: 1 },
    { id: "ms-stock", label: "Inventory DB", kind: "database", column: 3, row: 1 },
    { id: "ms-payment", label: "Payment Provider", kind: "saas", column: 4, row: 1 },
  ], [
    { source: "ms-gateway", target: "ms-catalog", label: "Browse products", sequence: 2 },
    { source: "ms-catalog", target: "ms-products", label: "Product + price lookup", sequence: 3 },
    { source: "ms-catalog", target: "ms-cache", label: "Cached product reads", sequence: 3 },
    { source: "ms-client", target: "ms-gateway", label: "POST /orders", sequence: 1 },
    { source: "ms-gateway", target: "ms-orders", label: "Authenticated request", sequence: 2 },
    { source: "ms-orders", target: "ms-inventory", label: "Reserve inventory", sequence: 3 },
    { source: "ms-inventory", target: "ms-stock", label: "Atomic reservation", sequence: 3 },
    { source: "ms-orders", target: "ms-payment", label: "Charge · idempotency key", sequence: 4 },
    { source: "ms-orders", target: "ms-db", label: "Commit order + outbox", sequence: 5 },
    { source: "ms-db", target: "ms-relay", label: "Read committed outbox", sequence: 6 },
    { source: "ms-relay", target: "ms-events", label: "Publish order-created", sequence: 7 },
    { source: "ms-events", target: "ms-email", label: "Consume + deduplicate", sequence: 8 },
  ]),
  referenceTemplate("ci-cd-pipeline", "CI/CD release pipeline", "Build once, test, publish an artifact, validate staging, and approve production.",
    "Promote the same immutable artifact through staging and production. Staging checks and an approval gate precede the release. Roll back to a previous artifact if health checks fail.", [
    { id: "ci-control", label: "Pipeline Orchestrator", kind: "server", column: 1, row: 2 },
    { id: "ci-runs", label: "Runs / Releases SQL", kind: "database", column: 2, row: 2 },
    { id: "ci-source", label: "Git Repository", kind: "saas", column: 0, row: 0 },
    { id: "ci-build", label: "Build + Test", kind: "worker", column: 1, row: 0 },
    { id: "ci-artifact", label: "Artifact Registry", kind: "blob-storage", column: 2, row: 0 },
    { id: "ci-staging", label: "Staging Deploy", kind: "server", column: 3, row: 0 },
    { id: "ci-gate", label: "Validate + Approve", kind: "worker", column: 3, row: 1 },
    { id: "ci-prod", label: "Production Deploy", kind: "server", column: 4, row: 1 },
  ], [
    { source: "ci-source", target: "ci-control", label: "Signed webhook / commit", sequence: 1 },
    { source: "ci-control", target: "ci-build", label: "Schedule isolated build", sequence: 2 },
    { source: "ci-control", target: "ci-runs", label: "Persist workflow state", sequence: 2 },
    { source: "ci-gate", target: "ci-runs", label: "Record approved release digest", sequence: 4 },
    { source: "ci-build", target: "ci-artifact", label: "Tests pass · publish digest", sequence: 2 },
    { source: "ci-artifact", target: "ci-staging", label: "Deploy pinned artifact", sequence: 3 },
    { source: "ci-staging", target: "ci-gate", label: "Smoke + integration checks", sequence: 4 },
    { source: "ci-gate", target: "ci-prod", label: "Promote approved digest", sequence: 5 },
  ]),
  referenceTemplate("event-driven", "Event-driven fulfillment", "Independent subscribers, idempotent processing, and dead-letter handling.",
    "An event broker routes order-created events to independent fulfillment and email subscriptions. Consumers retry transient failures and send poison messages to a dead-letter queue after their retry budget is exhausted. Writes and external calls must be idempotent.", [
    { id: "ev-outbox", label: "Orders + Outbox SQL", kind: "database", column: 0, row: 1 },
    { id: "ev-relay", label: "Outbox Relay", kind: "worker", column: 1, row: 1 },
    { id: "ev-producer", label: "Order Producer", kind: "server", column: 0, row: 0 },
    { id: "ev-broker", label: "Order Event Broker", kind: "message-broker", column: 1, row: 0 },
    { id: "ev-worker", label: "Fulfillment Worker", kind: "worker", column: 2, row: 0 },
    { id: "ev-db", label: "Shipment Records", kind: "database", column: 3, row: 0 },
    { id: "ev-email", label: "Email Worker", kind: "worker", column: 2, row: 1 },
    { id: "ev-provider", label: "Email Provider", kind: "saas", column: 3, row: 1 },
    { id: "ev-dlq", label: "Dead-Letter Queue", kind: "queue", column: 4, row: 1 },
  ], [
    { source: "ev-producer", target: "ev-outbox", label: "Commit order + event atomically", sequence: 1 },
    { source: "ev-outbox", target: "ev-relay", label: "Read committed outbox", sequence: 2 },
    { source: "ev-relay", target: "ev-broker", label: "Publish order-created", sequence: 3 },
    { source: "ev-broker", target: "ev-worker", label: "Fulfillment subscription", sequence: 4 },
    { source: "ev-broker", target: "ev-email", label: "Email subscription", sequence: 4 },
    { source: "ev-worker", target: "ev-db", label: "Idempotent shipment write", sequence: 5 },
    { source: "ev-email", target: "ev-provider", label: "Send confirmation", sequence: 5 },
    { source: "ev-worker", target: "ev-dlq", label: "Retry budget exhausted", sequence: 6 },
  ]),
].map(withDataArchitecture)
