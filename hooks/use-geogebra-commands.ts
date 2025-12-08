"use client"

import { useCallback } from "react"
import { useGeoGebraLint, type LintError } from "./use-geogebra-lint"

export interface CommandWithLint {
  command: string
  index: number
  errors: LintError[]
}

export function useGeoGebraCommands() {
  const { lintCommand, lintCommands } = useGeoGebraLint()

  // 从消息内容中提取GeoGebra命令
  const extractCommands = useCallback((content: string): string[] => {
    if (!content) return []

    const commands: string[] = []

    // 匹配形如 `ggb:命令` 的内容
    const ggbRegex = /`ggb:([^`]+)`/g
    let match
    while ((match = ggbRegex.exec(content)) !== null) {
      commands.push(match[1].trim())
    }

    // 匹配代码块中的GeoGebra命令
    const codeBlockRegex = /```geogebra\n([\s\S]*?)```/g
    let codeMatch
    while ((codeMatch = codeBlockRegex.exec(content)) !== null) {
      const blockCommands = codeMatch[1].split("\n").filter((line) => line.trim() !== "")
      commands.push(...blockCommands)
    }

    return commands
  }, [])

  // 从消息数组中提取最新助手消息的命令
  const extractLatestCommands = useCallback(
    (messages: any[]): string[] => {
      if (!messages || messages.length === 0) return []

      // 查找最新的助手消息
      const latestAssistantMessage = [...messages].reverse().find((msg) => msg.role === "assistant")
      if (!latestAssistantMessage || !latestAssistantMessage.content) return []

      return extractCommands(latestAssistantMessage.content)
    },
    [extractCommands],
  )

  // 为所有消息提取命令
  const extractAllMessagesCommands = useCallback(
    (messages: any[]): Record<string, string[]> => {
      if (!messages || messages.length === 0) return {}

      const result: Record<string, string[]> = {}

      messages.forEach((message, index) => {
        if (message.role === "assistant" && message.content) {
          const id = message.id || `msg-${index}`
          result[id] = extractCommands(message.content)
        }
      })

      return result
    },
    [extractCommands],
  )

  // 提取命令并进行 lint 检查
  const extractCommandsWithLint = useCallback(
    (content: string): CommandWithLint[] => {
      const commands = extractCommands(content)
      return commands.map((command, index) => ({
        command,
        index,
        errors: lintCommand(command),
      }))
    },
    [extractCommands, lintCommand],
  )

  // 为所有消息提取命令并进行 lint 检查
  const extractAllMessagesCommandsWithLint = useCallback(
    (messages: any[]): Record<string, CommandWithLint[]> => {
      if (!messages || messages.length === 0) return {}

      const result: Record<string, CommandWithLint[]> = {}

      messages.forEach((message, index) => {
        if (message.role === "assistant" && message.content) {
          const id = message.id || `msg-${index}`
          result[id] = extractCommandsWithLint(message.content)
        }
      })

      return result
    },
    [extractCommandsWithLint],
  )

  return {
    extractCommands,
    extractLatestCommands,
    extractAllMessagesCommands,
    extractCommandsWithLint,
    extractAllMessagesCommandsWithLint,
    lintCommand,
    lintCommands,
  }
}

