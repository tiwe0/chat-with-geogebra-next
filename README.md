# 🎨 Chat with GeoGebra (Next Part)

> ⚠️ **安全提醒**: 在部署到生产环境前，请务必阅读 [安全检查清单](docs/SECURITY_CHECKLIST.md)

~~(⚠️本项目因作者找到了一周加班五天的工作而丧失了维护能力，虽然作者已经畅想出了详细的后续更新计划和宏伟的商业版图。如果您觉得您有能力让这个项目更好，请联系作者)~~

目前比较闲，会日常更新一下

⚠️ 此项目是 chat-with-geogebra 的 next 部分

## TODO List

- [ ] 基于geogebra command lint的语法检测
- [ ] 自我修正的mcp
- [ ] 上传应用题照片自动绘图
- [ ] 客户端

使用自然语言交流，辅助绘制 GeoGebra 图像的轻量工具。

## 🛠️ 项目简介

**Chat with GeoGebra** 是一个基于 **Next.js** 构建的项目，  
通过与大语言模型（LLM）交流，让用户用自然语言描述需求，自动生成 GeoGebra 命令并实时绘图。

## 🧙‍♂️ 背景故事（中二版）

在那个充满阳光与幻梦的青春时代，作者暗恋着一位温柔而又神秘的女教师。  
她手执粉笔，绘制着世界的边界，却苦于无法驯服名为 GeoGebra 的神之工具。

面对女神的无助眼神，作者点燃了心中的烈火：  
> “即使踏碎万难，我也要为她创造一把能用语言驾驭图形的魔杖！”

数月闭关修炼，挑战 LLM，驾驭 API，召唤 Claude、ChatGPT 与 DeepSeek，  
终于，**Chat with GeoGebra** 横空出世！

然而，当迷雾散尽，少年终于明白：女神不过是凡人，她的光芒只存在于幻想之中。  
带着微笑与遗憾，作者收剑入鞘，将这份力量留给了所有需要它的人。🌌

(省流版：被拒绝了)

## ✨ 功能特色

- 🧠 自然语言生成 GeoGebra 命令
- 🖼️ 自动绘制图像，实时反馈
- 🔗 支持接入多个大模型（Claude、ChatGPT、DeepSeek）
- 🌐 无需安装，直接在线访问
- 🏠 支持本地部署
- 🔑 支持自定义 API Key

## 🌍 在线体验

稳定访问：[👉 点击这里访问网站](https://chat-with-geogebra.ivory.cafe)
预览版本: [👉 点击这里访问网站](https://chat-with-geogebra-prev.ivory.cafe)

## 🖼️ 预览截图

![预览图](./public/preview.jpg)  

## 🚀 快速开始（本地部署）

### 前置要求
- Node.js 18+ 
- pnpm
- Vercel 账户（用于数据库和文件存储，可选）

### 🔐 环境配置（重要）

1. **复制环境变量模板**：
   ```bash
   cp .env.example .env.local
   ```

2. **配置必需的环境变量**：
   - `JWT_SECRET` - JWT 密钥（**生产环境必须设置**）
   - `POSTGRES_URL` - 数据库连接（使用数据库功能时需要）
   - `BLOB_READ_WRITE_TOKEN` - 文件存储令牌（使用文件上传时需要）

   **生成 JWT Secret**：
   ```bash
   openssl rand -base64 32
   ```

   详细配置步骤见 [数据库设置指南](docs/DATABASE_SETUP.md)

### 安装与运行

```bash

# 安装依赖
pnpm install

# （可选）如果使用数据库功能，初始化数据库
pnpm tsx scripts/init-db.ts

# 运行开发环境
pnpm dev
```

访问 `http://localhost:3000` 开始使用。

⚡ **注意**：
- 基本聊天功能需要自行准备 Claude、ChatGPT、DeepSeek 等服务的 API Key
- 画廊、用户认证功能需要配置数据库（见上方环境配置）
- 更多 API 文档见 [API 文档](docs/API.md)

## 🧩 技术栈
- Next.js
- GeoGebra Command API
- 大语言模型接入（Claude / ChatGPT / DeepSeek）

## 📜 开源协议

本项目基于 MIT License 开源，允许自由商用。
代码版权归作者 Ivory (也就是本仓库的拥有者，虽然他的 github 账号名为 tiwe0) 所有。

## 📬 联系方式

作者：Ivory
邮箱：contact@ivory.cafe
请注明来意，因为作者的邮箱里垃圾订阅邮件很多，虽然这些邮件也不能让作者感到被关心，也不能给作者带来心灵上的温暖。
