# Database and Storage Setup Guide

本项目使用 Vercel Neon (PostgreSQL) 作为数据库，Vercel Blob 用于文件存储。

## 1. 设置 Vercel Postgres (Neon)

### 1.1 创建数据库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入 **Storage** 标签
3. 点击 **Create Database**
4. 选择 **Postgres (Powered by Neon)**
5. 选择区域（建议选择离用户最近的区域）
6. 创建数据库

### 1.2 获取连接信息

创建完成后，点击 **Connect**，复制 `.env.local` 标签中的所有环境变量。

### 1.3 配置环境变量

将复制的环境变量粘贴到项目根目录的 `.env.local` 文件中（如果没有，创建一个）：

```env
POSTGRES_URL="postgres://default:***@***-postgres.vercel-storage.com:5432/verceldb"
POSTGRES_PRISMA_URL="postgres://default:***@***-postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NO_SSL="postgres://default:***@***-postgres.vercel-storage.com:5432/verceldb"
POSTGRES_URL_NON_POOLING="postgres://default:***@***-postgres.vercel-storage.com:5432/verceldb"
POSTGRES_USER="default"
POSTGRES_HOST="***-postgres.vercel-storage.com"
POSTGRES_PASSWORD="***"
POSTGRES_DATABASE="verceldb"
```

### 1.4 初始化数据库

运行初始化脚本创建数据表：

```bash
pnpm tsx scripts/init-db.ts
```

这将创建以下表：
- `users` - 用户表
- `gallery_items` - 作品表
- `user_likes` - 点赞关系表

## 2. 设置 Vercel Blob Storage

### 2.1 创建 Blob Store

1. 在 Vercel Dashboard 中进入 **Storage** 标签
2. 点击 **Create Database**
3. 选择 **Blob**
4. 创建存储

### 2.2 获取访问令牌

创建完成后，点击 **Connect**，复制 `BLOB_READ_WRITE_TOKEN`。

### 2.3 配置环境变量

将令牌添加到 `.env.local` 文件：

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_***"
```

## 3. 配置 JWT Secret

生成一个随机的 JWT 密钥：

```bash
openssl rand -base64 32
```

将生成的密钥添加到 `.env.local` 文件：

```env
JWT_SECRET="your-generated-secret-key"
```

## 4. 完整的 .env.local 示例

```env
# Vercel Postgres (Neon)
POSTGRES_URL="postgres://default:***@***-postgres.vercel-storage.com:5432/verceldb"
POSTGRES_PRISMA_URL="postgres://default:***@***-postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NO_SSL="postgres://default:***@***-postgres.vercel-storage.com:5432/verceldb"
POSTGRES_URL_NON_POOLING="postgres://default:***@***-postgres.vercel-storage.com:5432/verceldb"
POSTGRES_USER="default"
POSTGRES_HOST="***-postgres.vercel-storage.com"
POSTGRES_PASSWORD="***"
POSTGRES_DATABASE="verceldb"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_***"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
```

## 5. 验证配置

### 5.1 测试数据库连接

启动开发服务器：

```bash
pnpm dev
```

### 5.2 测试用户注册

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

### 5.3 测试用户登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

你应该会收到包含 JWT token 的响应。

## 6. 数据库架构

### users 表
- `id` - 用户 ID（主键）
- `email` - 邮箱（唯一）
- `username` - 用户名（唯一）
- `password_hash` - 密码哈希
- `avatar_url` - 头像 URL
- `bio` - 个人简介
- `location` - 位置
- `website` - 网站
- `created_at` - 创建时间
- `updated_at` - 更新时间

### gallery_items 表
- `id` - 作品 ID（主键）
- `title` - 标题
- `description` - 描述
- `author_id` - 作者 ID（外键 → users）
- `category` - 分类
- `education` - 教育阶段
- `topic` - 主题
- `tags` - 标签数组
- `views` - 浏览次数
- `likes` - 点赞数
- `file_url` - 文件 URL（Blob 存储）
- `file_blob_key` - Blob 存储的 key
- `thumbnail_url` - 缩略图 URL
- `created_at` - 创建时间
- `updated_at` - 更新时间

### user_likes 表
- `id` - 记录 ID（主键）
- `user_id` - 用户 ID（外键 → users）
- `gallery_item_id` - 作品 ID（外键 → gallery_items）
- `created_at` - 创建时间
- 唯一约束：(user_id, gallery_item_id)

## 7. 常见问题

### 连接超时
如果遇到连接超时，确保使用 `POSTGRES_PRISMA_URL` 而不是 `POSTGRES_URL`，因为它包含了连接池配置。

### 文件上传失败
确保 `BLOB_READ_WRITE_TOKEN` 是 read-write 权限的令牌，而不是只读令牌。

### JWT 验证失败
确保 `JWT_SECRET` 在所有环境中保持一致，并且足够复杂（至少 32 个字符）。

## 8. 生产部署

在 Vercel 上部署时：

1. 在项目设置中添加所有环境变量
2. Vercel 会自动注入 Postgres 和 Blob 的环境变量（如果在同一项目中创建）
3. 确保在部署后运行数据库初始化脚本

```bash
vercel env pull .env.local
pnpm tsx scripts/init-db.ts
```

## 9. 本地开发

对于本地开发，你可以：

1. 使用 Vercel 提供的开发数据库
2. 或者使用 Docker 运行本地 PostgreSQL：

```bash
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=geogebra_chat \
  -p 5432:5432 \
  -d postgres:15
```

然后更新 `.env.local` 中的连接字符串：

```env
POSTGRES_URL="postgres://postgres:password@localhost:5432/geogebra_chat"
```
