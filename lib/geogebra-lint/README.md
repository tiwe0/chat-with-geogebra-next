# GeoGebra Lint Engine

一个功能完整的 GeoGebra 脚本 Lint 引擎，提供词法分析、语法分析、代码检查和在线测试功能。

## ✨ 功能特性

- 🔍 **词法分析 (Lexer)**: 将 GeoGebra 脚本转换为 Token 流
- 🌲 **语法分析 (Parser)**: 将 Token 流解析为抽象语法树 (AST)
- ⚙️ **规则引擎 (Rule Engine)**: 可扩展的代码检查规则系统
- ✅ **类型检查**: 验证命令参数数量和类型是否正确
- 🚫 **未知命令检测**: 识别不存在的 GeoGebra 命令，提供拼写建议
- 📚 **命令规范**: 支持 505+ GeoGebra 命令的完整签名
- 🌐 **Web 测试界面**: 实时在线测试和 AST 可视化
- 🧪 **完整测试**: 51 个单元测试 + 集成测试

## 🚀 快速开始

### 在线体验

启动 Web 测试界面（推荐）：

```bash
# Windows 一键启动
start-web-demo.bat

# 或手动启动
npm run build:browser
python -m http.server 8080
# 访问 http://localhost:8080/tests/web-demo.html
```

**Web 界面功能**：
- 左侧：代码编辑器
- 右上：AST 语法树可视化（彩色显示）
- 右下：错误和警告检查结果
- 快速示例：一键加载常见测试用例

### 命令行使用

### 命令行使用

**安装依赖**：
```bash
npm install
```

**运行测试**：
```bash
# 单元测试（51 个测试）
npm test

# 集成测试
npm run test:integration

# Lint 演示
npm run demo:lint
```

### 1. 词法分析 (Lexer)

```typescript
import { Lexer } from './src/core/parser/lexer';

const code = `SetValue(a, 1)`;
const lexer = new Lexer(code);
const tokens = lexer.tokenize();

console.log(tokens);
// 输出 Token 数组
```

### 2. 语法分析 (Parser)

```typescript
import { parseGeoGebraScript } from './src/core/parser/parser';

const code = `
SetValue(a, 1)
Point(A, 1, 2)
P = Point(3, 4)
`;

const ast = parseGeoGebraScript(code);
console.log(JSON.stringify(ast, null, 2));
```

### 3. 代码检查 (Linting)

```typescript
import {
    RuleEngine,
    noUnknownCommand,
    correctArgTypes,
    formatLintResults
} from './src/core';

// 创建 lint 引擎
const engine = new RuleEngine({
    rules: {
        'no-unknown-command': 'error',
        'correct-arg-types': 'warn'
    }
});

// 注册规则
engine.registerRules([
    noUnknownCommand,
    correctArgTypes
]);

// 运行检查
const code = `
SetValue(a, 1)
UnknownCommand(b, 2)
`;

const result = engine.lint(code);
console.log(formatLintResults(result));
```

**输出示例**：
```
发现 1 个错误，0 个警告：

1. ❌ [no-unknown-command] 未知的命令 "UnknownCommand"
   位置: 行 3:1
   💡 请检查命令名是否正确
```

### 4. 完整示例

```typescript
import { parseGeoGebraScript } from './src/core/parser/parser';

// GeoGebra 脚本代码
const script = `
// 创建点
P = Point(0, 0)
Q = Point(3, 4)

// 设置颜色
SetColor(P, "red")
SetColor(Q, "blue")

// 创建列表
myList = {1, 2, 3, 4, 5}

// 设置可见性
SetVisible(P, true)
`;

try {
    const ast = parseGeoGebraScript(script);
    
    // 遍历所有命令
    ast.body.forEach(command => {
        console.log(`命令: ${command.commandName.name}`);
        console.log(`参数数量: ${command.arguments.length}`);
    });
} catch (error) {
    console.error('解析错误:', error.message);
}
```

## 📊 支持的检查规则

### 1. no-unknown-command (错误级别)

检查命令是否在 GeoGebra 命令库中存在，提供拼写建议。

```javascript
UnknownCommand(a, 1)  // ❌ 错误：未知的命令
SetValu(obj, 5)       // ❌ 错误：你是否想使用 SetValue?
```

### 2. correct-arg-types (警告级别)

检查命令参数数量和类型是否正确。

```javascript
Distance(A)           // ⚠️ 警告：期望 2 个参数，收到 1 个
SetColor(P)           // ⚠️ 警告：期望 4 个参数，收到 1 个
SetColor(P, "red")    // ✅ 正确：支持字符串形式的颜色
```

## 🎯 支持的语法

### 命令调用

```geogebra
SetValue(a, 1)
Point(A, 1, 2)
SetColor(obj, "red")
```

### 赋值语句

```geogebra
P = Point(1, 2)
a = 5
```

### 数据类型

- **数字**: `1`, `3.14`, `-5`, `2.5e10`
- **字符串**: `"red"`, `"Hello World"`
- **布尔值**: `true`, `false`
- **列表**: `{1, 2, 3}`, `{A, B, C}`
- **标识符**: `A`, `myPoint`, `slider1`

### 嵌套函数调用

```geogebra
SetValue(A, x(B))
Distance(Point(0, 0), Point(3, 4))
```

### 注释

```geogebra
// 这是单行注释
SetValue(a, 1)  // 行尾注释
```

## 🌲 AST 结构

解析后的 AST 包含以下节点类型：

- `Program`: 根节点
- `CommandStatement`: 命令语句
- `Identifier`: 标识符
- `NumberLiteral`: 数字字面量
- `StringLiteral`: 字符串字面量
- `BooleanLiteral`: 布尔字面量
- `ListLiteral`: 列表字面量
- `FunctionCall`: 函数/命令调用

