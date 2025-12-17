import { NextRequest, NextResponse } from "next/server"
import { findUserByEmail, verifyPassword, getUserStatistics } from "@/lib/db"
import { createToken } from "@/lib/auth"

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find user
    const user = await findUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Get user statistics
    const stats = await getUserStatistics(user.id)

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    })

    // Remove password from response
    const userResponse = {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      avatar: user.avatar_url || "",
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
      joinedDate: user.created_at.toISOString(),
      stats,
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    )
  }
}
