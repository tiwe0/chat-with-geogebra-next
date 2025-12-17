import { NextRequest, NextResponse } from "next/server"
import { getGalleryItemById, incrementViews, addLike, removeLike, deleteGalleryItem, hasUserLiked } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"
import { del } from '@vercel/blob'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Fetch a single gallery item by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const itemId = parseInt(id)

    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, error: "Invalid item ID" },
        { status: 400 }
      )
    }

    const item = await getGalleryItemById(itemId)

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      )
    }

    // Increment view count
    await incrementViews(itemId)

    // Check if user has liked this item
    const user = await getUserFromRequest(request)
    let isLiked = false
    if (user) {
      isLiked = await hasUserLiked(user.userId, itemId)
    }

    // Transform to expected format
    const transformedItem = {
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
      views: item.views + 1, // Include the incremented view
      likes: item.likes,
      isLiked,
      uploadedAt: item.created_at.toISOString(),
      fileUrl: item.file_url,
      thumbnailUrl: item.thumbnail_url || "",
    }

    return NextResponse.json({
      success: true,
      data: transformedItem,
    })
  } catch (error) {
    console.error("Error fetching gallery item:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch item" },
      { status: 500 }
    )
  }
}

// PATCH - Update gallery item (like/unlike)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const itemId = parseInt(id)
    const body = await request.json()
    const { action } = body

    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, error: "Invalid item ID" },
        { status: 400 }
      )
    }

    // Verify user authentication
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if item exists
    const item = await getGalleryItemById(itemId)
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      )
    }

    switch (action) {
      case "like":
        await addLike(user.userId, itemId)
        break
      case "unlike":
        await removeLike(user.userId, itemId)
        break
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        )
    }

    // Fetch updated item
    const updatedItem = await getGalleryItemById(itemId)
    const isLiked = await hasUserLiked(user.userId, itemId)

    return NextResponse.json({
      success: true,
      data: {
        id: updatedItem!.id.toString(),
        likes: updatedItem!.likes,
        isLiked,
      },
    })
  } catch (error) {
    console.error("Error updating gallery item:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update item" },
      { status: 500 }
    )
  }
}

// DELETE - Delete gallery item
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const itemId = parseInt(id)

    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, error: "Invalid item ID" },
        { status: 400 }
      )
    }

    // Verify user authentication
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if item exists and user is the author
    const item = await getGalleryItemById(itemId)
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      )
    }

    if (item.author_id !== user.userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You can only delete your own items" },
        { status: 403 }
      )
    }

    // Delete file from Blob storage
    await del(item.file_blob_key)

    // Delete from database
    await deleteGalleryItem(itemId)

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting gallery item:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete item" },
      { status: 500 }
    )
  }
}
