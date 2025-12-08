# 快速开始指南

## 1. 安装依赖

```bash
cd /Volumes/Data/projects/lint项目/geogebra-lint
npm install
```

## 2. 编译项目

```bash
npm run build
```

这会将 TypeScript 代码编译到 `dist/` 目录。

## 3. 运行示例

### 方式 1: 使用预定义的测试文件

```bash
npm run demo
```

这将解析 `tests/fixtures/example.ggb` 文件并显示分析结果。

### 方式 2: 直接解析代码

```bash
npm run demo:inline "SetValue(a, 1)"
```

### 方式 3: 使用 CLI 工具

```bash
# 解析文件
node scripts/cli.js tests/fixtures/example.ggb

# 直接解析代码
node scripts/cli.js -c "Point(A, 1, 2)"
```

### 方式 4: 使用 TypeScript 示例

```bash
npx ts-node tests/parser-example.ts
```

## 4. 在代码中使用

创建一个新文件 `my-script.ts`:

```typescript
import { parseGeoGebraScript } from './src/core/parser/parser';

const code = `
P = Point(0, 0)
SetColor(P, "red")
`;

try {
    const ast = parseGeoGebraScript(code);
    console.log('解析成功!');
    console.log(`找到 ${ast.body.length} 个命令`);
    
    ast.body.forEach((cmd, i) => {
        console.log(`${i + 1}. ${cmd.commandName.name}()`);
    });
} catch (error) {
    console.error('解析失败:', error.message);
}
```

运行:

```bash
npx ts-node my-script.ts
```

或编译后运行:

```bash
npm run build
node dist/../my-script.js
```

## 5. 运行测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch
```

## 6. 开发模式

在一个终端中启动监听模式:

```bash
npm run watch
```

这会自动重新编译修改的文件。

在另一个终端中测试:

```bash
node scripts/cli.js -c "SetValue(a, 123)"
```

## 7. 代码检查和格式化

```bash
# 运行 ESLint
npm run lint

# 格式化代码
npm run format
```

## API 使用示例

### 词法分析

```typescript
import { Lexer, TokenType } from './src/core/parser/lexer';

const lexer = new Lexer('SetValue(a, 1)');
const tokens = lexer.tokenize();

tokens.forEach(token => {
    console.log(token.type, token.value);
});
```

### 语法分析

```typescript
import { parseGeoGebraScript } from './src/core/parser/parser';

const ast = parseGeoGebraScript('SetValue(a, 1)');

// AST 是一个 Program 节点
console.log(ast.type); // 'Program'
console.log(ast.body.length); // 命令数量
```

### 错误处理

```typescript
import { parseGeoGebraScript, ParseError } from './src/core/parser/parser';

try {
    parseGeoGebraScript('Invalid(');
} catch (error) {
    if (error instanceof ParseError) {
        console.log('错误:', error.message);
        console.log('位置:', error.position);
    }
}
```

## 项目结构

```
geogebra-lint/
├── src/
│   └── core/
│       ├── parser/
│       │   ├── ast.d.ts      # AST 类型定义
│       │   ├── lexer.ts      # 词法分析器 ✅ 已实现
│       │   └── parser.ts     # 语法分析器 ✅ 已实现
│       ├── rules/            # Lint 规则 (待实现)
│       └── specs/            # GeoGebra 命令规范
├── tests/
│   ├── unit/                 # 单元测试
│   ├── fixtures/             # 测试数据
│   └── parser-example.ts     # 使用示例
├── scripts/
│   └── cli.js                # CLI 工具
├── dist/                     # 编译输出 (自动生成)
├── package.json
├── tsconfig.json
├── jest.config.js
├── README.md
├── EXAMPLES.md
└── QUICKSTART.md (本文件)
```

## 下一步

- 查看 `README.md` 了解完整文档
- 查看 `EXAMPLES.md` 查看更多使用示例
- 探索 `tests/` 目录查看测试用例
- 开始实现自定义的 lint 规则

## 常见问题

### Q: 如何解析一个文件?

```typescript
import fs from 'fs';
import { parseGeoGebraScript } from './src/core/parser/parser';

const code = fs.readFileSync('script.ggb', 'utf-8');
const ast = parseGeoGebraScript(code);
```

### Q: 如何获取某个命令的所有参数?

```typescript
const ast = parseGeoGebraScript('SetValue(a, 1)');
const command = ast.body[0];
const args = command.arguments;

args.forEach(arg => {
    console.log(arg.type);
});
```

### Q: 如何检测特定类型的错误?

```typescript
import { parseGeoGebraScript } from './src/core/parser/parser';

function checkScript(code: string) {
    const ast = parseGeoGebraScript(code);
    
    // 检查每个命令
    ast.body.forEach(cmd => {
        // 自定义检查逻辑
        if (cmd.commandName.name === 'SetValue') {
            if (cmd.arguments.length !== 2) {
                console.log('SetValue 需要 2 个参数');
            }
        }
    });
}
```

## 支持

如有问题，请查看:
- `README.md` - 完整文档
- `EXAMPLES.md` - 详细示例
- `tests/` - 测试用例
- 源代码注释
