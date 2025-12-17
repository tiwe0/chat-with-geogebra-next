"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useTranslation, type Locale } from "@/lib/i18n"
import {
  ArrowLeft,
  Calendar,
  Download,
  Eye,
  GraduationCap,
  Heart,
  Share2,
  User,
  BookOpen,
  Tag,
  Globe,
  Home,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { GalleryCard } from "@/components/gallery-card"
import type { GalleryItem } from "@/components/gallery-card"

interface ExtendedGalleryItem extends GalleryItem {
  education?: string
  topic?: string
}

export default function GalleryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [locale, setLocale] = useState<Locale>("zh-CN")
  const { t } = useTranslation(locale)
  const [item, setItem] = useState<ExtendedGalleryItem | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [relatedItems, setRelatedItems] = useState<ExtendedGalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const toggleLocale = () => {
    setLocale((prev) => (prev === "zh-CN" ? "en-US" : "zh-CN"))
  }

  useEffect(() => {
    // Mock fetch data - 实际应用中应该从 API 获取
    const mockData: ExtendedGalleryItem[] = [
      {
        id: "1",
        title: "二次函数图像",
        description:
          "这是一个展示二次函数基本性质的交互式 GeoGebra 作品。通过拖动点可以改变抛物线的形状，实时观察顶点、对称轴和零点的变化。适合高中学生学习二次函数的性质和图像特征。",
        author: "数学爱好者",
        category: "代数",
        education: "high",
        topic: "function",
        tags: ["抛物线", "函数", "代数", "交互式", "二次函数"],
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
        category: "几何",
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
        category: "微积分",
        education: "high",
        topic: "trigonometry",
        tags: ["三角函数", "动画", "周期"],
        views: 2341,
        likes: 156,
        uploadedAt: "2025-12-08T09:15:00Z",
        fileUrl: "/uploads/sample3.ggb",
      },
    ]

    const foundItem = mockData.find((i) => i.id === params.id)
    
    if (foundItem) {
      setItem(foundItem)
      setLikeCount(foundItem.likes)
      
      // Get related items (same education or topic)
      const related = mockData
        .filter(
          (i) =>
            i.id !== foundItem.id &&
            (i.education === foundItem.education || i.topic === foundItem.topic)
        )
        .slice(0, 3)
      setRelatedItems(related)
    }
    
    setIsLoading(false)
  }, [params.id])

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    toast.success(
      isLiked
        ? locale === "zh-CN"
          ? "已取消点赞"
          : "Unliked"
        : locale === "zh-CN"
        ? "已点赞"
        : "Liked"
    )
  }

  const handleDownload = () => {
    if (item) {
      toast.success(
        locale === "zh-CN"
          ? `开始下载：${item.title}`
          : `Downloading: ${item.title}`
      )
      // TODO: Implement actual download
    }
  }

  const handleShare = () => {
    if (navigator.share && item) {
      navigator
        .share({
          title: item.title,
          text: item.description,
          url: window.location.href,
        })
        .catch(() => {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(window.location.href)
          toast.success(
            locale === "zh-CN" ? "链接已复制到剪贴板" : "Link copied to clipboard"
          )
        })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success(
        locale === "zh-CN" ? "链接已复制到剪贴板" : "Link copied to clipboard"
      )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return locale === "zh-CN"
      ? date.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">
            {locale === "zh-CN" ? "加载中..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-muted">
        <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/gallery">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("gallery.detail.backToGallery")}
                </Button>
              </Link>
            </div>
          </div>
        </header>
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="mb-4 inline-block rounded-full bg-muted p-6">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">{t("gallery.detail.notFound")}</h2>
            <p className="mb-6 text-muted-foreground">
              {t("gallery.detail.notFoundDescription")}
            </p>
            <Link href="/gallery">
              <Button>{t("gallery.detail.backToGallery")}</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/gallery">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("gallery.detail.backToGallery")}
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <Home className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleLocale}>
                <Globe className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Title and Actions */}
            <div className="mb-6">
              <h1 className="mb-4 text-3xl font-bold">{item.title}</h1>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleLike} variant={isLiked ? "default" : "outline"}>
                  <Heart
                    className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                  />
                  {t("gallery.detail.likeWork")} ({likeCount})
                </Button>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  {t("gallery.detail.downloadFile")}
                </Button>
                <Button onClick={handleShare} variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  {t("gallery.detail.shareWork")}
                </Button>
              </div>
            </div>

            {/* Preview Area */}
            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <svg
                        className="mx-auto mb-4 h-24 w-24 text-muted-foreground/30"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                        />
                      </svg>
                      <p className="text-sm text-muted-foreground">
                        {t("gallery.detail.noPreview")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t("gallery.detail.description")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    {t("gallery.detail.tags")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("gallery.detail.author")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{item.author}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("gallery.detail.statistics")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{t("gallery.detail.views")}</span>
                  </div>
                  <span className="font-medium">{item.views.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span>{t("gallery.detail.likes")}</span>
                  </div>
                  <span className="font-medium">{likeCount.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{t("gallery.detail.uploadedAt")}</span>
                  </div>
                  <span className="text-sm">{formatDate(item.uploadedAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Category Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("gallery.detail.overview")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.education && (
                  <>
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <GraduationCap className="h-4 w-4" />
                        <span>{t("gallery.detail.education")}</span>
                      </div>
                      <Badge>{t(`gallery.education.${item.education}`)}</Badge>
                    </div>
                    <Separator />
                  </>
                )}
                {item.topic && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{t("gallery.detail.topic")}</span>
                    </div>
                    <Badge>{t(`gallery.topics.${item.topic}`)}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Works */}
        {relatedItems.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold">
              {t("gallery.detail.relatedWorks")}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedItems.map((relatedItem) => (
                <GalleryCard
                  key={relatedItem.id}
                  item={relatedItem}
                  locale={locale}
                  onLike={() => {}}
                  onView={() => router.push(`/gallery/${relatedItem.id}`)}
                  onDownload={() => {}}
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
          </div>
        )}
      </main>
    </div>
  )
}
