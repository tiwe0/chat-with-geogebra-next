"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Eye, Heart, Download, User } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GalleryItem {
  id: string
  title: string
  description: string
  author: string
  authorAvatar?: string
  category: string
  tags: string[]
  views: number
  likes: number
  uploadedAt: string
  thumbnailUrl?: string
  fileUrl: string
}

interface GalleryCardProps {
  item: GalleryItem
  locale: "zh-CN" | "en-US"
  onLike?: (id: string) => void
  onView?: (id: string) => void
  onDownload?: (id: string) => void
  translations: {
    views: string
    likes: string
    author: string
    viewButton: string
    downloadButton: string
    likeButton: string
  }
}

export function GalleryCard({
  item,
  locale,
  onLike,
  onView,
  onDownload,
  translations,
}: GalleryCardProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(item.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    onLike?.(item.id)
  }

  const handleView = () => {
    // Navigate to detail page
    router.push(`/gallery/${item.id}`)
    onView?.(item.id)
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDownload?.(item.id)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return locale === "zh-CN"
      ? date.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
  }

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={handleView}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <svg
              className="h-20 w-20 text-muted-foreground/30"
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
          </div>
        )}
        {/* Category Badge */}
        <Badge className="absolute right-2 top-2 bg-primary/90 backdrop-blur-sm">
          {item.category}
        </Badge>
      </div>

      <CardHeader className="space-y-2">
        {/* Title */}
        <h3 className="line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary">
          {item.title}
        </h3>

        {/* Description */}
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Author */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            {item.authorAvatar ? (
              <img src={item.authorAvatar} alt={item.author} />
            ) : (
              <AvatarFallback className="text-xs">
                <User className="h-3 w-3" />
              </AvatarFallback>
            )}
          </Avatar>
          <span className="text-sm text-muted-foreground">{item.author}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{item.views.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart
              className={cn(
                "h-4 w-4",
                isLiked && "fill-red-500 text-red-500"
              )}
            />
            <span>{likeCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Upload Date */}
        <p className="text-xs text-muted-foreground">
          {formatDate(item.uploadedAt)}
        </p>
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation()
            handleLike()
          }}
        >
          <Heart
            className={cn("mr-1.5 h-4 w-4", isLiked && "fill-red-500 text-red-500")}
          />
          {translations.likeButton}
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={handleDownload}
        >
          <Download className="mr-1.5 h-4 w-4" />
          {translations.downloadButton}
        </Button>
      </CardFooter>
    </Card>
  )
}
