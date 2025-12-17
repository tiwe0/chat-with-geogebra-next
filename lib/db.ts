import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// User types
export interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  avatar_url?: string;
}

export interface UpdateUserData {
  username?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
}

// Gallery types
export interface GalleryItem {
  id: number;
  title: string;
  description: string | null;
  author_id: number;
  category: string | null;
  education: string | null;
  topic: string | null;
  tags: string[] | null;
  views: number;
  likes: number;
  file_url: string;
  file_blob_key: string;
  thumbnail_url: string | null;
  created_at: Date;
  updated_at: Date;
  author?: Pick<User, 'id' | 'username' | 'avatar_url'>;
}

export interface CreateGalleryItemData {
  title: string;
  description?: string;
  author_id: number;
  category?: string;
  education?: string;
  topic?: string;
  tags?: string[];
  file_url: string;
  file_blob_key: string;
  thumbnail_url?: string;
}

export interface UpdateGalleryItemData {
  title?: string;
  description?: string;
  category?: string;
  education?: string;
  topic?: string;
  tags?: string[];
}

// ===== User Functions =====

/**
 * Create a new user
 */
export async function createUser(data: CreateUserData): Promise<User> {
  const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const result = await sql<User>`
    INSERT INTO users (email, username, password_hash, avatar_url)
    VALUES (${data.email}, ${data.username}, ${password_hash}, ${data.avatar_url || null})
    RETURNING *
  `;

  return result.rows[0];
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await sql<User>`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;

  return result.rows[0] || null;
}

/**
 * Find user by username
 */
export async function findUserByUsername(username: string): Promise<User | null> {
  const result = await sql<User>`
    SELECT * FROM users WHERE username = ${username} LIMIT 1
  `;

  return result.rows[0] || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: number): Promise<User | null> {
  const result = await sql<User>`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `;

  return result.rows[0] || null;
}

/**
 * Verify user password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Update user profile
 */
export async function updateUser(id: number, data: UpdateUserData): Promise<User> {
  const setClauses: string[] = [];
  
  if (data.username !== undefined) setClauses.push(`username = '${data.username}'`);
  if (data.avatar_url !== undefined) setClauses.push(`avatar_url = '${data.avatar_url}'`);
  if (data.bio !== undefined) setClauses.push(`bio = '${data.bio}'`);
  if (data.location !== undefined) setClauses.push(`location = '${data.location}'`);
  if (data.website !== undefined) setClauses.push(`website = '${data.website}'`);

  const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ${id} RETURNING *`;
  const result = await sql.query<User>(query);

  return result.rows[0];
}

// ===== Gallery Functions =====

/**
 * Create a new gallery item
 */
export async function createGalleryItem(data: CreateGalleryItemData): Promise<GalleryItem> {
  const result = await sql<GalleryItem>`
    INSERT INTO gallery_items (
      title, description, author_id, category, education, topic, tags,
      file_url, file_blob_key, thumbnail_url
    )
    VALUES (
      ${data.title}, ${data.description || null}, ${data.author_id},
      ${data.category || null}, ${data.education || null}, ${data.topic || null},
      ${JSON.stringify(data.tags || [])}, ${data.file_url}, ${data.file_blob_key}, ${data.thumbnail_url || null}
    )
    RETURNING *
  `;

  return result.rows[0];
}

/**
 * Get gallery items with filters and pagination
 */
