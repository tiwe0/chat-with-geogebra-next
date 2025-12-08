"use client"

import { useCallback } from "react"
import {
  RuleEngine,
  noUnknownCommand,
  correctArgTypes,
  LintResult,
  LintMessage,
  LintSeverity,
} from "@/lib/geogebra-lint-core"

export interface LintError {
  line: number
  column: number
  message: string
  severity: "error" | "warning" | "info"
  ruleId: string
  suggestions?: string[]
}

export function useGeoGebraLint() {
  // 创建 lint 引擎实例
  const createLintEngine = useCallback(() => {
    const engine = new RuleEngine({
      rules: {
        "no-unknown-command": "error",
        "correct-arg-types": "error",
      },
    })

    // 注册规则
    engine.registerRules([noUnknownCommand, correctArgTypes])

    return engine
  }, [])

  // 检查单个命令
  const lintCommand = useCallback(
    (command: string): LintError[] => {
      if (!command || command.trim() === "") {
        return []
      }

      const engine = createLintEngine()
      const result: LintResult = engine.lint(command)

      return result.messages.map((msg: LintMessage) => ({
        line: msg.loc.start.line,
        column: msg.loc.start.column,
        message: msg.message,
        severity: msg.severity as "error" | "warning" | "info",
        ruleId: msg.ruleId,
        suggestions: msg.suggestions,
      }))
    },
    [createLintEngine],
  )

  // 检查多个命令
  const lintCommands = useCallback(
    (commands: string[]): Record<string, LintError[]> => {
      const results: Record<string, LintError[]> = {}

      commands.forEach((command, index) => {
        const errors = lintCommand(command)
        if (errors.length > 0) {
          results[`command-${index}`] = errors
        }
      })

      return results
    },
    [lintCommand],
  )

  // 格式化 lint 结果为可读文本
  const formatLintErrors = useCallback((errors: LintError[]): string => {
    if (errors.length === 0) {
      return ""
    }

    return errors
      .map((error) => {
        const icon = error.severity === "error" ? "❌" : error.severity === "warning" ? "⚠️" : "ℹ️"
        let msg = `${icon} [${error.ruleId}] ${error.message}`
        if (error.suggestions && error.suggestions.length > 0) {
          msg += `\n   💡 建议: ${error.suggestions.join(", ")}`
        }
        return msg
      })
      .join("\n")
  }, [])

  // 检查命令并返回是否有错误
  const hasErrors = useCallback(
    (command: string): boolean => {
      const errors = lintCommand(command)
      return errors.some((e) => e.severity === "error")
    },
    [lintCommand],
  )

  // 获取命令的统计信息
  const getLintStats = useCallback((errors: LintError[]) => {
    const errorCount = errors.filter((e) => e.severity === "error").length
    const warningCount = errors.filter((e) => e.severity === "warning").length
    const infoCount = errors.filter((e) => e.severity === "info").length

    return {
      errorCount,
      warningCount,
      infoCount,
      total: errors.length,
      hasErrors: errorCount > 0,
      hasWarnings: warningCount > 0,
    }
  }, [])

  return {
    lintCommand,
    lintCommands,
    formatLintErrors,
    hasErrors,
    getLintStats,
  }
}
