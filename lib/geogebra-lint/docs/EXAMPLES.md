# GeoGebra Parser 使用示例

## 示例 1: 基本使用

```typescript
import { parseGeoGebraScript } from './src/core/parser/parser';

const code = `SetValue(a, 1)`;
const ast = parseGeoGebraScript(code);

console.log(ast);
// 输出:
// {
//   type: 'Program',
//   body: [
//     {
//       type: 'CommandStatement',
//       commandName: { type: 'Identifier', name: 'SetValue', ... },
//       arguments: [...]
//     }
//   ],
//   loc: { start: {...}, end: {...} }
// }
```

## 示例 2: 解析多个命令

```typescript
import { parseGeoGebraScript } from './src/core/parser/parser';

const script = `
// 创建点
P = Point(0, 0)
Q = Point(3, 4)

// 设置属性
SetColor(P, "red")
SetVisible(Q, true)
`;

const ast = parseGeoGebraScript(script);

// 遍历所有命令
ast.body.forEach((command, index) => {
    console.log(`命令 ${index + 1}: ${command.commandName.name}`);
    console.log(`  参数数量: ${command.arguments.length}`);
    
    command.arguments.forEach((arg, argIndex) => {
        console.log(`  参数 ${argIndex + 1}: ${arg.type}`);
        
        if (arg.type === 'NumberLiteral') {
            console.log(`    值: ${arg.value}`);
        } else if (arg.type === 'StringLiteral') {
            console.log(`    值: "${arg.value}"`);
        } else if (arg.type === 'Identifier') {
            console.log(`    名称: ${arg.name}`);
        }
    });
});
```

## 示例 3: 词法分析

```typescript
import { Lexer, TokenType } from './src/core/parser/lexer';

const code = `SetValue(a, 123)`;
const lexer = new Lexer(code);
const tokens = lexer.tokenize();

tokens.forEach(token => {
    console.log(`${token.type}: "${token.value}" at ${token.position.line}:${token.position.column}`);
});

// 输出:
// IDENTIFIER: "SetValue" at 1:1
// LPAREN: "(" at 1:9
// IDENTIFIER: "a" at 1:10
// COMMA: "," at 1:11
// NUMBER: "123" at 1:13
// RPAREN: ")" at 1:16
// EOF: "" at 1:17
```

## 示例 4: 错误处理

```typescript
import { parseGeoGebraScript, ParseError } from './src/core/parser/parser';

try {
    const ast = parseGeoGebraScript('SetValue(a, ');
} catch (error) {
    if (error instanceof ParseError) {
        console.error('解析错误:', error.message);
        console.error('位置:', error.position);
    }
}
```

## 示例 5: AST 遍历

```typescript
import { parseGeoGebraScript, ASTNode, Expression } from './src/core/index';

const code = `SetValue(a, x(b))`;
const ast = parseGeoGebraScript(code);

// 递归遍历 AST 节点
function visitNode(node: any, depth: number = 0) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}${node.type}`);
    
    // 遍历子节点
    if (node.body) {
        node.body.forEach((child: any) => visitNode(child, depth + 1));
    }
    if (node.arguments) {
        node.arguments.forEach((child: any) => visitNode(child, depth + 1));
    }
    if (node.commandName) {
        visitNode(node.commandName, depth + 1);
    }
    if (node.callee) {
        visitNode(node.callee, depth + 1);
    }
    if (node.elements) {
        node.elements.forEach((child: any) => visitNode(child, depth + 1));
    }
}

visitNode(ast);

// 输出:
// Program
//   CommandStatement
//     Identifier
//     Identifier
//     FunctionCall
//       Identifier
//       Identifier
```

## 示例 6: 提取所有命令名

```typescript
import { parseGeoGebraScript } from './src/core/parser/parser';

const script = `
SetValue(a, 1)
Point(P, 0, 0)
SetColor(P, "red")
Distance(P, Q)
`;

const ast = parseGeoGebraScript(script);

// 提取所有命令名
const commandNames = ast.body.map(cmd => cmd.commandName.name);
console.log('使用的命令:', commandNames);
// 输出: ['SetValue', 'Point', 'SetColor', 'Distance']

// 统计命令使用频率
const commandCounts = commandNames.reduce((acc, name) => {
    acc[name] = (acc[name] || 0) + 1;
    return acc;
}, {} as Record<string, number>);

console.log('命令统计:', commandCounts);
```

## 示例 7: 分析列表字面量

```typescript
import { parseGeoGebraScript } from './src/core/parser/parser';

const code = `myList = {1, 2, 3, 4, 5}`;
const ast = parseGeoGebraScript(code);

const listArg = ast.body[0].arguments[0];

if (listArg.type === 'ListLiteral') {
    console.log('列表元素数量:', listArg.elements.length);
    console.log('元素:');
    
    listArg.elements.forEach((element, index) => {
        if (element.type === 'NumberLiteral') {
            console.log(`  [${index}]: ${element.value}`);
        }
    });
}
```

## 示例 8: 检查嵌套调用

```typescript
import { parseGeoGebraScript } from './src/core/parser/parser';

const code = `SetValue(a, x(Point(1, 2)))`;
const ast = parseGeoGebraScript(code);

function findNestedCalls(node: any, depth: number = 0): void {
    if (node.type === 'FunctionCall') {
        console.log(`${'  '.repeat(depth)}调用: ${node.callee.name}`);
        node.arguments.forEach((arg: any) => findNestedCalls(arg, depth + 1));
    }
    if (node.arguments) {
        node.arguments.forEach((arg: any) => findNestedCalls(arg, depth));
    }
}

console.log('嵌套调用结构:');
findNestedCalls(ast);
```

## 运行示例

### 使用 ts-node (推荐)

```bash
npm install -g ts-node
ts-node tests/parser-example.ts
```

### 使用编译后的代码

```bash
npm run build
node tests/parser-example.js
```

## 完整的 Lint 检查示例

```typescript
import { parseGeoGebraScript, ParseError } from './src/core/parser/parser';

function lintGeoGebraScript(code: string) {
    const errors: string[] = [];
    
    try {
        const ast = parseGeoGebraScript(code);
        
        // 检查每个命令
        ast.body.forEach((command, index) => {
            const cmdName = command.commandName.name;
            const lineNum = command.loc.start.line;
            
            // 示例规则: 检查命令名是否以大写字母开头
            if (cmdName[0] !== cmdName[0].toUpperCase()) {
                errors.push(
                    `行 ${lineNum}: 命令名 "${cmdName}" 应该以大写字母开头`
                );
            }
            
            // 示例规则: 检查是否有参数
            if (command.arguments.length === 0) {
                errors.push(
                    `行 ${lineNum}: 命令 "${cmdName}" 没有参数`
                );
            }
        });
        
    } catch (error) {
        if (error instanceof ParseError) {
            errors.push(`解析错误: ${error.message}`);
        }
    }
    
    return errors;
}

// 使用
const script = `
setvalue(a, 1)
Point()
SetColor(P, "red")
`;

const lintErrors = lintGeoGebraScript(script);

if (lintErrors.length > 0) {
    console.log('发现以下问题:');
    lintErrors.forEach(err => console.log(`  - ${err}`));
} else {
    console.log('✓ 没有发现问题');
}
```
