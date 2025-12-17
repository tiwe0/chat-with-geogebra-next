#!/usr/bin/env node
import { config } from 'dotenv'
import { sql } from '@vercel/postgres'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load environment variables from .env.local
config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function initDatabase() {
  try {
    console.log('🚀 Starting database initialization...')

    // Read and execute schema
    const schemaPath = join(__dirname, '../db/schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')

    console.log('📝 Executing schema...')
    await sql.query(schema)

    console.log('✅ Database schema created successfully!')
    
    // Optionally seed some initial data
    console.log('🌱 Seeding initial data...')
    
    // You can add seed data here if needed
    // For example, creating a demo user:
    // await sql`
    //   INSERT INTO users (email, username, password_hash, bio)
    //   VALUES ('demo@example.com', 'demo', 'hashed_password', 'Demo user')
    //   ON CONFLICT (email) DO NOTHING
    // `

    console.log('✅ Database initialization completed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  }
}

initDatabase()