export async function getGalleryItems(options: {
  education?: string;
  topic?: string;
  search?: string;
  authorId?: number;
  limit?: number;
  offset?: number;
}): Promise<GalleryItem[]> {
  const { education, topic, search, authorId, limit = 20, offset = 0 } = options;

  let whereConditions: string[] = [];
  let params: any[] = [];
  let paramIndex = 1;

  if (education) {
    whereConditions.push(`gi.education = $${paramIndex++}`);
    params.push(education);
  }
  if (topic) {
    whereConditions.push(`gi.topic = $${paramIndex++}`);
    params.push(topic);
  }
  if (search) {
    whereConditions.push(`(gi.title ILIKE $${paramIndex} OR gi.description ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }
  if (authorId) {
    whereConditions.push(`gi.author_id = $${paramIndex++}`);
    params.push(authorId);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  params.push(limit, offset);

  const query = `
    SELECT 
      gi.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'avatar_url', u.avatar_url
      ) as author
    FROM gallery_items gi
    LEFT JOIN users u ON gi.author_id = u.id
    ${whereClause}
    ORDER BY gi.created_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex}
  `;

  const result = await sql.query(query, params);
  return result.rows as GalleryItem[];
}

/**
 * Get gallery item by ID
 */
export async function getGalleryItemById(id: number): Promise<GalleryItem | null> {
  const result = await sql<GalleryItem>`
    SELECT 
      gi.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'avatar_url', u.avatar_url
      ) as author
    FROM gallery_items gi
    LEFT JOIN users u ON gi.author_id = u.id
    WHERE gi.id = ${id}
    LIMIT 1
  `;

  if (result.rows.length === 0) return null;
  return result.rows[0];
}

/**
 * Update gallery item
 */
export async function updateGalleryItem(id: number, data: UpdateGalleryItemData): Promise<GalleryItem> {
  const setClauses: string[] = [];

  if (data.title !== undefined) setClauses.push(`title = '${data.title}'`);
  if (data.description !== undefined) setClauses.push(`description = '${data.description}'`);
  if (data.category !== undefined) setClauses.push(`category = '${data.category}'`);
  if (data.education !== undefined) setClauses.push(`education = '${data.education}'`);
  if (data.topic !== undefined) setClauses.push(`topic = '${data.topic}'`);
  if (data.tags !== undefined) setClauses.push(`tags = '${JSON.stringify(data.tags)}'`);

  const query = `UPDATE gallery_items SET ${setClauses.join(', ')} WHERE id = ${id} RETURNING *`;
  const result = await sql.query<GalleryItem>(query);

  return result.rows[0];
}

/**
 * Delete gallery item
 */
export async function deleteGalleryItem(id: number): Promise<void> {
  await sql`DELETE FROM gallery_items WHERE id = ${id}`;
}

/**
 * Increment view count
 */
export async function incrementViews(id: number): Promise<void> {
  await sql`UPDATE gallery_items SET views = views + 1 WHERE id = ${id}`;
}

// ===== Like Functions =====

/**
 * Add a like
 */
export async function addLike(userId: number, galleryItemId: number): Promise<void> {
  try {
    await sql`
      INSERT INTO user_likes (user_id, gallery_item_id)
      VALUES (${userId}, ${galleryItemId})
      ON CONFLICT (user_id, gallery_item_id) DO NOTHING
    `;

    await sql`
      UPDATE gallery_items SET likes = likes + 1
      WHERE id = ${galleryItemId}
    `;
  } catch (error) {
    console.error('Error adding like:', error);
    throw error;
  }
}

/**
 * Remove a like
 */
export async function removeLike(userId: number, galleryItemId: number): Promise<void> {
  const result = await sql`
    DELETE FROM user_likes
    WHERE user_id = ${userId} AND gallery_item_id = ${galleryItemId}
  `;

  if (result.rowCount && result.rowCount > 0) {
    await sql`
      UPDATE gallery_items SET likes = GREATEST(likes - 1, 0)
      WHERE id = ${galleryItemId}
    `;
  }
}

/**
 * Check if user has liked an item
 */
export async function hasUserLiked(userId: number, galleryItemId: number): Promise<boolean> {
  const result = await sql`
    SELECT 1 FROM user_likes
    WHERE user_id = ${userId} AND gallery_item_id = ${galleryItemId}
    LIMIT 1
  `;

  return result.rows.length > 0;
}

/**
 * Get user's liked items
 */
export async function getUserLikedItems(userId: number, limit = 20, offset = 0): Promise<GalleryItem[]> {
  const result = await sql`
    SELECT 
      gi.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'avatar_url', u.avatar_url
      ) as author
    FROM gallery_items gi
    LEFT JOIN users u ON gi.author_id = u.id
    INNER JOIN user_likes ul ON gi.id = ul.gallery_item_id
    WHERE ul.user_id = ${userId}
    ORDER BY ul.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return result.rows as GalleryItem[];
}

// ===== Statistics =====

/**
 * Get user statistics
 */
export async function getUserStatistics(userId: number) {
  const worksCount = await sql`
    SELECT COUNT(*) as count FROM gallery_items WHERE author_id = ${userId}
  `;

  const likesCount = await sql`
    SELECT SUM(likes) as count FROM gallery_items WHERE author_id = ${userId}
  `;

  const viewsCount = await sql`
    SELECT SUM(views) as count FROM gallery_items WHERE author_id = ${userId}
  `;

  return {
    works: Number(worksCount.rows[0]?.count || 0),
    likes: Number(likesCount.rows[0]?.count || 0),
    views: Number(viewsCount.rows[0]?.count || 0),
  };
}
