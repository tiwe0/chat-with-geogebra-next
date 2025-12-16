"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, AlertCircle, Play, ChevronDown, ChevronUp, Code, AlertTriangle, Info } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useGeoGebraCommands, type CommandWithLint } from "@/hooks/use-geogebra-commands"
import { useGeoGebraLint } from "@/hooks/use-geogebra-lint"

interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

interface ChatInterfaceProps {
  messages: any
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  onOpenConfig?: () => void
  error?: string | null
  onExecuteCommands?: (commands: string[]) => void
}

export function ChatInterface({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  onOpenConfig,
  error,
  onExecuteCommands,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({})
  const { extractAllMessagesCommandsWithLint } = useGeoGebraCommands()
  const { formatLintErrors, getLintStats } = useGeoGebraLint()

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // 当消息更新时滚动到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // 为每个消息提取GeoGebra命令并进行 lint 检查
  const messageCommandsMap = useMemo(() => {
    // 转换消息为统一格式，以便提取命令
    const messagesWithContent = messages.map((msg: any) => {
      // SDK 5 使用 parts 格式
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
    return extractAllMessagesCommandsWithLint(messagesWithContent)
  }, [messages, extractAllMessagesCommandsWithLint])

  // 切换消息命令的展开/折叠状态
  const toggleMessageExpanded = useCallback((messageId: string) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }))
  }, [])

  // 执行特定消息的命令
  const executeMessageCommands = useCallback(
    (messageId: string) => {
      const commandsWithLint = messageCommandsMap[messageId] || []
      // 只执行没有错误的命令
      const validCommands = commandsWithLint
        .filter((cmd) => !cmd.errors.some((e) => e.severity === "error"))
        .map((cmd) => cmd.command)

      if (validCommands.length > 0 && onExecuteCommands) {
        onExecuteCommands(validCommands)
      }
    },
    [messageCommandsMap, onExecuteCommands],
  )

  // 执行单个命令（带 lint 检查）
  const executeSingleCommand = useCallback(
    (command: string, hasErrors: boolean) => {
      if (!hasErrors && onExecuteCommands) {
        onExecuteCommands([command])
      }
    },
    [onExecuteCommands],
  )

  return (
    <Card className="flex-1 flex flex-col overflow-hidden border-0 rounded-none">
      <CardHeader className="border-b p-4 shrink-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">对话</CardTitle>
          <div className="flex gap-2"></div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 relative overflow-hidden">
        <div className="chat-messages-container absolute inset-0 p-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">开始一个对话</h3>
                <p className="text-muted-foreground">提出问题或开始新话题以开始聊天。</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2 pb-1">
              {messages.map((message: any) => {
                const messageId = message.id || `msg-${Math.random()}`
                const commandsWithLint = messageCommandsMap[messageId] || []
                const hasCommands = commandsWithLint.length > 0

                // 提取文本内容（兼容新旧格式）
                let messageContent = ""
                if (message.parts && Array.isArray(message.parts)) {
                  // SDK 5 格式：使用 parts
                  messageContent = message.parts
                    .filter((part: any) => part.type === "text")
                    .map((part: any) => part.text)
                    .join("")
                } else if (message.content) {
                  // 向后兼容旧格式
                  messageContent = message.content
                }

                // 计算统计信息
                const allErrors = commandsWithLint.flatMap((cmd) => cmd.errors)
                const stats = getLintStats(allErrors)

                return (
                  <div key={messageId} className="mb-3">
                    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      {message.role === "assistant" && hasCommands && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 mr-1 shrink-0 self-start mt-1"
                          onClick={() => executeMessageCommands(messageId)}
                          title="执行此消息中的所有GeoGebra命令"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <div
                        className={`max-w-[90%] rounded-lg px-3 py-1.5 ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <div className="markdown-content whitespace-pre-wrap wrap-break-word">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath, remarkGfm]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              a: ({ node, ...props }) => (
                                <a
                                  {...props}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                />
                              ),
                              code: ({ node, className, children, ...props }) => {
                                return (
                                  <div className="bg-gray-100 dark:bg-gray-900 rounded-md my-1 overflow-x-auto">
                                    <code className="block p-2 text-sm text-blue-50" {...props}>
                                      {children}
                                    </code>
                                  </div>
                                )
                              },
                            }}
                          >
                            {messageContent}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    {/* 在助手消息下方显示GeoGebra命令 */}
                    {message.role === "assistant" && hasCommands && (
                      <div className="ml-4 mt-1 mb-2 w-[90%]">
                        <Collapsible
                          open={expandedMessages[messageId] || false}
                          onOpenChange={() => toggleMessageExpanded(messageId)}
                          className="w-full"
                        >
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1 h-6 px-2 text-xs">
                              <Code className="h-3 w-3" />
                              GeoGebra命令 ({commandsWithLint.length})
                              {stats.hasErrors && (
                                <span className="inline-flex items-center" title={`${stats.errorCount} 个错误`}>
                                  <AlertCircle className="h-3 w-3 ml-1 text-red-500" />
                                </span>
                              )}
                              {!stats.hasErrors && stats.hasWarnings && (
                                <span className="inline-flex items-center" title={`${stats.warningCount} 个警告`}>
                                  <AlertTriangle className="h-3 w-3 ml-1 text-yellow-500" />
                                </span>
                              )}
                              {expandedMessages[messageId] ? (
                                <ChevronUp className="h-3 w-3 ml-1" />
                              ) : (
                                <ChevronDown className="h-3 w-3 ml-1" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 h-6 px-2 text-xs ml-2"
                            onClick={() => executeMessageCommands(messageId)}
                            disabled={stats.hasErrors}
                            title={stats.hasErrors ? "存在错误，无法执行" : "执行所有有效命令"}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            执行全部
                          </Button>
                          <CollapsibleContent>
                            <div className="mt-1 space-y-1 border rounded-md p-2 bg-background">
                              {commandsWithLint.map((cmdWithLint: CommandWithLint, i: number) => {
                                const hasErrors = cmdWithLint.errors.some((e) => e.severity === "error")
                                const hasWarnings = cmdWithLint.errors.some((e) => e.severity === "warning")

                                return (
                                  <div key={i} className="space-y-1">
                                    <div
                                      className={`text-xs p-1.5 rounded-md flex justify-between items-center ${
                                        hasErrors
                                          ? "bg-red-50 dark:bg-red-950"
                                          : hasWarnings
                                            ? "bg-yellow-50 dark:bg-yellow-950"
                                            : "bg-muted"
                                      }`}
                                    >
                                      <code className="text-xs flex-1">{cmdWithLint.command}</code>
                                      <div className="flex items-center gap-1">
                                        {hasErrors && <AlertCircle className="h-3 w-3 text-red-500" />}
                                        {!hasErrors && hasWarnings && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-5 w-5 p-0 ml-2"
                                          onClick={() => executeSingleCommand(cmdWithLint.command, hasErrors)}
                                          title={hasErrors ? "存在错误，无法执行" : "在GeoGebra中执行"}
                                          disabled={hasErrors}
                                        >
                                          <span className="sr-only">执行</span>▶
                                        </Button>
                                      </div>
                                    </div>
                                    {cmdWithLint.errors.length > 0 && (
                                      <div className="ml-4 text-xs space-y-0.5">
                                        {cmdWithLint.errors.map((error, errorIdx) => (
                                          <div
                                            key={errorIdx}
                                            className={`flex items-start gap-1 ${
                                              error.severity === "error"
                                                ? "text-red-600 dark:text-red-400"
                                                : error.severity === "warning"
                                                  ? "text-yellow-600 dark:text-yellow-400"
                                                  : "text-blue-600 dark:text-blue-400"
                                            }`}
                                          >
                                            {error.severity === "error" && <AlertCircle className="h-3 w-3 mt-0.5" />}
                                            {error.severity === "warning" && <AlertTriangle className="h-3 w-3 mt-0.5" />}
                                            {error.severity === "info" && <Info className="h-3 w-3 mt-0.5" />}
                                            <div className="flex-1">
                                              <div>{error.message}</div>
                                              {error.suggestions && error.suggestions.length > 0 && (
                                                <div className="text-muted-foreground mt-0.5">
                                                  💡 建议: {error.suggestions.join(", ")}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t p-4 shrink-0">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder="输入您的消息..."
            value={input}
            onChange={handleInputChange}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

