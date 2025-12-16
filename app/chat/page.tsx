"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, Plus } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ConfigDialog } from "@/components/config-dialog"
import { Textarea } from "@/components/ui/textarea"
import { ChatInterface } from "@/components/chat-interface"
import { Toast } from "@/components/toast"
import { Sidebar } from "@/components/sidebar"
import { GeoGebraPanel } from "@/components/geogebra-panel"
import { useAppStore, convertChatMessagesToStore, convertStoreMessagesToChat } from "@/lib/store"
import { useGeoGebraCommands } from "@/hooks/use-geogebra-commands"
import { useGeoGebra } from "@/hooks/use-geogebra"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { logger } from "@/lib/logger"
import Head from "next/head"
import "@/lib/debug-storage" // 加载调试工具
import { DefaultChatTransport } from "ai"

// 声明全局类型
declare global {
  interface Window {
    GGBApplet: any
    ggbApplet: any
    ggbAppletReady: boolean
  }
}

export default function ChatPage() {
  // 使用自定义钩子
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const { error, setError, clearError, setTemporaryError, handleError } = useErrorHandler()
  const { extractLatestCommands } = useGeoGebraCommands()
  const { executeCommands } = useGeoGebra()

  // 从store获取状态 - 使用选择器函数避免不必要的重新渲染
  const config = useAppStore((state) => state.config)
  const conversations = useAppStore((state) => state.conversations)
  const activeConversationId = useAppStore((state) => state.activeConversationId)
  const sidebarOpen = useAppStore((state) => state.sidebarOpen)
  const showGeogebra = useAppStore((state) => state.showGeogebra)

  // 确保store初始化
  useEffect(() => {
    const state = useAppStore.getState()
    
    // 如果没有对话，创建一个默认对话
    if (!state.conversations || state.conversations.length === 0) {
      logger.info("初始化：创建默认对话")
      state.createConversation()
    }
    
    // 确保activeConversationId有效
    const hasActiveConversation = state.conversations.some(c => c.id === state.activeConversationId)
    if (!hasActiveConversation && state.conversations.length > 0) {
      logger.info("初始化：设置活动对话", { id: state.conversations[0].id })
      state.setActiveConversation(state.conversations[0].id)
    }
    
    // 确保messages对象存在
    if (!state.messages) {
      logger.info("初始化：创建消息存储")
      state.conversations.forEach(conv => {
        if (!state.messages[conv.id]) {
          state.setMessages(conv.id, [])
        }
      })
    }
  }, [])

  // 使用useRef和useEffect来获取消息，避免直接在渲染中访问可能导致的问题
  const storeMessagesRef = useRef<any[]>([])
  const [localMessages, setLocalMessages] = useState<any[]>([])

  // 当activeConversationId变化时，从store加载消息
  useEffect(() => {
    const messages = useAppStore.getState().messages[activeConversationId] || []
    storeMessagesRef.current = messages
    setLocalMessages(messages)
    logger.info("加载对话消息", { conversationId: activeConversationId, messageCount: messages.length })
  }, [activeConversationId])

  // 本地UI状态
  const [configOpen, setConfigOpen] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // 使用useMemo缓存配置，避免每次渲染都创建新对象
  const chatConfig = useMemo(
    () => ({
      configSettings: config,
    }),
    [config],
  )

  // 回调函数
  const onFinish = useCallback(
    (message: any) => {
      // SDK 5 中消息使用 parts 而不是 content
      let contentLength = 0
      if (message.parts && Array.isArray(message.parts)) {
        const textContent = message.parts
          .filter((part: any) => part.type === "text")
          .map((part: any) => part.text)
          .join("")
        contentLength = textContent.length
      }
      logger.info("聊天完成", { messageLength: contentLength })
      // 从useChat获取最新的messages并保存到store
      // 注意：这里不能直接访问messages，因为它可能还未更新
      // 我们需要在useEffect中监听messages变化来保存
    },
    [activeConversationId],
  )

  const onError = useCallback(
    (error: Error) => {
      handleError(error)
    },
    [handleError],
  )

  // 初始化聊天钩子
  const {messages, sendMessage, status, error: chatError, setMessages: setChatMessages} = useChat({
    id: activeConversationId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: chatConfig,
    }),
    onFinish,
    onError,
  })

  // 本地管理 input 状态（SDK 5 不再管理 input）
  const [input, setInput] = useState("")

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  const isLoading = status === "submitted" || status === "streaming"

  // 当activeConversationId变化时，同步更新useChat的messages
  useEffect(() => {
    const storeMessages = useAppStore.getState().messages[activeConversationId] || []
    const chatMessages = convertStoreMessagesToChat(storeMessages)
    setChatMessages(chatMessages)
    logger.info("同步对话消息到useChat", { conversationId: activeConversationId, messageCount: chatMessages.length })
  }, [activeConversationId, setChatMessages])

  // 当messages变化时，保存到store（但不在切换对话时保存）
  const previousConversationIdRef = useRef(activeConversationId)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    // 如果对话ID变化了，更新ref但不保存（因为这是切换对话）
    if (previousConversationIdRef.current !== activeConversationId) {
      previousConversationIdRef.current = activeConversationId
      return
    }

    // 清除之前的保存定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // 延迟保存，避免频繁保存（特别是在流式传输时）
    saveTimeoutRef.current = setTimeout(() => {
      if (messages.length > 0) {
        const updatedMessages = convertChatMessagesToStore(messages)
        const currentStoreMessages = useAppStore.getState().messages[activeConversationId] || []
        
        // 比较消息内容，而不仅仅是长度
        const needsSave = updatedMessages.length !== currentStoreMessages.length ||
          updatedMessages.some((msg, idx) => {
            const storeMsg = currentStoreMessages[idx]
            return !storeMsg || msg.content !== storeMsg.content
          })
        
        if (needsSave) {
          useAppStore.getState().setMessages(activeConversationId, updatedMessages)
          setLocalMessages(updatedMessages)
          logger.info("消息已保存到store", { conversationId: activeConversationId, messageCount: updatedMessages.length })
        }
      }
    }, 500) // 500ms 延迟，避免频繁保存

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [messages, activeConversationId])

  // 处理聊天错误
  useEffect(() => {
    if (chatError) {
      handleError(chatError)
    }
  }, [chatError, handleError])

  // 当activeConversationId变化时，重置错误状态
  useEffect(() => {
    clearError()
  }, [activeConversationId, clearError])

  // 当用户提交消息时，更新store中的对话标题（仅在第一条消息时）
  useEffect(() => {
    if (messages.length > 0 && messages[0].role === "user") {
      const conversation = conversations.find((c) => c.id === activeConversationId)
      // 只在对话标题是默认值时更新（包括"新会话"、"新对话"、"新会话 2"等）
      if (conversation && (conversation.title === "新会话" || conversation.title === "新对话" || conversation.title.startsWith("新会话 "))) {
        // 提取消息内容（兼容 SDK 5 的 parts 格式）
        let content = ""
        if (messages[0].parts && Array.isArray(messages[0].parts)) {
          content = messages[0].parts
            .filter((part: any) => part.type === "text")
            .map((part: any) => part.text)
            .join("")
        } else if ((messages[0] as any).content) {
          content = (messages[0] as any).content
        }
        
        const title = content.slice(0, 30) + (content.length > 30 ? "..." : "")
        useAppStore.getState().updateConversationTitle(activeConversationId, title)
        logger.info("更新对话标题", { conversationId: activeConversationId, title })
      }
    }
  }, [messages, activeConversationId, conversations])

  // 自定义提交处理函数
  const handleChatSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!input.trim() || isLoading) return

      clearError()
      logger.info("提交消息", { inputLength: input.length })

      try {
        // SDK 5 中 sendMessage 接受对象而不是字符串
        sendMessage({ text: input }, {
          body: chatConfig,
        })
        setInput("") // 清空输入
      } catch (err) {
        handleError(err)
      }
    },
    [input, isLoading, clearError, sendMessage, chatConfig, handleError],
  )

  // 事件处理函数
  const toggleSidebar = useCallback(() => {
    logger.info("切换侧边栏", { 当前状态: sidebarOpen })
    useAppStore.getState().setSidebarOpen(!sidebarOpen)
  }, [sidebarOpen])

  const handleCreateConversation = useCallback(() => {
    if (!isLoading) {
      logger.info("创建新对话")
      useAppStore.getState().createConversation()
    }
  }, [isLoading])

  const handleSetShowGeogebra = useCallback((show: boolean) => {
    logger.info("设置显示GeoGebra", { show })
    useAppStore.getState().setShowGeogebra(show)
  }, [])

  const handleSetActiveConversation = useCallback((id: string) => {
    logger.info("设置活动对话", { id })
    useAppStore.getState().setActiveConversation(id)
  }, [])

  const handleDeleteConversation = useCallback((id: string) => {
    logger.info("删除对话", { id })
    useAppStore.getState().deleteConversation(id)
  }, [])

  // 执行最新消息中的所有GeoGebra命令
  const executeLatestCommands = useCallback(() => {
    // 转换消息格式以便提取命令（需要 content 属性）
    const messagesWithContent = messages.map((msg: any) => {
      let content = ""
      if (msg.parts && Array.isArray(msg.parts)) {
        content = msg.parts
          .filter((part: any) => part.type === "text")
          .map((part: any) => part.text)
          .join("")
      } else if (msg.content) {
        content = msg.content
      }
      return { ...msg, content }
    })

    const commands = extractLatestCommands(messagesWithContent)

    if (commands.length === 0) {
      setTemporaryError("没有找到GeoGebra命令")
      return
    }

    logger.info("执行最新消息中的GeoGebra命令", { commandCount: commands.length })
    executeCommands(commands)
    setTemporaryError(`已执行${commands.length}条GeoGebra命令`)
  }, [messages, extractLatestCommands, executeCommands, setTemporaryError])

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta charSet="utf-8" />
      </Head>
      <div className="flex h-screen bg-background">
        {/* Config Dialog */}
        <ConfigDialog
          open={configOpen}
          onOpenChange={setConfigOpen}
          onSave={() => setSaveSuccess(true)}
        />

        {/* Sidebar for conversations */}
        {isDesktop && sidebarOpen && (
          <Sidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onCreateConversation={handleCreateConversation}
            onDeleteConversation={handleDeleteConversation}
            onSelectConversation={handleSetActiveConversation}
            onToggleSidebar={toggleSidebar}
            onOpenConfig={() => setConfigOpen(true)}
            isLoading={isLoading}
          />
        )}

        {isDesktop && !sidebarOpen && (
          <div className="w-10 shrink-0 flex items-center justify-center border-r">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none"
              onClick={toggleSidebar}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">展开侧栏</span>
            </Button>
          </div>
        )}

        {/* Main content area with chat and GeoGebra */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* Chat section */}
          {isDesktop && !showGeogebra && (
            <Button
              variant="outline"
              className="absolute top-4 right-4 z-10"
              onClick={() => handleSetShowGeogebra(true)}
            >
              显示 GeoGebra
            </Button>
          )}
          <div
            className={`${
              isDesktop && showGeogebra ? "lg:w-[50%]" : "w-full"
            } flex flex-row relative`}
          >
            {/* Mobile view tabs */}
            <div className="lg:hidden w-full">
              <Tabs defaultValue="chat" className="w-full">
                <div className="flex items-center p-2 border-b">
                  <TabsList className="flex-1">
                    <TabsTrigger value="chat">对话</TabsTrigger>
                    <TabsTrigger value="settings">设置</TabsTrigger>
                  </TabsList>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCreateConversation}
                    disabled={isLoading}
                    className="ml-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <TabsContent
                  value="chat"
                  className="h-[calc(100vh-112px)] flex flex-col"
                >
                  <ChatInterface
                    messages={messages}
                    input={input}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleChatSubmit}
                    isLoading={isLoading}
                    error={error}
                    onExecuteCommands={executeCommands}
                  />
                </TabsContent>

                <TabsContent
                  value="settings"
                  className="h-[calc(100vh-112px)] p-4"
                >
                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">设置</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">模型类型</label>
                        <select
                          className="w-full p-2 bg-background border rounded-md"
                          value={config.modelType}
                          onChange={(e) =>
                            useAppStore
                              .getState()
                              .updateConfig({ modelType: e.target.value })
                          }
                        >
                          <option value="gpt-4o">GPT-4o</option>
                          <option value="gpt-4">GPT-4</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          <option value="claude-3-opus">Claude 3 Opus</option>
                          <option value="claude-3-sonnet">
                            Claude 3 Sonnet
                          </option>
                          <option value="claude-3-haiku">Claude 3 Haiku</option>
                          <option value="deepseek-chat">DeepSeek Chat</option>
                          <option value="deepseek-coder">DeepSeek Coder</option>
                          <option value="llama-3">Llama 3</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          OpenAI API 密钥
                        </label>
                        <input
                          type="password"
                          value={config.apiKeys.openai || ""}
                          onChange={(e) =>
                            useAppStore
                              .getState()
                              .updateApiKey("openai", e.target.value)
                          }
                          placeholder="输入 OpenAI API 密钥"
                          className="w-full p-2 bg-background border rounded-md"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Anthropic API 密钥
                        </label>
                        <input
                          type="password"
                          value={config.apiKeys.anthropic || ""}
                          onChange={(e) =>
                            useAppStore
                              .getState()
                              .updateApiKey("anthropic", e.target.value)
                          }
                          placeholder="输入 Anthropic API 密钥"
                          className="w-full p-2 bg-background border rounded-md"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          DeepSeek API 密钥
                        </label>
                        <input
                          type="password"
                          value={config.apiKeys.deepseek || ""}
                          onChange={(e) =>
                            useAppStore
                              .getState()
                              .updateApiKey("deepseek", e.target.value)
                          }
                          placeholder="输入 DeepSeek API 密钥"
                          className="w-full p-2 bg-background border rounded-md"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          系统提示词
                        </label>
                        <Textarea
                          value={config.systemPrompt}
                          onChange={(e) =>
                            useAppStore
                              .getState()
                              .updateConfig({ systemPrompt: e.target.value })
                          }
                          placeholder="输入系统提示词，定义AI助手的行为和知识范围"
                          className="min-h-[100px]"
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSaveSuccess(true);
                          setTimeout(() => setSaveSuccess(false), 3000);
                        }}
                      >
                        保存设置
                      </Button>
                      {saveSuccess && (
                        <div className="mt-2 p-2 bg-green-100 text-green-800 rounded-md text-center">
                          设置已成功保存
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Desktop chat interface */}
            <div className="flex-1 hidden lg:flex flex-col">
              <ChatInterface
                messages={messages}
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleChatSubmit}
                isLoading={isLoading}
                onOpenConfig={() => setConfigOpen(true)}
                error={error}
                onExecuteCommands={executeCommands}
              />
            </div>
          </div>

          {/* GeoGebra section (desktop only) */}
          {isDesktop && showGeogebra && (
            <GeoGebraPanel
              onHide={() => handleSetShowGeogebra(false)}
              onExecuteLatestCommands={executeLatestCommands}
            />
          )}
        </div>
        {saveSuccess && (
          <Toast variant="success" position="top">
            设置已成功保存
          </Toast>
        )}
        {error && (
          <Toast
            variant="error"
            position="top"
            open={!!error}
            onClose={clearError}
          >
            {error}
          </Toast>
        )}
      </div>
    </>
  );
}
