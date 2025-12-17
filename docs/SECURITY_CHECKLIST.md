# 开源安全检查清单

## ✅ 已经安全的部分

### 1. **环境变量保护**
- ✅ `.gitignore` 已正确配置，忽略所有 `.env*` 文件
- ✅ 只有 `.env.example` 被包含在代码库中（仅包含示例值）
- ✅ 真实的环境变量（`.env.local`）不会被提交

### 2. **代码中没有硬编码凭据**
- ✅ 数据库密码、API keys 都通过环境变量获取
- ✅ JWT secret 使用环境变量，有默认值但仅用于开发
- ✅ 没有硬编码的数据库连接字符串

### 3. **敏感文件已忽略**
- ✅ `node_modules/` - 已忽略
- ✅ `.next/` - 已忽略
- ✅ `.vercel/` - 已忽略
- ✅ `*.pem` - 已忽略

## ⚠️ 需要注意的问题

### 1. **默认 JWT Secret 存在但可接受**
**位置**: `lib/auth.ts:3`
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
```

**风险等级**: 🟡 中等（仅影响开发环境）

**说明**: 
- 这个默认值仅在环境变量未设置时使用
- 在生产环境中必须设置真实的 JWT_SECRET
- README 中已有明确说明

**建议**: 
- 在 README 中添加警告⚠️，强调必须在生产环境设置 JWT_SECRET
- 可以考虑在生产环境检测到默认值时抛出错误

### 2. **文档中包含示例凭据**
**位置**: `docs/DATABASE_SETUP.md`, `docs/API.md`

**风险等级**: 🟢 低（仅为示例）

**说明**: 所有示例都使用占位符（`***`, `...`），没有真实凭据

## 📋 上传前的最终检查清单

在推送到 GitHub 之前，请确认：

- [ ] 运行 `git status` 确认没有 `.env.local` 或其他环境文件
- [ ] 检查是否有意外提交的 API keys 或 tokens
- [ ] 确认 `.gitignore` 包含 `.env*`
- [ ] 删除任何测试数据库的凭据
- [ ] 确保 README 中提醒用户设置环境变量

### 检查命令

```bash
# 1. 检查是否有环境文件被跟踪
git ls-files | grep -E '\.env'

# 2. 检查代码中是否有潜在的密钥泄露
grep -r "password.*=" --include="*.ts" --include="*.tsx" --include="*.js" | grep -v "password_hash" | grep -v "useState" | grep -v "setPassword"

# 3. 检查是否有硬编码的 API keys
grep -r "sk-" --include="*.ts" --include="*.tsx" --include="*.js"
grep -r "Bearer.*[a-zA-Z0-9]" --include="*.ts" --include="*.tsx" --include="*.js"

# 4. 确认 .env.local 没有被跟踪
git check-ignore .env.local

# 输出应该是: .env.local
# 如果没有输出，说明 .gitignore 配置有问题
```

## 🔒 推荐的额外安全措施

### 1. 添加 GitHub Secrets 扫描
在 `.github/workflows/` 创建工作流，自动检测敏感信息：

```yaml
# .github/workflows/security-scan.yml
name: Security Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
```

### 2. 添加 pre-commit hook
创建 `.husky/pre-commit` 或直接使用 git hook：

```bash
#!/bin/sh
# .git/hooks/pre-commit

# 检查是否有 .env 文件被提交
if git diff --cached --name-only | grep -q "\.env$"; then
    echo "❌ Error: .env file should not be committed!"
    echo "Please remove it from staging: git reset HEAD .env"
    exit 1
fi

# 检查是否有潜在的 API keys
if git diff --cached | grep -qE "(sk-[a-zA-Z0-9]{48}|postgres://.*@)"; then
    echo "⚠️  Warning: Potential API key or database URL detected!"
    echo "Please review your changes carefully."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
```

### 3. 更新 README.md，添加安全警告

在 README 开头添加：

```markdown
## ⚠️ 安全须知

**重要**: 在部署到生产环境之前，务必：

1. 设置强随机的 `JWT_SECRET`（至少 32 字符）
2. 配置真实的 Vercel Postgres 和 Blob 凭据
3. 永远不要将 `.env.local` 提交到代码库
4. 定期轮换密钥和令牌

生成 JWT secret 命令：
\`\`\`bash
openssl rand -base64 32
\`\`\`
```

### 4. 生产环境检测

更新 `lib/auth.ts`，在生产环境检测默认密钥：

```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 生产环境检测
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key-change-in-production') {
  throw new Error('SECURITY ERROR: JWT_SECRET must be set in production environment!');
}

const secret = new TextEncoder().encode(JWT_SECRET);
```

## 📝 开源时应包含的文件

### ✅ 应该包含：
- `README.md` - 项目说明
- `.env.example` - 环境变量示例
- `docs/` - 所有文档
- 所有源代码文件
- `package.json`
- `LICENSE` 文件

### ❌ 不应包含：
- `.env.local` - 本地环境变量
- `.env.production` - 生产环境变量
- `node_modules/` - 依赖包
- `.next/` - 构建输出
- 任何包含真实凭据的文件

## 🎯 总结

**当前状态**: ✅ **可以安全开源**

你的项目配置很好，主要的安全措施都已到位：
1. 环境变量已正确忽略
2. 没有硬编码的敏感信息
3. 文档中只有示例值

**建议执行的改进**:
1. 在 `lib/auth.ts` 中添加生产环境检测
2. 在 README 中添加明确的安全警告
3. 运行上面的检查命令确认没有遗漏

**上传前的最后步骤**:
```bash
# 1. 确认 .gitignore 生效
git status

# 2. 如果看到任何 .env 文件，立即删除
git rm --cached .env.local

# 3. 推送到远程
git add .
git commit -m "feat: integrate database and blob storage"
git push origin dev
```

如有任何疑问，请参考 GitHub 的安全最佳实践：
https://docs.github.com/en/code-security/getting-started/securing-your-repository
