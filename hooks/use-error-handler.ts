"use client"

import { useState, useCallback } from "react"
import { logger } from "@/lib/logger"

export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((err: unknown, fallbackMessage = "发生错误，请重试") => {
    logger.error("错误处理:", err)

    if (typeof err === "string") {
      setError(err)
    } else if (err instanceof Error) {
      setError(err.message || fallbackMessage)
    } else if (typeof err === "object" && err !== null && "message" in err) {
      setError((err as { message: string }).message || fallbackMessage)
    } else {
      setError(fallbackMessage)
    }

    return err
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const setTemporaryError = useCallback((message: string, duration = 3000) => {
    logger.info(`临时错误消息: ${message}, 持续时间: ${duration}ms`)
    setError(message)
    setTimeout(() => {
      setError(null)
    }, duration)
  }, [])

  return {
    error,
    setError,
    handleError,
    clearError,
    setTemporaryError,
  }
}

