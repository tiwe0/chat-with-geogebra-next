"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Info, Github, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppStore } from "@/lib/store"

export type ApiKeys = {
  openai?: string
  anthropic?: string
  deepseek?: string
}

export type ConfigSettings = {
  modelType: string
  apiKeys: ApiKeys
  systemPrompt: string
}

interface ConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
}

const MODEL_OPTIONS = [
  { value: "gpt-4o", label: "GPT-4o", provider: "openai" },
  { value: "gpt-4", label: "GPT-4", provider: "openai" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", provider: "openai" },
  { value: "claude-3-opus", label: "Claude 3 Opus", provider: "anthropic" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet", provider: "anthropic" },
  { value: "claude-3-haiku", label: "Claude 3 Haiku", provider: "anthropic" },
  { value: "deepseek-chat", label: "DeepSeek Chat", provider: "deepseek" },
  { value: "deepseek-coder", label: "DeepSeek Coder", provider: "deepseek" },
  { value: "llama-3", label: "Llama 3", provider: "openai" },
]

export function ConfigDialog({ open, onOpenChange, onSave }: ConfigDialogProps) {
  // 从store获取配置
  const config = useAppStore((state) => state.config)
  const updateConfig = useAppStore((state) => state.updateConfig)
  const updateApiKey = useAppStore((state) => state.updateApiKey)

  // 本地状态用于表单
  const [localConfig, setLocalConfig] = useState<ConfigSettings>(config)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("model")

  // 当对话框打开或配置更改时，更新本地状态
  useEffect(() => {
    setLocalConfig(config)
  }, [config, open])

  const handleSave = () => {
    console.debug("配置保存:", localConfig)

    // 获取当前选择的模型的提供商
    const selectedModel = MODEL_OPTIONS.find((model) => model.value === localConfig.modelType)
    const provider = selectedModel?.provider || "openai"

    console.debug("当前模型提供商:", { provider, modelType: localConfig.modelType })

    // 检查对应提供商的API密钥是否存在
    if (!localConfig.apiKeys[provider as keyof ApiKeys]) {
      console.debug("API密钥验证失败:", { provider, hasKey: false })
      setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API Key 是必填项`)
      setActiveTab("keys")
      return
    }

    console.debug("API密钥验证通过:", {
      provider,
      keyLength: localConfig.apiKeys[provider as keyof ApiKeys]?.length || 0,
    })

    // 更新store中的配置
    updateConfig(localConfig)

    // 显示保存成功提示
    setSaveSuccess(true)

    // 调用可选的onSave回调
    if (onSave) onSave()

    // 2秒后关闭对话框
    setTimeout(() => {
      setSaveSuccess(false)
      onOpenChange(false)
    }, 2000)

    setError(null)
  }

  const getCurrentProviderKey = () => {
    const selectedModel = MODEL_OPTIONS.find((model) => model.value === localConfig.modelType)
    return selectedModel?.provider || "openai"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>LLM 配置</DialogTitle>
          <DialogDescription>
            配置聊天应用的语言模型、API密钥和系统提示词。
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="model">模型</TabsTrigger>
            <TabsTrigger value="keys">API 密钥</TabsTrigger>
            <TabsTrigger value="prompt">提示词</TabsTrigger>
            <TabsTrigger value="about">关于</TabsTrigger>
          </TabsList>

          <TabsContent value="model" className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                模型
              </Label>
              <div className="col-span-3">
                <Select
                  value={localConfig.modelType}
                  onValueChange={(value) =>
                    setLocalConfig({ ...localConfig, modelType: value })
                  }
                >
                  <SelectTrigger id="model">
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              当前选择的模型需要{" "}
              <span className="font-medium">
                {getCurrentProviderKey().toUpperCase()}
              </span>{" "}
              API 密钥
            </div>
          </TabsContent>

          <TabsContent value="keys" className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="openaiKey" className="text-right">
                OpenAI
              </Label>
              <div className="col-span-3">
                <Input
                  id="openaiKey"
                  type="password"
                  value={localConfig.apiKeys.openai || ""}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      apiKeys: {
                        ...localConfig.apiKeys,
                        openai: e.target.value,
                      },
                    })
                  }
                  placeholder="输入 OpenAI API 密钥"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="anthropicKey" className="text-right">
                Anthropic
              </Label>
              <div className="col-span-3">
                <Input
                  id="anthropicKey"
                  type="password"
                  value={localConfig.apiKeys.anthropic || ""}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      apiKeys: {
                        ...localConfig.apiKeys,
                        anthropic: e.target.value,
                      },
                    })
                  }
                  placeholder="输入 Anthropic API 密钥"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deepseekKey" className="text-right">
                DeepSeek
              </Label>
              <div className="col-span-3">
                <Input
                  id="deepseekKey"
                  type="password"
                  value={localConfig.apiKeys.deepseek || ""}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      apiKeys: {
                        ...localConfig.apiKeys,
                        deepseek: e.target.value,
                      },
                    })
                  }
                  placeholder="输入 DeepSeek API 密钥"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="systemPrompt" className="text-right pt-2">
                系统提示词
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="systemPrompt"
                  value={localConfig.systemPrompt}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      systemPrompt: e.target.value,
                    })
                  }
                  placeholder="输入系统提示词，定义AI助手的行为和知识范围"
                  className="min-h-[150px]"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Info className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">版本信息</h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">名称:</span>
                  <span className="col-span-2 font-medium">
                    Chat with GeoGebra
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">版本:</span>
                  <span className="col-span-2 font-medium">v0.2.4</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">AI SDK:</span>
                  <span className="col-span-2 font-medium">
                    Vercel AI SDK 5.0
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">描述:</span>
                  <span className="col-span-2">
                    结合 AI 和 GeoGebra 的数学可视化助手
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <h4 className="font-medium text-sm mb-2">功能特点</h4>
                <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                  <li>完全免费 </li>
                  <li>支持多种 LLM 模型（GPT、Claude、DeepSeek）</li>
                  <li>智能提取并执行 GeoGebra 命令</li>
                  <li>实时命令语法检查与 Lint 提示</li>
                  <li>社区（WORKING）</li>
                </ul>
              </div>

              <div className="pt-4 border-t space-y-2">
                <h4 className="font-medium text-sm mb-2">仓库</h4>
                <a
                  href="https://github.com/tiwe0/chat-with-geogebra-next"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Github className="h-4 w-4" />
                  GitHub 仓库（NEXT端）
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://github.com/tiwe0/chat-with-geogebra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Github className="h-4 w-4" />
                  GitHub 仓库（桌面端）
                  <ExternalLink className="h-3 w-3" />
                </a>
                <div className="text-xs text-muted-foreground pt-2">
                  © 2025 Chat with GeoGebra. MIT License.
                </div>
                <div className="text-xs text-muted-foreground pt-2">
                  MADE WITH ❤️ BY Ivory.
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <h4 className="font-medium text-sm mb-2">☕ 请开发者喝杯咖啡</h4>
                <p className="text-xs text-muted-foreground">
                  如果这个项目对你有帮助，可以请开发者喝杯咖啡 ❤️
                </p>
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="font-medium">支付宝：</span>
                    <span className="text-muted-foreground ml-1">扫描二维码支持</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">微信支付：</span>
                    <span className="text-muted-foreground ml-1">扫描二维码支持</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">GitHub Sponsors：</span>
                    <a
                      href="https://github.com/sponsors/tiwe0"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline ml-1"
                    >
                      成为赞助者
                    </a>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic pt-2">
                  💡 你的支持是项目持续更新的动力！
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {saveSuccess && (
          <div className="p-2 bg-green-100 text-green-800 rounded-md text-center">
            设置已成功保存
          </div>
        )}
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            保存设置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

