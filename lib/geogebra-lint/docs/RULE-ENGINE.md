# Rule Engine 使用指南

## 概述

Rule Engine 是 GeoGebra Lint 引擎的核心组件，负责执行代码检查规则并生成 lint 消息。

## 架构

```
┌─────────────────┐
│  GeoGebra 代码  │
└────────┬────────┘
         │
         ▼
    ┌─────────┐
    │ Parser  │  解析为 AST
    └────┬────┘
         │
         ▼
  ┌──────────────┐
  │ Rule Engine  │  执行规则
  └──────┬───────┘
         │
    ┌────┴────┐
    │  Rules  │
    │  ├─ no-unknown-command
    │  └─ correct-arg-types
    └────┬────┘
         │
         ▼
  ┌─────────────┐
  │ LintResult  │  错误和警告
  └─────────────┘
```

## 核心组件

### 1. RuleEngine

规则引擎负责：
- 注册和管理规则
- 遍历 AST
- 收集 lint 消息
- 应用配置

```typescript
import { RuleEngine } from './src/core';

const engine = new RuleEngine({
    rules: {
        'no-unknown-command': 'error',
        'correct-arg-types': 'warn'
    }
});
```

### 2. Rule 接口

每个规则必须实现 `Rule` 接口：

```typescript
interface Rule {
    id: string;                    // 规则唯一标识
    description: string;           // 规则描述
    defaultSeverity: LintSeverity; // 默认严重程度
    category: string;              // 规则分类
    create(context: RuleContext): RuleVisitor;
    meta?: { fixable?: boolean };  // 元数据
}
```

### 3. RuleContext

规则上下文提供给规则的工具：

```typescript
interface RuleContext {
    report(options: {
        node: ASTNode;
        message: string;
        severity?: LintSeverity;
        suggestions?: string[];
    }): void;
    
    getSourceCode(): string;
    getProgram(): Program;
    options: any;
}
```

### 4. SpecRegistry

命令规范注册表：

```typescript
import { specRegistry } from './src/core';

// 检查命令是否存在
specRegistry.hasCommand('SetValue'); // true

// 获取命令规范
const specs = specRegistry.getCommandSpecs('SetValue');

// 查找最佳匹配
const spec = specRegistry.findBestMatch('SetValue', 2);
```

## 内置规则

### no-unknown-command

检测未知的 GeoGebra 命令。

**配置：**
```typescript
{
    'no-unknown-command': 'error' // 'off' | 'warn' | 'error'
}
```

**示例：**

```geogebra
// ❌ 错误
UnknownCommand(a, 1)

// ✅ 正确
SetValue(a, 1)
```

**特性：**
- 基于 commandSignatures.json
- 提供相似命令建议（使用编辑距离算法）
- 支持 8000+ GeoGebra 命令

### correct-arg-types

检查命令参数类型和数量。

**配置：**
```typescript
{
    'correct-arg-types': 'warn'
}
```

**示例：**

```geogebra
// ❌ 参数数量错误
SetValue(a)

// ❌ 参数类型警告
SetValue("string", "string")

// ✅ 正确
SetValue(a, 1)
```

**特性：**
- 检查参数数量
- 推断参数类型
- 检查类型兼容性
- 支持命令重载

## 使用示例

### 基本使用

```typescript
import {
    RuleEngine,
    noUnknownCommand,
    correctArgTypes
} from './src/core';

// 1. 创建引擎
const engine = new RuleEngine({
    rules: {
        'no-unknown-command': 'error',
        'correct-arg-types': 'warn'
    }
});

// 2. 注册规则
engine.registerRules([
    noUnknownCommand,
    correctArgTypes
]);

// 3. 运行 lint
const code = `
SetValue(a, 1)
UnknownCommand(b, 2)
`;

const result = engine.lint(code);

// 4. 处理结果
console.log(`错误: ${result.errorCount}`);
console.log(`警告: ${result.warningCount}`);

result.messages.forEach(msg => {
    console.log(`${msg.severity}: ${msg.message}`);
});
```

### 格式化输出

```typescript
import { formatLintResults } from './src/core';

const result = engine.lint(code);
console.log(formatLintResults(result));
```

输出：
```
发现 1 个错误，0 个警告：

1. ❌ [no-unknown-command] 未知的命令 "UnknownCommand"
   位置: 行 3:1
   建议: 你是否想使用: UnknownFunction?
```

### 自定义规则

