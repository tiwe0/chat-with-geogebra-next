# API Documentation

## 认证相关

### 注册新用户

**POST** `/api/auth/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "username": "username",
      "avatar": "",
      "bio": "",
      "location": "",
      "website": "",
      "joinedDate": "2025-01-01T00:00:00.000Z",
      "stats": {
        "works": 0,
        "likes": 0,
        "views": 0
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Sign up successful"
}
```

### 用户登录

**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "username": "username",
      "avatar": "",
      "bio": "数学爱好者",
      "location": "北京",
      "website": "https://example.com",
      "joinedDate": "2025-01-01T00:00:00.000Z",
      "stats": {
        "works": 5,
        "likes": 120,
        "views": 3456
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 作品画廊相关

### 获取作品列表

**GET** `/api/gallery?education={education}&topic={topic}&search={search}&limit={limit}&offset={offset}`

**Query Parameters:**
- `education` (optional): 教育阶段（primary, middle, high, university）
- `topic` (optional): 主题（algebra, geometry, calculus, etc.）
- `search` (optional): 搜索关键词
- `limit` (optional): 每页数量，默认 20
- `offset` (optional): 偏移量，默认 0

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "二次函数图像",
      "description": "展示了二次函数的基本性质",
      "author": "数学爱好者",
      "authorId": "1",
      "authorAvatar": "",
      "category": "代数",
      "education": "high",
      "topic": "function",
      "tags": ["抛物线", "函数", "代数"],
      "views": 1234,
      "likes": 89,
      "uploadedAt": "2025-12-10T10:00:00Z",
      "fileUrl": "https://blob.vercel-storage.com/...",
      "thumbnailUrl": ""
    }
  ],
  "total": 1
}
```

### 上传新作品

**POST** `/api/gallery`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body (FormData):**
- `file`: GeoGebra 文件 (.ggb)
- `title`: 标题（必填）
- `description`: 描述
- `category`: 分类
- `education`: 教育阶段
- `topic`: 主题
- `tags`: 标签（逗号分隔）

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "二次函数图像",
    "description": "展示了二次函数的基本性质",
    "author": "数学爱好者",
    "authorId": "1",
    "category": "代数",
    "education": "high",
    "topic": "function",
    "tags": ["抛物线", "函数", "代数"],
    "views": 0,
    "likes": 0,
    "uploadedAt": "2025-12-10T10:00:00Z",
    "fileUrl": "https://blob.vercel-storage.com/..."
  },
  "message": "File uploaded successfully"
}
```

### 获取作品详情

**GET** `/api/gallery/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "二次函数图像",
    "description": "展示了二次函数的基本性质",
    "author": "数学爱好者",
    "authorId": "1",
    "authorAvatar": "",
    "category": "代数",
    "education": "high",
    "topic": "function",
    "tags": ["抛物线", "函数", "代数"],
    "views": 1235,
    "likes": 89,
    "isLiked": false,
    "uploadedAt": "2025-12-10T10:00:00Z",
    "fileUrl": "https://blob.vercel-storage.com/...",
    "thumbnailUrl": ""
  }
}
```

### 点赞/取消点赞作品

**PATCH** `/api/gallery/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "action": "like"  // or "unlike"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "likes": 90,
    "isLiked": true
  }
}
```

### 删除作品

**DELETE** `/api/gallery/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

**错误响应:**
```json
{
  "success": false,
  "error": "Forbidden: You can only delete your own items"
}
```

## 错误码

- `400` - 请求参数错误
- `401` - 未授权（需要登录）
- `403` - 禁止访问（权限不足）
- `404` - 资源不存在
- `409` - 冲突（如用户已存在）
- `500` - 服务器错误

## 认证说明

大部分 API 需要在请求头中包含 JWT token：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token 在登录或注册成功后返回，有效期为 7 天。

## 使用示例

### JavaScript/TypeScript

```typescript
// 登录
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
const { data } = await loginResponse.json()
const token = data.token

// 上传作品
const formData = new FormData()
formData.append('file', file)
formData.append('title', 'My GeoGebra Work')
formData.append('description', 'A description')
formData.append('education', 'high')
formData.append('topic', 'function')
formData.append('tags', 'math,algebra,function')

const uploadResponse = await fetch('/api/gallery', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
})

// 点赞作品
const likeResponse = await fetch('/api/gallery/1', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ action: 'like' })
})
```

### cURL

```bash
# 注册
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"user","password":"pass123"}'

# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# 获取作品列表
curl http://localhost:3000/api/gallery?education=high&topic=function

# 点赞作品
curl -X PATCH http://localhost:3000/api/gallery/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"action":"like"}'
```
