import { NextRequest, NextResponse } from "next/server"
import { createUser, findUserByEmail, findUserByUsername, getUserStatistics } from "@/lib/db"
import { createToken } from "@/lib/auth"

// POST - Sign up
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username } = body

    if (!email || !password || !username) {
      return NextResponse.json(
        { success: false, error: "Email, password, and username are required" },
        { status: 400 }
      )
    }

    // Check if user already exists by email
    const existingUserByEmail = await findUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 409 }
      )
    }

    // Check if username already exists
    const existingUserByUsername = await findUserByUsername(username)
    if (existingUserByUsername) {
      return NextResponse.json(
        { success: false, error: "Username already exists" },
        { status: 409 }
      )
    }

    // Create new user (password will be hashed in createUser function)
    const newUser = await createUser({
      email,
      password,
      username,
    })

    // Get user statistics (should be all zeros for new user)
    const stats = await getUserStatistics(newUser.id)

    // Create JWT token
    const token = await createToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
    })

    // Prepare user response
    const userResponse = {
      id: newUser.id.toString(),
      email: newUser.email,
      username: newUser.username,
      avatar: newUser.avatar_url || "",
      bio: newUser.bio || "",
      location: newUser.location || "",
      website: newUser.website || "",
      joinedDate: newUser.created_at.toISOString(),
      stats,
    }

    return NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
      message: "Sign up successful",
    })
  } catch (error) {
    console.error("Sign up error:", error)
    return NextResponse.json(
      { success: false, error: "Sign up failed" },
      { status: 500 }
    )
  }
}