```typescript
import { Rule, LintSeverity } from './src/core';

const myCustomRule: Rule = {
    id: 'my-custom-rule',
    description: '我的自定义规则',
    defaultSeverity: LintSeverity.Warning,
    category: 'warning',

    create(context) {
        return {
            CommandStatement(node, ctx) {
                // 检查逻辑
                if (node.commandName.name === 'BadCommand') {
                    ctx.report({
                        node: node.commandName,
                        message: '不应该使用 BadCommand',
                        suggestions: ['使用 GoodCommand 代替']
                    });
                }
            }
        };
    }
};

// 注册自定义规则
engine.registerRule(myCustomRule);
```

### 规则配置

```typescript
const engine = new RuleEngine({
    rules: {
        // 关闭规则
        'no-unknown-command': 'off',
        
        // 警告级别
        'correct-arg-types': 'warn',
        
        // 错误级别
        'my-custom-rule': 'error',
        
        // 带选项的配置
        'my-rule': [LintSeverity.Warning, {
            option1: true,
            option2: 'value'
        }]
    }
});
```

## 命令规范查询

### 查询命令信息

```typescript
import { specRegistry } from './src/core';

// 检查命令是否存在
if (specRegistry.hasCommand('SetValue')) {
    // 获取规范
    const specs = specRegistry.getCommandSpecs('SetValue');
    
    specs?.forEach(spec => {
        console.log(`签名: ${spec.signature}`);
        console.log(`描述: ${spec.description}`);
        console.log(`参数数量: ${spec.parameters.length}`);
        
        spec.parameters.forEach((param, i) => {
            console.log(`  参数 ${i + 1}: ${param.type}`);
        });
    });
}
```

### 查找最佳匹配

```typescript
// 查找参数数量匹配的重载
const spec = specRegistry.findBestMatch('SetValue', 2);

if (spec) {
    console.log(`最佳匹配: ${spec.signature}`);
}
```

### 获取所有命令

```typescript
const allCommands = specRegistry.getAllCommandNames();
console.log(`总命令数: ${allCommands.length}`);
console.log(`命令列表: ${allCommands.slice(0, 10).join(', ')}...`);
```

## API 参考

### LintResult

```typescript
interface LintResult {
    filePath?: string;        // 文件路径
    source: string;           // 源代码
    messages: LintMessage[];  // Lint 消息
    errorCount: number;       // 错误数
    warningCount: number;     // 警告数
}
```

### LintMessage

```typescript
interface LintMessage {
    ruleId: string;           // 规则 ID
    message: string;          // 消息内容
    severity: LintSeverity;   // 严重程度
    loc: SourceLocation;      // 位置信息
    node?: ASTNode;           // 相关节点
    suggestions?: string[];   // 修复建议
}
```

### LintSeverity

```typescript
enum LintSeverity {
    Error = 'error',
    Warning = 'warning',
    Info = 'info'
}
```

## 运行示例

```bash
# 运行 lint 演示
npm run demo:lint

# 运行测试
npm test

# 运行特定测试
npm test -- rule-engine
npm test -- spec-registry
```

## 性能

- 命令规范加载：一次性加载 8000+ 命令
- AST 遍历：单次遍历执行所有规则
- 内存占用：优化的命令规范存储
- 速度：典型文件 < 10ms

## 扩展性

### 添加新规则

1. 创建规则文件 `src/core/rules/my-rule.ts`
2. 实现 `Rule` 接口
3. 在 `src/core/index.ts` 中导出
4. 注册到引擎

### 自定义命令规范

可以扩展 `SpecRegistry` 来支持自定义命令：

```typescript
class CustomSpecRegistry extends SpecRegistry {
    constructor() {
        super();
        // 添加自定义命令
    }
}
```

## 最佳实践

1. **规则粒度**：保持规则单一职责
2. **性能优化**：避免重复遍历 AST
3. **错误消息**：提供清晰的错误描述和建议
4. **配置灵活性**：允许用户自定义严重程度
5. **测试覆盖**：为每个规则编写完整测试

## 故障排除

### 规则不执行

检查规则配置是否为 `'off'`：

```typescript
{
    'my-rule': 'error' // 确保不是 'off'
}
```

### 命令未识别

检查命令名拼写和大小写：

```typescript
specRegistry.hasCommand('SetValue'); // 注意大小写
```

### 类型检查过于严格

调整规则为 `'warn'` 而不是 `'error'`：

```typescript
{
    'correct-arg-types': 'warn'
}
```

## 总结

Rule Engine 提供了：
- ✅ 完整的规则系统
- ✅ 8000+ GeoGebra 命令支持
- ✅ 灵活的配置系统
- ✅ 详细的错误报告
- ✅ 可扩展的架构

查看更多示例：`tests/lint-example.ts`
