# Point 字面量支持

## 功能说明

GeoGebra Lint 现在支持解析 **Point 字面量**（元组语法），例如：

```geogebra
A = (0, 0, 3)
B = (1, 2)
C = (x, y, z)
```

## 技术实现

### 1. 新增 AST 节点类型：`TupleLiteral`

在 `ast.d.ts` 中新增：

```typescript
/**
 * 元组/坐标字面量 (例如: (0, 0, 3) )
 * 用于表示点的坐标或其他元组值
 */
export interface TupleLiteral extends BaseNode {
    type: 'TupleLiteral';
    elements: Expression[]; // 元组中的元素也是表达式
}
```

### 2. 解析器增强

- **自动识别元组 vs 分组表达式**
  - `(0, 0, 3)` → `TupleLiteral` (多个元素)
  - `(5)` → `NumberLiteral` (单个元素，分组表达式)
  - `()` → `TupleLiteral` (空元组)

- **支持的语法**：
  ```geogebra
  # 2D 点
  A = (0, 0)
  
  # 3D 点
  B = (0, 0, 3)
  
  # 带小数
  C = (1.5, 2.7, -3.2)
  
  # 混合变量和字面量
  D = (a, 1, 2)
  
  # 嵌套元组
  E = ((1, 2), (3, 4))
  
  # 分组表达式（单元素）
  x = (5)  # 解析为 NumberLiteral
  ```

### 3. 解析示例

```javascript
const { parseGeoGebraScript } = require('./dist/index.js');

const ast = parseGeoGebraScript('A = (0, 0, 3)');

// 输出：
{
  "type": "Program",
  "body": [{
    "type": "CommandStatement",
    "commandName": { "type": "Identifier", "name": "A" },
    "arguments": [{
      "type": "TupleLiteral",  // ← 元组类型
      "elements": [
        { "type": "NumberLiteral", "value": 0 },
        { "type": "NumberLiteral", "value": 0 },
        { "type": "NumberLiteral", "value": 3 }
      ]
    }]
  }]
}
```

## 使用方法

### 在聊天中使用

你现在可以在聊天中使用这种语法：

**用户输入：**
```
请创建一些点：
`ggb:A = (0, 0, 0)`
`ggb:B = (3, 4, 0)`
`ggb:C = (0, 0, 5)`
```

**解析结果：**
- ✅ 正确识别为点的坐标赋值
- ✅ 每个坐标值被解析为独立的数字字面量
- ✅ 整体结构作为元组字面量
- ✅ **不会报错** "未知命令" (已修复)

### Lint 检查

Lint 引擎现在**正确处理**这些表达式：

```geogebra
A = (0, 0, 3)    # ✅ 通过 - 识别为变量赋值
B = (1, 2)       # ✅ 通过 - 点字面量赋值
C = {1, 2, 3}    # ✅ 通过 - 列表赋值
x = 5            # ✅ 通过 - 数字赋值
D = E            # ✅ 通过 - 变量赋值
```

**工作原理**：
- Lint 规则检测到赋值语句（只有一个参数）
- 检查参数类型是否为字面量（TupleLiteral、ListLiteral、NumberLiteral 等）
- 如果是字面量，跳过"未知命令"检查
- 因此 `A = (0, 0, 3)` 不会被误报为"未知命令 A"

### 正确的用法

**推荐方式 1：使用字面量语法（简洁）**
```geogebra
# 点字面量 - 现在完全支持！
A = (0, 0, 0)
B = (3, 4, 0)
C = (1.5, 2.7, -3)
```

**推荐方式 2：使用 Point 命令（明确）**
```geogebra
# Point 命令
A = Point(0, 0, 0)
B = Point(3, 4, 0)
```

**推荐方式 3：直接命名点**
```geogebra
# 直接创建命名点
Point(A, 0, 0, 0)
Point(B, 3, 4, 0)
```

所有三种方式现在都能正确通过 lint 检查！

## 测试验证

所有测试已通过：

✅ 2D 点: `A = (0, 0)` → `TupleLiteral` with 2 elements  
✅ 3D 点: `A = (0, 0, 3)` → `TupleLiteral` with 3 elements  
✅ 分组表达式: `x = (5)` → `NumberLiteral` (not TupleLiteral)  
✅ 混合元素: `C = (a, 1, 2)` → `TupleLiteral` with mixed types  
✅ 空元组: `D = ()` → `TupleLiteral` with 0 elements  
✅ 嵌套元组: `E = ((1, 2), (3, 4))` → Nested `TupleLiteral`

## 相关文件

- `lib/geogebra-lint/src/core/parser/ast.d.ts` - AST 类型定义
- `lib/geogebra-lint/src/core/parser/parser.ts` - 解析器实现
- `lib/geogebra-lint/src/core/index.ts` - 类型导出
- `lib/geogebra-lint/tests/tuple-literal-test.ts` - 测试用例

## 更新日志

**2025-12-08**
- ✅ 新增 `TupleLiteral` AST 节点类型
- ✅ 解析器支持 `(expr, expr, ...)` 语法
- ✅ 自动区分元组和分组表达式
- ✅ 支持嵌套元组
- ✅ **修复 lint 规则**：变量赋值不再误报为"未知命令"
- ✅ 完整测试验证

### 修复详情

**问题**: `A = (0, 0)` 会报错 "未知的命令 A"

**原因**: 赋值语句被解析为 `CommandStatement`，左侧的 `A` 被当作命令名

**解决方案**: 
- 在 `no-unknown-command` 规则中添加特殊处理
- 检测赋值语句（只有一个参数的命令）
- 如果参数是字面量类型（TupleLiteral、ListLiteral 等），跳过命令检查
- 支持的字面量类型：
  - `TupleLiteral` - 如 `(0, 0, 3)`
  - `ListLiteral` - 如 `{1, 2, 3}`
  - `NumberLiteral` - 如 `5`
  - `StringLiteral` - 如 `"text"`
  - `BooleanLiteral` - 如 `true`
  - `Identifier` - 如 `B` (变量赋值)

## 未来改进

- [ ] 添加针对点坐标的特定 lint 规则
- [ ] 支持点坐标类型检查（2D vs 3D）
- [ ] 提供坐标格式的自动建议
- [ ] 集成到 IDE 的代码补全功能
