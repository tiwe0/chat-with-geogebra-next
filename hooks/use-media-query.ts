"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  // 在服务器端渲染时默认为false
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // 确保在客户端执行
    if (typeof window !== "undefined") {
      // 创建媒体查询
      const media = window.matchMedia(query)

      // 设置初始值
      setMatches(media.matches)

      // 创建事件监听器
      const listener = () => setMatches(media.matches)

      // 添加事件监听
      media.addEventListener("change", listener)

      // 清理函数
      return () => media.removeEventListener("change", listener)
    }

    // 服务器端不做任何事情
    return undefined
  }, [query])

  return matches
}

