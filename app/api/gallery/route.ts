import { NextRequest, NextResponse } from "next/server"
import { put } from '@vercel/blob'
import { getGalleryItems, createGalleryItem } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// GET - Fetch gallery items with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const education = searchParams.get("education")
    const topic = searchParams.get("topic")
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const items = await getGalleryItems({
      education: education || undefined,
      topic: topic || undefined,
      search: search || undefined,
      limit,
      offset,
    })

    // Transform to expected format
    const transformedItems = items.map((item) => ({
      id: item.id.toString(),
      title: item.title,
      description: item.description || "",
      author: item.author?.username || "Anonymous",
      authorId: item.author_id.toString(),
      authorAvatar: item.author?.avatar_url || "",
      category: item.category || "",
      education: item.education || "",
      topic: item.topic || "",
      tags: item.tags || [],
      views: item.views,
      likes: item.likes,
      uploadedAt: item.created_at.toISOString(),
      fileUrl: item.file_url,
      thumbnailUrl: item.thumbnail_url || "",
    }))

    return NextResponse.json({
      success: true,
      data: transformedItems,
      total: transformedItems.length,
    })
  } catch (error) {
    console.error("Error fetching gallery items:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch gallery items" },
      { status: 500 }
    )
  }
}

// POST - Upload new gallery item
export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const education = formData.get("education") as string
    const topic = formData.get("topic") as string
    const tags = (formData.get("tags") as string)?.split(",").map((t) => t.trim()) || []

    if (!file || !title) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (file and title)" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.ggb')) {
      return NextResponse.json(
        { success: false, error: "Only .ggb files are allowed" },
        { status: 400 }
      )
    }

    // Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    // Create gallery item in database
    const newItem = await createGalleryItem({
      title,
      description,
      author_id: user.userId,
      category,
      education,
      topic,
      tags,
      file_url: blob.url,
      file_blob_key: blob.pathname,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: newItem.id.toString(),
        title: newItem.title,
        description: newItem.description,
        author: user.username,
        authorId: user.userId.toString(),
        category: newItem.category,
        education: newItem.education,
        topic: newItem.topic,
        tags: newItem.tags,
        views: newItem.views,
        likes: newItem.likes,
        uploadedAt: newItem.created_at.toISOString(),
        fileUrl: newItem.file_url,
      },
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
