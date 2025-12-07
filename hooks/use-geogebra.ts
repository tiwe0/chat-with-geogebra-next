"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { logger } from "@/lib/logger"

export interface GeoGebraCommands {
  reset: () => void
  executeCommand: (cmd: string) => boolean
  executeCommands: (commands: string[]) => void
  setSize: (width: number, height: number) => void
  isReady: boolean
}

export function useGeoGebra(): GeoGebraCommands {
  const [isReady, setIsReady] = useState(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const checkTimerRef = useRef<NodeJS.Timeout | null>(null)
  const appletInitializedRef = useRef(false)
  const lastSizeRef = useRef({ width: 0, height: 0 })

  // 初始化GeoGebra
  useEffect(() => {
    // 防止重复加载脚本
    if (scriptRef.current || appletInitializedRef.current) return

    const script = document.createElement("script")
    scriptRef.current = script
    script.src = "https://www.geogebra.org/apps/deployggb.js"
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      logger.ggb("GeoGebra script 加载完成")
      if (typeof window.GGBApplet !== "undefined") {
        logger.ggb("GGBApplet 类可用，准备初始化")
        const ggbAppParams = {
          appName: "classic",
          width: "100%",
          height: "100%",
          showToolBar: true,
          showAlgebraInput: true,
          showMenuBar: true,
          enableLabelDrags: false,
          enableShiftDragZoom: true,
          enableRightClick: true,
          showResetIcon: true,
          useBrowserForJS: false,
          allowStyleBar: false,
          scaleContainerClass: "geogebra-container",
          preventFocus: false,
          language: "zh",
          appletOnLoad: () => {
            logger.ggb("GeoGebra applet 加载完成并初始化")
            window.ggbAppletReady = true
            appletInitializedRef.current = true
            setIsReady(true)
          },
        }

        // Desktop GeoGebra
        if (document.getElementById("geogebra-container")) {
          logger.ggb("找到geogebra-container，注入GeoGebra applet")
          const ggbApp = new window.GGBApplet(ggbAppParams, true)
          ggbApp.inject("geogebra-container")
          logger.ggb("GeoGebra applet 注入完成")
        } else {
          logger.warn("未找到geogebra-container元素")
        }
      } else {
        logger.error("GGBApplet 类不可用")
      }
    }

    const checkLoaded = () => {
      if (window.ggbApplet && typeof window.ggbApplet.setSize === "function") {
        logger.ggb("✅ GeoGebra 加载完毕！")
        appletInitializedRef.current = true
        setIsReady(true)
      } else if (!appletInitializedRef.current) {
        checkTimerRef.current = setTimeout(checkLoaded, 100) // 每 100 毫秒检测一次
      }
    }

    // 启动检查
    checkTimerRef.current = setTimeout(checkLoaded, 500)

    return () => {
      if (checkTimerRef.current) {
        clearTimeout(checkTimerRef.current)
      }
      // 不要在清理函数中移除脚本，这可能导致GeoGebra在组件重新渲染时被卸载
    }
  }, [])

  // 重置GeoGebra
  const reset = useCallback(() => {
    if (window.ggbApplet) {
      try {
        window.ggbApplet.reset()
        logger.ggb("GeoGebra重置成功")
        return true
      } catch (e) {
        logger.error("GeoGebra重置失败:", e)
        return false
      }
    }
    return false
  }, [])

  // 执行单个GeoGebra命令
  const executeCommand = useCallback((cmd: string): boolean => {
    if (window.ggbApplet) {
      try {
        window.ggbApplet.evalCommand(cmd)
        logger.ggb(`命令执行成功: "${cmd}"`)
        return true
      } catch (e) {
        logger.error(`执行GeoGebra命令失败: "${cmd}"`, e)
        return false
      }
    }
    logger.warn(`GeoGebra applet不可用，无法执行命令: "${cmd}"`)
    return false
  }, [])

  // 执行多个GeoGebra命令
  const executeCommands = useCallback(
    (commands: string[]) => {
      if (!window.ggbApplet || commands.length === 0) {
        logger.warn("GeoGebra applet不可用或没有命令，无法执行命令")
        return
      }

      logger.ggb(`准备执行${commands.length}个GeoGebra命令`)

      // 重置GeoGebra
      reset()

      // 执行所有命令
      commands.forEach((cmd, index) => {
        setTimeout(() => {
          executeCommand(cmd)
        }, index * 100) // 每条命令间隔100ms执行，避免执行过快
      })
    },
    [reset, executeCommand],
  )

  // 设置GeoGebra大小
  const setSize = useCallback((width: number, height: number) => {
    // 避免重复设置相同的尺寸
    if (lastSizeRef.current.width === width && lastSizeRef.current.height === height) {
      return false
    }

    if (window.ggbApplet && typeof window.ggbApplet.setSize === "function" && width > 0 && height > 0) {
      logger.ggb(`设置GeoGebra大小: ${width}x${height}`)
      window.ggbApplet.setSize(width, height)
      lastSizeRef.current = { width, height }
      return true
    }
    return false
  }, [])

  return {
    reset,
    executeCommand,
    executeCommands,
    setSize,
    isReady,
  }
}

