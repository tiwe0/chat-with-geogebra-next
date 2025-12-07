// 日志级别
type LogLevel = "debug" | "info" | "warn" | "error"

// 是否为生产环境
const isProduction = process.env.NODE_ENV === "production"

// 在生产环境中禁用的日志级别
const disabledInProduction: LogLevel[] = ["debug"]

/**
 * 统一的日志工具
 */
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isProduction && disabledInProduction.includes("debug")) return
    console.debug(`[DEBUG] ${message}`, ...args)
  },

  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args)
  },

  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args)
  },

  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args)
  },

  // 用于GeoGebra相关的日志
  ggb: (message: string, ...args: any[]) => {
    if (isProduction && disabledInProduction.includes("debug")) return
    console.debug(`[GGB] ${message}`, ...args)
  },

  // 用于API相关的日志
  api: (message: string, ...args: any[]) => {
    if (isProduction && disabledInProduction.includes("debug")) return
    console.debug(`[API] ${message}`, ...args)
  },
}

