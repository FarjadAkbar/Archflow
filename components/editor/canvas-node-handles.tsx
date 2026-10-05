import { Handle, Position, useConnection } from "@xyflow/react"
import { cn } from "@/lib/utils"

const handleClassName = cn(
  "canvas-node-handle",
  "!h-3 !w-3 !rounded-full !border-2 !border-bg-base !bg-copy-primary !z-20",
  "opacity-0 transition-opacity duration-150",
  "group-hover/node:opacity-100 group-focus-within/node:opacity-100 hover:!opacity-100 hover:!bg-accent-ai"
)

const handlePositions = [
  { position: Position.Top, id: "top" },
  { position: Position.Right, id: "right" },
  { position: Position.Bottom, id: "bottom" },
  { position: Position.Left, id: "left" },
] as const

export function CanvasNodeHandles() {
  const connecting = useConnection((connection) => connection.inProgress)
  const visibleHandleClassName = cn(handleClassName, connecting && "!opacity-100")
  return (
    <>
      {handlePositions.map(({ position, id }) => (
        <Handle
          key={`source-${id}`}
          id={id}
          type="source"
          position={position}
          className={visibleHandleClassName}
          isConnectable
        />
      ))}
      {handlePositions.map(({ position, id }) => (
        <Handle
          key={`target-${id}`}
          id={`${id}-target`}
          type="target"
          position={position}
          className={visibleHandleClassName}
          isConnectable
        />
      ))}
    </>
  )
}