每个节点都包含 `loc` 字段，记录源代码位置信息（行号、列号）。

**AST 示例**：
```javascript
{
  "type": "Program",
  "body": [
    {
      "type": "CommandStatement",
      "assignTo": { "type": "Identifier", "name": "P" },
      "commandName": { "type": "Identifier", "name": "Point" },
      "arguments": [
        { "type": "NumberLiteral", "value": 0 },
        { "type": "NumberLiteral", "value": 0 }
      ],
      "loc": { "start": { "line": 1, "column": 1 }, ... }
    }
  ]
}
```

## 🛠️ 开发

## 🛠️ 开发

### 构建项目

```bash
# Node.js 环境构建
npm run build

# 浏览器环境构建（ES 模块）
npm run build:browser
```

### 监听模式

```bash
npm run watch
```

### 运行测试

```bash
# 单元测试（Jest）
npm test

# 监听模式
npm run test:watch

# 集成测试
npm run test:integration
```

### 演示命令

```bash
# Lint 演示
npm run demo:lint

# Web 演示
npm run demo:web
```

## 📁 项目结构

## 📁 项目结构

```
geogebra-lint/
├── src/
│   ├── index.ts                  # 主入口文件
│   ├── core/
│   │   ├── index.ts              # 核心模块导出
│   │   ├── parser/
│   │   │   ├── ast.d.ts          # AST 类型定义
│   │   │   ├── lexer.ts          # 词法分析器 ✅
│   │   │   └── parser.ts         # 语法分析器 ✅
│   │   ├── rules/                # Lint 规则
│   │   │   ├── rule.d.ts         # 规则接口定义
│   │   │   ├── rule-engine.ts    # 规则引擎 ✅
│   │   │   ├── no-unknown-command.ts  # 未知命令检测 ✅
│   │   │   └── correct-arg-types.ts   # 参数类型检查 ✅
│   │   ├── specs/                # GeoGebra 命令规范
│   │   │   ├── commandSignatures.json # 505 个命令签名
│   │   │   └── spec-registry.ts  # 规范注册表 ✅
│   │   └── analyzer/             # 语义分析（规划中）
│   └── types/                    # 类型定义
│       └── linting.ts            # Linting 类型 ✅
├── tests/                        # 测试文件
│   ├── unit/                     # 单元测试（51 个测试）
│   │   ├── lexer.test.ts
│   │   ├── parser.test.ts
│   │   ├── rule-engine.test.ts
│   │   └── spec-registry.test.ts
│   ├── fixtures/                 # 测试数据
│   ├── web-demo.html             # Web 测试界面 ✅
│   ├── module-test.html          # 模块加载测试
│   ├── integration-test.ts       # 集成测试 ✅
│   └── lint-example.ts           # Lint 示例 ✅
├── scripts/
│   ├── cli.js                    # 命令行工具
│   └── convert-json.js           # JSON 转 TS 工具 ✅
├── docs/                         # 文档
│   ├── IMPLEMENTATION.md         # 实现文档
│   ├── RULE-ENGINE.md            # 规则引擎文档
│   ├── BROWSER-BUILD.md          # 浏览器构建说明 ✅
│   └── WEB-DEMO-README.md        # Web 演示文档 ✅
├── dist/                         # 编译输出
├── package.json
├── tsconfig.json                 # Node.js 构建配置
├── tsconfig.browser.json         # 浏览器构建配置 ✅
├── jest.config.js                # Jest 测试配置
├── start-web-demo.bat            # Windows 启动脚本 ✅
└── README.md
```

## ⚠️ 错误处理

Parser 会在遇到语法错误时抛出 `ParseError`，包含详细的错误位置信息：

```typescript
try {
    const ast = parseGeoGebraScript('Invalid(');
} catch (error) {
    if (error instanceof ParseError) {
        console.log(error.message);
        // 输出: Parse error at line 1, column 9: Expected ')' after arguments
        console.log(`位置: ${error.position.line}:${error.position.column}`);
    }
}
```

## 🌐 浏览器支持

Web 测试界面需要支持 ES2020 和 ES Modules 的现代浏览器：

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**注意**：必须通过 HTTP(S) 协议访问，不能使用 `file://` 协议。

## 📚 文档

- [快速开始](docs/QUICKSTART.md) - 5 分钟上手指南
- [实现文档](docs/IMPLEMENTATION.md) - 架构和实现细节
- [规则引擎](docs/RULE-ENGINE.md) - 如何创建自定义规则
- [浏览器构建](docs/BROWSER-BUILD.md) - 浏览器环境构建说明
- [Web 演示](tests/WEB-DEMO-README.md) - Web 测试界面使用指南

## 🔧 技术栈

- **语言**: TypeScript 5.0+
- **运行时**: Node.js 18+
- **测试**: Jest 29
- **模块系统**: CommonJS (Node) / ES Modules (浏览器)
- **代码规范**: ESLint + Prettier

## 🎯 测试覆盖

- ✅ Lexer: 15 个测试用例
- ✅ Parser: 18 个测试用例
- ✅ Rule Engine: 12 个测试用例
- ✅ Spec Registry: 6 个测试用例
- ✅ 集成测试: 6 个完整场景

**总计**: 51 个单元测试，100% 通过

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发步骤

1. Fork 本仓库
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

### 添加新规则

查看 [规则引擎文档](docs/RULE-ENGINE.md) 了解如何创建自定义检查规则。

## 📧 联系方式

- Issues: [GitHub Issues](https://github.com/tiwe0/geogebra-lint/issues)
- 文档: [项目文档](docs/)

---

Made with ❤️ for GeoGebra Community