import { MarkerType } from "@xyflow/react"
import { createCanvasNode } from "@/lib/canvas-node-factory"
import type { StoryStep } from "@/lib/story-playback"
import { CANVAS_EDGE_TYPE, DEFAULT_EDGE_COLOR, type CanvasEdge, type CanvasNode } from "@/types/canvas"
import { getComponentKindDefinition, type ComponentKind } from "@/types/component-kind"

export interface TrafficStory {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  failure: StoryStep[]
  recovery: StoryStep[]
}

export function createTrafficStory(origin: { x: number; y: number }): TrafficStory {
  const node = (kind: ComponentKind, label: string, x: number, y: number) => {
    const definition = getComponentKindDefinition(kind)
    const item = createCanvasNode({
      shape: definition.shape, width: 152, height: 144,
      position: { x: origin.x + x, y: origin.y + y }, componentKind: kind,
    })
    return { ...item, data: { ...item.data, label } }
  }
  const client = node("client", "Clients", 0, 170)
  const gateway = node("api-gateway", "API Gateway", 260, 170)
  const api = node("server", "Application", 540, 170)
  const db = node("database", "Database", 830, 170)
  const cache = node("cache", "Read Cache", 540, -60)
  const queue = node("queue", "Bounded Queue", 540, 400)
  const edge = (source: CanvasNode, target: CanvasNode, label: string, sourceHandle = "right", targetHandle = "left"): CanvasEdge => ({
    id: `${source.id}-${target.id}`, type: CANVAS_EDGE_TYPE,
    source: source.id, target: target.id, sourceHandle, targetHandle,
    data: { label }, markerEnd: { type: MarkerType.ArrowClosed, color: DEFAULT_EDGE_COLOR },
  })
  const request = edge(client, gateway, "HTTP requests")
  const route = edge(gateway, api, "Route requests")
  const query = edge(api, db, "Query / retry")
  const lookup = edge(gateway, cache, "Cache lookup", "top", "left")
  const cached = edge(cache, client, "Cached response", "left", "top")
  const enqueue = edge(gateway, queue, "Bounded admission", "bottom", "left")
  const drain = edge(queue, api, "Controlled drain", "top", "bottom")
  const step = (title: string, description: string, edgeIds: string[], nodes: StoryStep["nodes"], tone: StoryStep["tone"] = "active", travelers = 1): StoryStep => ({
    title, description, edgeIds, nodes, tone, travelers, durationMs: 2600,
  })
  return {
    nodes: [client, gateway, api, db, cache, queue],
    edges: [request, route, query, lookup, cached, enqueue, drain],
    failure: [
      step("A request arrives", "A client enters through the gateway. In this version, requests bypass the cache and queue.", [request.id], { [gateway.id]: { tone: "active", label: "Routing" } }),
      step("Traffic spikes", "Several requests arrive together and are forwarded directly to the application.", [request.id, route.id], { [api.id]: { tone: "busy", label: "Concurrent requests" } }, "busy", 4),
      step("Database slows down", "Slow database queries keep application requests in flight and occupy connections.", [query.id], { [db.id]: { tone: "busy", label: "Slow queries" }, [api.id]: { tone: "busy", label: "Waiting for DB" } }, "busy", 3),
      step("Pending work accumulates", "Requests wait inside the application. The dedicated bounded queue is not enabled in this version.", [route.id], { [api.id]: { tone: "busy", label: "Pending work growing" }, [queue.id]: { tone: "busy", label: "Not enabled" } }, "busy", 4),
      step("Retries amplify load", "Immediate retries send more queries to an already overloaded database, making recovery harder.", [query.id], { [db.id]: { tone: "failed", label: "Overloaded" }, [api.id]: { tone: "busy", label: "Retry storm" } }, "failed", 5),
      step("Requests fail", "Database timeouts exhaust application capacity. Clients see failed requests; this is an illustrative failure path.", [route.id, query.id], { [db.id]: { tone: "failed", label: "Timeouts" }, [api.id]: { tone: "failed", label: "Unavailable" }, [gateway.id]: { tone: "failed", label: "Request errors" } }, "failed", 0),
    ],
    recovery: [
      step("The same traffic spike", "Replay the same situation with caching and admission control enabled.", [request.id], { [gateway.id]: { tone: "busy", label: "Traffic spike" } }, "busy", 4),
      step("Serve repeated reads from cache", "Assume repeated reads have a warm cache. These requests avoid database queries.", [lookup.id, cached.id], { [cache.id]: { tone: "healthy", label: "Cache hits" } }, "healthy", 3),
      step("Admit work into a bounded queue", "Work that cannot use the read cache is admitted only while queue capacity is available.", [enqueue.id], { [queue.id]: { tone: "busy", label: "Bounded waiting" } }, "busy", 3),
      step("Apply backpressure", "When admission capacity is full, the gateway rejects excess work with retry-after guidance instead of unlimited immediate retries.", [request.id], { [gateway.id]: { tone: "busy", label: "Retry later" }, [queue.id]: { tone: "busy", label: "At capacity" } }, "busy", 1),
      step("Drain at a controlled rate", "Accepted work reaches the application at a rate the database can handle.", [drain.id, query.id], { [api.id]: { tone: "healthy", label: "Controlled load" }, [db.id]: { tone: "healthy", label: "Queries completing" } }, "healthy", 1),
      step("Capacity recovers", "The backlog drains. Cached reads continue and accepted work completes; excess traffic still needs retry/backoff. No capacity measurements are implied.", [cached.id, drain.id], { [queue.id]: { tone: "healthy", label: "Backlog draining" }, [api.id]: { tone: "healthy", label: "Available" }, [db.id]: { tone: "healthy", label: "Healthy" } }, "healthy", 2),
    ],
  }
}
