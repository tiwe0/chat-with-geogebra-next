"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Plus, ChevronLeft, Settings } from "lucide-react"
import type { Conversation } from "@/lib/store"

interface SidebarProps {
  conversations: Conversation[]
  activeConversationId: string
  onCreateConversation: () => void
  onDeleteConversation: (id: string) => void
  onSelectConversation: (id: string) => void
  onToggleSidebar: () => void
  onOpenConfig: () => void
  isLoading: boolean
}

export function Sidebar({
  conversations,
  activeConversationId,
  onCreateConversation,
  onDeleteConversation,
  onSelectConversation,
  onToggleSidebar,
  onOpenConfig,
  isLoading,
}: SidebarProps) {
  return (
    <div className="w-64 border-r p-4 relative">
      <div className="flex items-center mb-4">
        <Button variant="outline" className="flex-1 justify-start" onClick={onCreateConversation} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" /> 新对话
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 ml-2" onClick={onToggleSidebar}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">收起侧栏</span>
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="space-y-2">
          {conversations.map((conv) => (
            <div key={conv.id} className="flex items-center gap-2 mb-2">
              <Button
                variant={activeConversationId === conv.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left truncate"
                onClick={() => onSelectConversation(conv.id)}
              >
                {conv.title}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteConversation(conv.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-4 pt-4 border-t flex items-center">
        <Button variant="outline" className="flex-1 justify-start" onClick={onOpenConfig}>
          <Settings className="mr-2 h-4 w-4" /> 设置
        </Button>
      </div>
    </div>
  )
}

