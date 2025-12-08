# GeoGebra Lint Core

GeoGebra 命令语法检查核心库，已集成到主项目中作为 TypeScript 源代码使用。

## 目录结构

```
geogebra-lint-core/
├── index.ts                    # 主入口，导出所有公共 API
├── core/
│   ├── index.ts               # 核心模块导出
│   ├── parser/
│   │   ├── ast.d.ts          # AST 类型定义
│   │   ├── lexer.ts          # 词法分析器
│   │   └── parser.ts         # 语法解析器
│   ├── rules/
│   │   ├── rule.d.ts         # 规则接口定义
│   │   ├── rule-engine.ts    # 规则引擎
│   │   ├── no-unknown-command.ts      # 未知命令检查
│   │   └── correct-arg-types.ts       # 参数类型检查
│   └── specs/
│       ├── spec-registry.ts           # 命令规范注册表
│       └── commandSignatures.json     # GeoGebra 命令签名数据（505+ 命令）
└── types/
    └── linting.ts            # Lint 相关类型定义
```

## 使用方法

```typescript
import {
  RuleEngine,
  noUnknownCommand,
  correctArgTypes,
  LintResult,
} from "@/lib/geogebra-lint-core"

// 创建规则引擎
const engine = new RuleEngine({
  rules: {
    'no-unknown-command': 'error',
    'correct-arg-types': 'warn'
  }
})

// 注册规则
engine.registerRules([noUnknownCommand, correctArgTypes])

// 检查代码
const result = engine.lint('A = (0, 0)')
console.log(result.errorCount, result.warningCount)
```

## 主要功能

- **词法分析**: 将 GeoGebra 命令分解为 tokens
- **语法解析**: 构建抽象语法树（AST）
- **规则检查**: 
  - 检测未知命令
  - 验证参数类型
  - 支持自定义规则
- **命令规范**: 内置 505+ GeoGebra 命令签名

## 集成方式

该库直接作为 TypeScript 源代码集成到主项目中，无需单独构建或打包。所有导入都使用 `@/lib/geogebra-lint-core` 路径别名。

## 特性支持

- ✅ 点字面量: `A = (0, 0)`, `B = (1, 2, 3)`
- ✅ 列表字面量: `list = {1, 2, 3}`
- ✅ 函数调用: `Point(1, 2)`
- ✅ 变量赋值: `x = 5`
- ✅ 命令验证: 检查 505+ 内置命令
