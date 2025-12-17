"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GalleryCard, type GalleryItem } from "@/components/gallery-card"
import { useTranslation, type Locale } from "@/lib/i18n"
import { Calculator, Upload, Search, Globe, Home, GraduationCap, BookOpen, User } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// 扩展 GalleryItem 类型以包含教育阶段和主题
interface ExtendedGalleryItem extends GalleryItem {
  education?: string
  topic?: string
}

export default function GalleryPage() {
  const [locale, setLocale] = useState<Locale>("zh-CN")
  const { t } = useTranslation(locale)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEducation, setSelectedEducation] = useState("all")
  const [selectedTopic, setSelectedTopic] = useState("all")
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Mock data - 实际应用中应该从 API 获取
  const [galleryItems, setGalleryItems] = useState<ExtendedGalleryItem[]>([
    {
      id: "1",
      title: "二次函数图像",
      description: "展示了二次函数的基本性质，包括顶点、对称轴和零点",
      author: "数学爱好者",
      category: t("gallery.filters.algebra"),
      education: "high",
      topic: "function",
      tags: ["抛物线", "函数", "代数"],
      views: 1234,
      likes: 89,
      uploadedAt: "2025-12-10T10:00:00Z",
      fileUrl: "/uploads/sample1.ggb",
    },
    {
      id: "2",
      title: "圆与切线",
      description: "演示了圆的切线性质和切点的几何关系",
      author: "几何大师",
      category: t("gallery.filters.geometry"),
      education: "middle",
      topic: "planeGeometry",
      tags: ["圆", "切线", "几何"],
      views: 856,
      likes: 67,
      uploadedAt: "2025-12-12T14:30:00Z",
      fileUrl: "/uploads/sample2.ggb",
    },
    {
      id: "3",
      title: "三角函数动画",
      description: "动态展示正弦和余弦函数的周期性和振幅变化",
      author: "动画制作者",
      category: t("gallery.filters.calculus"),
      education: "high",
      topic: "trigonometry",
      tags: ["三角函数", "动画", "周期"],
      views: 2341,
      likes: 156,
      uploadedAt: "2025-12-08T09:15:00Z",
      fileUrl: "/uploads/sample3.ggb",
    },
    {
      id: "4",
      title: "导数的几何意义",
      description: "通过动画展示导数作为切线斜率的几何意义",
      author: "微积分老师",
      category: t("gallery.filters.calculus"),
      education: "university",
      topic: "calculus",
      tags: ["导数", "切线", "极限"],
      views: 1567,
      likes: 123,
      uploadedAt: "2025-12-05T11:20:00Z",
      fileUrl: "/uploads/sample4.ggb",
    },
    {
      id: "5",
      title: "勾股定理证明",
      description: "使用几何方法证明勾股定理",
      author: "小学数学",
      category: t("gallery.filters.geometry"),
      education: "primary",
      topic: "planeGeometry",
      tags: ["勾股定理", "证明", "直角三角形"],
      views: 3245,
      likes: 234,
      uploadedAt: "2025-12-01T09:00:00Z",
      fileUrl: "/uploads/sample5.ggb",
    },
  ])

  const toggleLocale = () => {
    setLocale((prev) => (prev === "zh-CN" ? "en-US" : "zh-CN"))
  }

  // Filter and search logic - 支持多维度筛选
  const filteredItems = useMemo(() => {
    return galleryItems.filter((item) => {
      const matchesEducation =
        selectedEducation === "all" || item.education === selectedEducation
      const matchesTopic =
        selectedTopic === "all" || item.topic === selectedTopic
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      return matchesEducation && matchesTopic && matchesSearch
    })
  }, [galleryItems, selectedEducation, selectedTopic, searchQuery])

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUploading(true)

    // Simulate upload
    setTimeout(() => {
      setIsUploading(false)
      setIsUploadOpen(false)
      toast.success(t("gallery.upload.success"))
    }, 1500)
  }

  const handleLike = (id: string) => {
    console.log("Liked item:", id)
  }

  const handleView = (id: string) => {
    console.log("View item:", id)
    // TODO: Navigate to detail page or open viewer
  }

  const handleDownload = (id: string) => {
    const item = galleryItems.find((i) => i.id === id)
    if (item) {
      toast.success(
        locale === "zh-CN"
          ? `开始下载：${item.title}`
          : `Downloading: ${item.title}`
      )
      // TODO: Implement actual download logic
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">{t("gallery.title")}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <Home className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLocale}
                title={
                  locale === "zh-CN" ? "Switch to English" : "切换到中文"
                }
              >
                <Globe className="h-5 w-5" />
              </Button>
              {user ? (
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {user.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    {locale === "zh-CN" ? "登录" : "Login"}
                  </Button>
                </Link>
              )}
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    {t("gallery.uploadButton")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <form onSubmit={handleUpload}>
                    <DialogHeader>
                      <DialogTitle>{t("gallery.upload.title")}</DialogTitle>
                      <DialogDescription>
                        {t("gallery.description")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="file">
                          {t("gallery.upload.fileLabel")}
                        </Label>
                        <Input
                          id="file"
                          type="file"
                          accept=".ggb"
                          required
                          disabled={isUploading}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="title">
                          {t("gallery.upload.titleLabel")}
                        </Label>
                        <Input
                          id="title"
                          placeholder={t("gallery.upload.titleLabel")}
                          required
                          disabled={isUploading}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">
                          {t("gallery.upload.descriptionLabel")}
                        </Label>
                        <Textarea
                          id="description"
                          placeholder={t("gallery.upload.descriptionLabel")}
                          rows={3}
                          required
                          disabled={isUploading}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">
                          {t("gallery.upload.categoryLabel")}
                        </Label>
                        <Select required disabled={isUploading}>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("gallery.upload.categoryLabel")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="geometry">
                              {t("gallery.filters.geometry")}
                            </SelectItem>
                            <SelectItem value="algebra">
                              {t("gallery.filters.algebra")}
                            </SelectItem>
                            <SelectItem value="calculus">
                              {t("gallery.filters.calculus")}
                            </SelectItem>
                            <SelectItem value="statistics">
                              {t("gallery.filters.statistics")}
                            </SelectItem>
                            <SelectItem value="3d">
                              {t("gallery.filters.3d")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="tags">
                          {t("gallery.upload.tagsLabel")}
                        </Label>
                        <Input
                          id="tags"
                          placeholder={t("gallery.upload.tagsLabel")}
                          disabled={isUploading}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsUploadOpen(false)}
                        disabled={isUploading}
                      >
                        {t("gallery.upload.cancelButton")}
                      </Button>
                      <Button type="submit" disabled={isUploading}>
                        {isUploading
                          ? locale === "zh-CN"
                            ? "上传中..."
                            : "Uploading..."
                          : t("gallery.upload.submitButton")}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Description */}
        <div className="mb-8 text-center">
          <p className="text-lg text-muted-foreground">
            {t("gallery.description")}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("gallery.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Sidebar + Gallery Grid Layout */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-6 pr-4">
                {/* Education Level Filter */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{t("gallery.sidebar.education")}</h3>
                  </div>
                  <div className="space-y-2">
                    {["all", "primary", "middle", "high", "university"].map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedEducation(level)}
                        className={cn(
                          "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                          selectedEducation === level
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        {t(`gallery.education.${level}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic Filter */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{t("gallery.sidebar.topic")}</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      "all",
                      "function",
                      "analyticGeometry",
                      "planeGeometry",
                      "solidGeometry",
                      "algebra",
                      "calculus",
                      "statistics",
                      "trigonometry",
                      "sequence",
                    ].map((topic) => (
                      <button
                        key={topic}
                        onClick={() => setSelectedTopic(topic)}
                        className={cn(
                          "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                          selectedTopic === topic
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        {t(`gallery.topics.${topic}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Filters Display */}
                {(selectedEducation !== "all" || selectedTopic !== "all") && (
                  <div>
                    <div className="mb-3 text-sm font-semibold">
                      {locale === "zh-CN" ? "当前筛选" : "Active Filters"}
                    </div>
                    <div className="space-y-2">
                      {selectedEducation !== "all" && (
                        <Badge
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => setSelectedEducation("all")}
                        >
                          {t(`gallery.education.${selectedEducation}`)} ×
                        </Badge>
                      )}
                      {selectedTopic !== "all" && (
                        <Badge
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => setSelectedTopic("all")}
                        >
                          {t(`gallery.topics.${selectedTopic}`)} ×
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </aside>

          {/* Gallery Grid */}
          <div className="flex-1">
            {/* Mobile Filters */}
            <div className="mb-6 flex gap-2 lg:hidden">
              <Select value={selectedEducation} onValueChange={setSelectedEducation}>
                <SelectTrigger className="flex-1">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["all", "primary", "middle", "high", "university"].map((level) => (
                    <SelectItem key={level} value={level}>
                      {t(`gallery.education.${level}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="flex-1">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "all",
                    "function",
                    "analyticGeometry",
                    "planeGeometry",
                    "solidGeometry",
                    "algebra",
                    "calculus",
                    "statistics",
                    "trigonometry",
                    "sequence",
                  ].map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {t(`gallery.topics.${topic}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              {locale === "zh-CN"
                ? `找到 ${filteredItems.length} 个作品`
                : `Found ${filteredItems.length} work${filteredItems.length !== 1 ? "s" : ""}`}
            </div>

            {/* Gallery Cards */}
            {filteredItems.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map((item) => (
                  <GalleryCard
                    key={item.id}
                    item={item}
                    locale={locale}
                    onLike={handleLike}
                    onView={handleView}
                    onDownload={handleDownload}
                    translations={{
                      views: t("gallery.card.views"),
                      likes: t("gallery.card.likes"),
                      author: t("gallery.card.author"),
                      viewButton: t("gallery.card.viewButton"),
                      downloadButton: t("gallery.card.downloadButton"),
                      likeButton: t("gallery.card.likeButton"),
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-muted p-6">
                  <Calculator className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  {t("gallery.empty.title")}
                </h3>
                <p className="mb-6 text-muted-foreground">
                  {t("gallery.empty.description")}
                </p>
                <Button onClick={() => setIsUploadOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t("gallery.uploadButton")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
