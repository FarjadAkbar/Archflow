"use client"

import { useCallback, useRef, useState } from "react"
import { EditorCanvas } from "@/components/editor/editor-canvas"
import { EditorWorkspaceNavbar } from "@/components/editor/editor-workspace-navbar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ShareDialog } from "@/components/editor/share-dialog"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { Project } from "@/types/project"

interface EditorWorkspaceShellProps {
  roomId: string
  projectName: string
  isOwner: boolean
  ownedProjects: Project[]
  sharedProjects: Project[]
}

export function EditorWorkspaceShell({
  roomId,
  projectName,
  isOwner,
  ownedProjects,
  sharedProjects,
}: EditorWorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<CanvasSaveStatus>("idle")
  const saveNowRef = useRef<(() => Promise<void>) | null>(null)
  const actions = useProjectActions({ activeProjectId: roomId })

  const handleSaveReady = useCallback((saveNow: () => Promise<void>) => {
    saveNowRef.current = saveNow
  }, [])

  const handleSaveClick = useCallback(() => {
    void saveNowRef.current?.()
  }, [])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-base">
      <EditorWorkspaceNavbar
        projectName={projectName}
        sidebarOpen={sidebarOpen}
        aiSidebarOpen={aiSidebarOpen}
        onSidebarToggle={() => setSidebarOpen((open) => !open)}
        onAiSidebarToggle={() => setAiSidebarOpen((open) => !open)}
        onShareClick={() => setShareOpen(true)}
        onTemplatesClick={() => setTemplatesOpen(true)}
        saveStatus={saveStatus}
        onSaveClick={handleSaveClick}
      />

      <ProjectSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        activeProjectId={roomId}
        onNewProject={actions.openCreate}
        onRename={actions.openRename}
        onDelete={actions.openDelete}
      />

      <div className="relative flex min-h-0 flex-1 flex-col pt-14">
        <EditorCanvas
          roomId={roomId}
          templatesOpen={templatesOpen}
          onTemplatesOpenChange={setTemplatesOpen}
          aiSidebarOpen={aiSidebarOpen}
          onAiSidebarOpenChange={setAiSidebarOpen}
          onSaveStatusChange={setSaveStatus}
          onSaveReady={handleSaveReady}
        />
      </div>

      <ProjectDialogs actions={actions} />
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        roomId={roomId}
        isOwner={isOwner}
      />
    </div>
  )
}
