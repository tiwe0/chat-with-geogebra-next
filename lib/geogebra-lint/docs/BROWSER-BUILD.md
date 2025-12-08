# 浏览器环境构建说明

## 问题背景

在浏览器环境中，ES 模块不能直接导入 JSON 文件（会返回 `application/json` MIME 类型错误）。

## 解决方案

将 `commandSignatures.json` 转换为 TypeScript 文件 (`commandSignatures.ts`)，使其可以作为 ES 模块导入。

## 构建流程

### 自动构建

```bash
npm run build:browser
```

这个命令会：
1. 运行 `scripts/convert-json.js` 将 JSON 转为 TS
2. 编译 TypeScript 为 ES 模块

### 手动步骤

如果需要手动执行：

```bash
# 1. 转换 JSON
node scripts/convert-json.js

# 2. 编译
tsc --project tsconfig.browser.json
```

## 生成的文件

- **源文件**: `src/core/specs/commandSignatures.json` (保持不变)
- **生成文件**: `src/core/specs/commandSignatures.ts` (自动生成，已加入 .gitignore)
- **编译输出**: `dist/core/specs/commandSignatures.js` (ES 模块)

## 重要提示

⚠️ **不要手动编辑** `commandSignatures.ts`，它是自动生成的。

如需修改命令签名，请编辑 `commandSignatures.json` 并重新构建。

## 故障排查

### 问题：模块加载失败，MIME 类型错误

**原因**：JSON 文件没有转换为 TypeScript

**解决**：
```bash
node scripts/convert-json.js
npm run build:browser
```

### 问题：命令规范数量为 0

**原因**：`commandSignatures.ts` 未生成或未正确导出

**解决**：
1. 检查 `src/core/specs/commandSignatures.ts` 是否存在
2. 重新运行转换脚本
3. 清除浏览器缓存并刷新
