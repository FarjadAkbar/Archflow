"use client"

import { useCallback, useId } from "react"
import { getBezierPath, Position } from "@xyflow/react"
import { DialogPattern } from "@/components/editor/dialog-pattern"
import {
  CANVAS_TEMPLATES,
  getTemplateNodePosition,
  getNodeDimensions,
  getTemplateBounds,
  type CanvasTemplate,
} from "@/components/editor/starter-templates"
import { Button } from "@/components/ui/button"
import type {
  CanvasEdge,
  CanvasFlowNode,
  CanvasNode,
  CanvasNodeShape,
} from "@/types/canvas"
import { CANVAS_GROUP_TYPE, CANVAS_NODE_TYPE } from "@/types/canvas"

const PREVIEW_WIDTH = 280
const PREVIEW_HEIGHT = 156
const PREVIEW_PADDING = 16

interface StarterTemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (template: CanvasTemplate) => void
}

function PreviewNodeShape({
  shape,
  x,
  y,
  width,
  height,
  fill,
}: {
  shape: CanvasNodeShape
  x: number
  y: number
  width: number
  height: number
  fill: string
}) {
  const stroke = "var(--color-border-subtle)"

  if (shape === "circle") {
    return (
      <ellipse
        cx={x + width / 2}
        cy={y + height / 2}
        rx={width / 2}
        ry={height / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
    )
  }

  if (shape === "pill") {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
    )
  }

  if (shape === "diamond") {
    const cx = x + width / 2
    const cy = y + height / 2
    return (
      <polygon
        points={`${cx},${y + 4} ${x + width - 4},${cy} ${cx},${y + height - 4} ${x + 4},${cy}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
    )
  }

  if (shape === "hexagon") {
    return (
      <polygon
        points={`${x + width * 0.28},${y + 4} ${x + width * 0.72},${y + 4} ${x + width - 4},${y + height / 2} ${x + width * 0.72},${y + height - 4} ${x + width * 0.28},${y + height - 4} ${x + 4},${y + height / 2}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
    )
  }

  if (shape === "cylinder") {
    const rx = width * 0.38
    const ry = height * 0.09
    const top = y + ry
    const bottom = y + height - ry
    return (
      <g>
        <rect x={x + width * 0.12} y={top} width={width * 0.76} height={bottom - top} fill={fill} />
        <ellipse cx={x + width / 2} cy={top} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={1.5} />
        <ellipse cx={x + width / 2} cy={bottom} rx={rx} ry={ry} fill={fill} stroke={stroke} strokeWidth={1.5} />
      </g>
    )
  }

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={8}
      fill={fill}
      stroke={stroke}
      strokeWidth={1.5}
    />
  )
}

function TemplateDiagramPreview({
  nodes,
  edges,
}: {
  nodes: CanvasFlowNode[]
  edges: CanvasEdge[]
}) {
  const bounds = getTemplateBounds(nodes)
  const innerWidth = PREVIEW_WIDTH - PREVIEW_PADDING * 2
  const innerHeight = PREVIEW_HEIGHT - PREVIEW_PADDING * 2
  const scale =
    bounds.width > 0 && bounds.height > 0
      ? Math.min(innerWidth / bounds.width, innerHeight / bounds.height)
      : 1

  const offsetX =
    PREVIEW_PADDING + (innerWidth - bounds.width * scale) / 2 - bounds.minX * scale
  const offsetY =
    PREVIEW_PADDING + (innerHeight - bounds.height * scale) / 2 - bounds.minY * scale

  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const markerId = `preview-${useId().replace(/:/g, "")}`
  const anchor = (node: CanvasFlowNode, handle: string | null | undefined) => {
    const position = getTemplateNodePosition(node, nodes)
    const size = getNodeDimensions(node)
    const side = handle === "top" ? Position.Top : handle === "bottom" ? Position.Bottom : handle === "left" ? Position.Left : Position.Right
    return {
      x: (position.x + (side === Position.Left ? 0 : side === Position.Right ? size.width : size.width / 2)) * scale + offsetX,
      y: (position.y + (side === Position.Top ? 0 : side === Position.Bottom ? size.height : size.height / 2)) * scale + offsetY,
      side,
    }
  }

  return (
    <svg
      viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
      className="h-[156px] w-full rounded-xl border border-surface-border bg-bg-base"
      aria-hidden
    >
      {nodes.filter((node) => node.type === CANVAS_GROUP_TYPE).map((node) => {
        const position = getTemplateNodePosition(node, nodes)
        const size = getNodeDimensions(node)
        return <rect key={node.id} x={position.x * scale + offsetX} y={position.y * scale + offsetY} width={size.width * scale} height={size.height * scale} rx={5} fill="var(--color-bg-surface)" stroke="var(--color-border-default)" strokeWidth={0.6} />
      })}
      {edges.map((edge) => {
        const source = nodeById.get(edge.source)
        const target = nodeById.get(edge.target)
        if (!source || !target) {
          return null
        }

        const sourceAnchor = anchor(source, edge.sourceHandle)
        const targetAnchor = anchor(target, edge.targetHandle)
        const [path] = getBezierPath({ sourceX: sourceAnchor.x, sourceY: sourceAnchor.y, targetX: targetAnchor.x, targetY: targetAnchor.y, sourcePosition: sourceAnchor.side, targetPosition: targetAnchor.side })

        return (
          <path
            key={edge.id}
            d={path}
            fill="none"
            stroke="var(--color-border-subtle)"
            strokeWidth={0.8}
            markerEnd={`url(#${markerId})`}
          />
        )
      })}

      {nodes.map((node) => {
        if (node.type !== CANVAS_NODE_TYPE) {
          return null
        }

        const canvasNode = node as CanvasNode
        if (canvasNode.data.textStyle) return null
        const { width, height } = getNodeDimensions(canvasNode)
        const position = getTemplateNodePosition(canvasNode, nodes)
        return (
          <PreviewNodeShape
            key={canvasNode.id}
            shape={canvasNode.data.componentKind ? "rectangle" : canvasNode.data.shape}
            x={position.x * scale + offsetX}
            y={position.y * scale + offsetY}
            width={width * scale}
            height={height * scale}
            fill={canvasNode.data.color}
          />
        )
      })}

      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--color-border-subtle)" />
        </marker>
      </defs>
    </svg>
  )
}

function TemplateCard({
  template,
  onImport,
}: {
  template: CanvasTemplate
  onImport: (template: CanvasTemplate) => void
}) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-bg-elevated p-4">
      <TemplateDiagramPreview nodes={template.nodes} edges={template.edges} />
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-copy-primary">{template.name}</h3>
        <p className="text-sm text-copy-muted">{template.description}</p>
      </div>
      <Button
        type="button"
        size="sm"
        className="mt-auto w-full"
        onClick={() => onImport(template)}
      >
        Import template
      </Button>
    </article>
  )
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  const handleImport = useCallback(
    (template: CanvasTemplate) => {
      onImport(template)
      onOpenChange(false)
    },
    [onImport, onOpenChange]
  )

  return (
    <DialogPattern
      open={open}
      onOpenChange={onOpenChange}
      title="Starter templates"
      description="Replace the current canvas with a pre-built system design diagram."
      className="flex max-h-[85vh] flex-col sm:max-w-3xl"
    >
      <div className="-mx-1 max-h-[min(56vh,520px)] overflow-y-auto px-1 pb-1">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CANVAS_TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} onImport={handleImport} />
          ))}
        </div>
      </div>
    </DialogPattern>
  )
}
