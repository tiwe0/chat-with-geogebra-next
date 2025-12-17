"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation, type Locale } from "@/lib/i18n"
import {
  Calculator,
  Globe,
  Home,
  MapPin,
  Link2,
  Calendar,
  Edit,
  Upload,
  Eye,
  Heart,
  Users,
  LogOut,
} from "lucide-react"
import { toast } from "sonner"
import { GalleryCard } from "@/components/gallery-card"
import type { GalleryItem } from "@/components/gallery-card"

interface ExtendedGalleryItem extends GalleryItem {
  education?: string
  topic?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [locale, setLocale] = useState<Locale>("zh-CN")
  const { t } = useTranslation(locale)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userWorks, setUserWorks] = useState<ExtendedGalleryItem[]>([])
  const [likedWorks, setLikedWorks] = useState<ExtendedGalleryItem[]>([])

  // Form state
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")

  const toggleLocale = () => {
    setLocale((prev) => (prev === "zh-CN" ? "en-US" : "zh-CN"))
  }

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(storedUser)
    setUser(userData)
    setBio(userData.bio || "")
    setLocation(userData.location || "")
    setWebsite(userData.website || "")

    // Mock user works - 实际应用中应该从 API 获取
    const mockWorks: ExtendedGalleryItem[] = [
      {
        id: "1",
        title: "二次函数图像",
        description: "展示了二次函数的基本性质",
        author: userData.username,
        category: "代数",
        education: "high",
        topic: "function",
        tags: ["抛物线", "函数"],
        views: 1234,
        likes: 89,
        uploadedAt: "2025-12-10T10:00:00Z",
        fileUrl: "/uploads/sample1.ggb",
      },
    ]

    const mockLiked: ExtendedGalleryItem[] = [
      {
        id: "3",
        title: "三角函数动画",
        description: "动态展示正弦和余弦函数",
        author: "其他用户",
        category: "微积分",
        education: "high",
        topic: "trigonometry",
        tags: ["三角函数", "动画"],
        views: 2341,
        likes: 156,
        uploadedAt: "2025-12-08T09:15:00Z",
        fileUrl: "/uploads/sample3.ggb",
      },
    ]

    setUserWorks(mockWorks)
    setLikedWorks(mockLiked)
  }, [router])

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      bio,
      location,
      website,
    }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
    setIsEditing(false)
    toast.success(t("profile.updateSuccess"))
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    toast.success(
      locale === "zh-CN" ? "已退出登录" : "Logged out successfully"
    )
    router.push("/")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return locale === "zh-CN"
      ? date.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })
      : date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
  }

  if (!user) {
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

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Chat with GeoGebra</span>
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
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("auth.logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Sidebar - Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-4 text-2xl font-bold">{user.username}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>

                  {!isEditing && (
                    <>
                      {bio && (
                        <p className="mt-4 text-sm text-muted-foreground">{bio}</p>
                      )}

                      <div className="mt-4 w-full space-y-2">
                        {location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{location}</span>
                          </div>
                        )}
                        {website && (
                          <div className="flex items-center gap-2 text-sm">
                            <Link2 className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {website}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {t("profile.joinedDate")}{" "}
                            {formatDate("2025-01-01T00:00:00Z")}
                          </span>
                        </div>
                      </div>

                      <Button
                        className="mt-6 w-full"
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        {t("profile.editProfile")}
                      </Button>
                    </>
                  )}

                  {isEditing && (
                    <div className="mt-6 w-full space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bio">{t("profile.bio")}</Label>
                        <Textarea
                          id="bio"
                          placeholder={t("profile.bioPlaceholder")}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">{t("profile.location")}</Label>
                        <Input
                          id="location"
                          placeholder={t("profile.locationPlaceholder")}
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">{t("profile.website")}</Label>
                        <Input
                          id="website"
                          type="url"
                          placeholder={t("profile.websitePlaceholder")}
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={handleSaveProfile}
                        >
                          {t("profile.saveChanges")}
                        </Button>
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          {t("profile.cancel")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Statistics */}
                <div>
                  <h3 className="mb-4 font-semibold">
                    {t("profile.statistics")}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Upload className="h-4 w-4" />
                        <span>{t("profile.totalWorks")}</span>
                      </div>
                      <span className="font-medium">{userWorks.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{t("profile.totalViews")}</span>
                      </div>
                      <span className="font-medium">
                        {userWorks.reduce((sum, work) => sum + work.views, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        <span>{t("profile.totalLikes")}</span>
                      </div>
                      <span className="font-medium">
                        {userWorks.reduce((sum, work) => sum + work.likes, 0)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{t("profile.followers")}</span>
                      </div>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{t("profile.following")}</span>
                      </div>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Works and Likes */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="works" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="works">{t("profile.myWorks")}</TabsTrigger>
                <TabsTrigger value="likes">{t("profile.myLikes")}</TabsTrigger>
              </TabsList>

              {/* My Works Tab */}
              <TabsContent value="works" className="mt-6">
                {userWorks.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {userWorks.map((work) => (
                      <GalleryCard
                        key={work.id}
                        item={work}
                        locale={locale}
                        onLike={() => {}}
                        onView={() => router.push(`/gallery/${work.id}`)}
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
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="mb-4 rounded-full bg-muted p-6">
                        <Calculator className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">
                        {t("profile.noWorks")}
                      </h3>
                      <p className="mb-6 text-muted-foreground">
                        {t("profile.noWorksDescription")}
                      </p>
                      <Link href="/gallery">
                        <Button>
                          <Upload className="mr-2 h-4 w-4" />
                          {t("gallery.uploadButton")}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* My Likes Tab */}
              <TabsContent value="likes" className="mt-6">
                {likedWorks.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {likedWorks.map((work) => (
                      <GalleryCard
                        key={work.id}
                        item={work}
                        locale={locale}
                        onLike={() => {}}
                        onView={() => router.push(`/gallery/${work.id}`)}
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
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="mb-4 rounded-full bg-muted p-6">
                        <Heart className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">
                        {t("profile.noLikes")}
                      </h3>
                      <p className="mb-6 text-muted-foreground">
                        {t("profile.noLikesDescription")}
                      </p>
                      <Link href="/gallery">
                        <Button>{t("gallery.title")}</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
