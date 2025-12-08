/**
 * GeoGebra Lint Engine - 完整集成测试示例
 * 
 * 这个文件展示了如何使用完整的 lint 引擎：
 * 1. 词法分析 (Lexer)
 * 2. 语法分析 (Parser)
 * 3. 规则检查 (Rule Engine)
 * 4. 结果展示
 */

import {
    Lexer,
    parseGeoGebraScript,
    RuleEngine,
    noUnknownCommand,
    correctArgTypes,
    formatLintResults,
    specRegistry,
    LintSeverity
} from '../src/core';

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║     GeoGebra Lint Engine - 完整集成测试                 ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log();

// ============================================
// 第一部分：词法分析演示
// ============================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 第一部分：词法分析 (Lexer)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log();

const sampleCode = `
// 创建几何对象
P = Point(0, 0)
Q = Point(3, 4)

// 设置样式
SetColor(P, "red")
SetVisibleInView(Q, 1, true)

// 计算距离
d = Distance(P, Q)
`;

console.log('源代码：');
console.log(sampleCode);

const lexer = new Lexer(sampleCode);
const tokens = lexer.tokenize();

console.log('\n生成的 Tokens：');
console.log('─────────────────────────────────────────────────────────────');
let tokenIndex = 0;
tokens.forEach(token => {
    if (token.type !== 'NEWLINE' && token.type !== 'EOF') {
        const posInfo = `[${token.position.line}:${token.position.column}]`;
        const typeInfo = String(token.type).padEnd(15);
        console.log(`${String(tokenIndex++).padStart(3)}. ${posInfo.padEnd(10)} ${typeInfo} "${token.value}"`);
    }
});
console.log(`\n✓ 总共生成 ${tokens.filter(t => t.type !== 'NEWLINE').length} 个有效 tokens\n`);

// ============================================
// 第二部分：语法分析演示
// ============================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🌲 第二部分：语法分析 (Parser)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log();

const ast = parseGeoGebraScript(sampleCode);

console.log('抽象语法树 (AST) 结构：');
console.log('─────────────────────────────────────────────────────────────');
console.log(`Program (${ast.body.length} 个命令)`);

ast.body.forEach((command, index) => {
    const cmdName = command.commandName.name;
    const argCount = command.arguments.length;
    const location = `[${command.loc.start.line}:${command.loc.start.column}]`;
    
    console.log(`  ${index + 1}. ${cmdName}() ${location}`);
    console.log(`     参数: ${argCount} 个`);
    
    command.arguments.forEach((arg, argIdx) => {
        let argInfo = `        [${argIdx}] ${arg.type}`;
        
        if (arg.type === 'Identifier') {
            argInfo += ` (${(arg as any).name})`;
        } else if (arg.type === 'NumberLiteral') {
            argInfo += ` (${(arg as any).value})`;
        } else if (arg.type === 'StringLiteral') {
            argInfo += ` ("${(arg as any).value}")`;
        } else if (arg.type === 'BooleanLiteral') {
            argInfo += ` (${(arg as any).value})`;
        } else if (arg.type === 'FunctionCall') {
            argInfo += ` (${(arg as any).callee.name}(...))`;
        }
        
        console.log(argInfo);
    });
});

console.log(`\n✓ 成功解析 ${ast.body.length} 个命令\n`);

// ============================================
// 第三部分：规则引擎演示
// ============================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚙️  第三部分：规则引擎 (Rule Engine)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log();

// 创建规则引擎
const engine = new RuleEngine({
    rules: {
        'no-unknown-command': 'error',
        'correct-arg-types': 'warn'
    }
});

engine.registerRules([
    noUnknownCommand,
    correctArgTypes
]);

console.log(`✓ 已注册 ${engine.getRuleCount()} 个规则`);
console.log(`✓ 命令规范数据库包含 ${specRegistry.getCommandCount()} 个 GeoGebra 命令\n`);

// ============================================
// 第四部分：测试用例
// ============================================
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 第四部分：测试用例');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log();

const testCases = [
    {
        name: '测试 1: 正确的代码',
        code: `
// 正确的 GeoGebra 命令
A = Point({0, 0})
B = Point({3, 4})
d = Distance(A, B)
        `,
        expectErrors: 0,
        expectWarnings: 0
    },
    {
        name: '测试 2: 未知命令',
        code: `
UnknownCommand(a, 1)
InvalidFunction(x, y)
SetValu(obj, 5)
        `,
        expectErrors: 3,
        expectWarnings: 0
    },
    {
        name: '测试 3: 参数数量错误',
        code: `
Distance(A)
SetColor(P)
Point()
        `,
        expectErrors: 0,
        expectWarnings: 3
    },
    {
        name: '测试 4: 混合错误',
        code: `
// 未知命令
WrongCommand(a, b)

// 参数数量错误
Distance(A)

// 正确的命令
SetVisibleInView(obj, 1, true)
        `,
        expectErrors: 1,
        expectWarnings: 1
    },
    {
        name: '测试 5: 复杂嵌套',
        code: `
// 嵌套函数调用
result = Distance(Point({0, 0}), Point({3, 4}))

// 列表参数
myList = {1, 2, 3, 4, 5}

// 多行脚本
P = Point({1, 2})
SetColor(P, "blue")
SetLineThickness(P, 3)
        `,
        expectErrors: 0,
        expectWarnings: 0
    },
    {
        name: '测试 6: 注释和空行',
        code: `
// 这是注释

// 创建点
A = Point({0, 0})

// 空行上方

B = Point({1, 1})
        `,
        expectErrors: 0,
        expectWarnings: 0
    }
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase) => {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`${testCase.name}`);
    console.log(`${'─'.repeat(60)}`);
    console.log('\n代码：');
    console.log(testCase.code);
    console.log('\n检查结果：');
    
    const result = engine.lint(testCase.code);
    
    totalTests++;
    
    // 验证期望结果
    const errorMatch = result.errorCount === testCase.expectErrors;
    const warningMatch = result.warningCount === testCase.expectWarnings;
    const testPassed = errorMatch && warningMatch;
    
    if (testPassed) {
        passedTests++;
        console.log(`✅ 测试通过`);
    } else {
        failedTests++;
        console.log(`❌ 测试失败`);
    }
    
    console.log(`   期望: ${testCase.expectErrors} 个错误, ${testCase.expectWarnings} 个警告`);
    console.log(`   实际: ${result.errorCount} 个错误, ${result.warningCount} 个警告`);
    
    if (result.messages.length > 0) {
        console.log('\n详细信息：');
        result.messages.forEach((msg, msgIdx) => {
            const icon = msg.severity === LintSeverity.Error ? '❌' : 
                        msg.severity === LintSeverity.Warning ? '⚠️' : 'ℹ️';
            const location = `[${msg.loc.start.line}:${msg.loc.start.column}]`;
            console.log(`   ${msgIdx + 1}. ${icon} ${msg.ruleId}`);
            console.log(`      ${location} ${msg.message}`);
            if (msg.suggestions && msg.suggestions.length > 0) {
                console.log(`      💡 ${msg.suggestions[0]}`);
            }
        });
    }
});

// ============================================
// 第五部分：命令规范查询演示
// ============================================
console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📚 第五部分：命令规范查询');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log();

const commandsToQuery = ['Point', 'Distance', 'SetColor', 'SetVisibleInView'];

commandsToQuery.forEach(cmdName => {
    const specs = specRegistry.getCommandSpecs(cmdName);
    if (specs && specs.length > 0) {
        const spec = specs[0];
        console.log(`\n命令: ${cmdName}`);
        console.log(`${'─'.repeat(60)}`);
        console.log(`签名: ${spec.signature}`);
        console.log(`描述: ${spec.description}`);
        console.log(`参数数量: ${spec.parameters.length}`);
        
        if (spec.parameters.length > 0) {
            console.log('参数详情:');
            spec.parameters.forEach((param, idx) => {
                const altInfo = param.alternatives ? ` (备选: ${param.alternatives.join(', ')})` : '';
                console.log(`  ${idx + 1}. ${param.type}${altInfo}`);
            });
        }
        
        if (spec.examples.length > 0 && spec.examples[0].command) {
            console.log('示例:');
            spec.examples.slice(0, 2).forEach(ex => {
                if (ex.command) {
                    console.log(`  ${ex.command}`);
                }
            });
        }
    }
});

// ============================================
// 第六部分：错误恢复演示
// ============================================
console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 第六部分：错误恢复');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log();

const errorCode = `
Point(A, 1
SetColor(P, "red")
`;

console.log('包含语法错误的代码：');
console.log(errorCode);
console.log('\n处理结果：');

const errorResult = engine.lint(errorCode);
console.log(formatLintResults(errorResult));

// ============================================
// 第七部分：性能测试
// ============================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚡ 第七部分：性能测试');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log();

// 生成大量代码进行性能测试
const largeCode = Array.from({ length: 100 }, (_, i) => 
    `P${i} = Point({${i}, ${i}})\nSetColor(P${i}, "red")`
).join('\n');

console.log(`测试代码: 100 个点的创建和样式设置 (200 行)`);

const startTime = Date.now();
const perfResult = engine.lint(largeCode);
const endTime = Date.now();

console.log(`\n性能结果:`);
console.log(`  解析时间: ${endTime - startTime}ms`);
console.log(`  处理命令数: ${perfResult.source.split('\n').filter(l => l.trim()).length}`);
console.log(`  发现问题: ${perfResult.errorCount + perfResult.warningCount} 个`);
console.log(`  平均速度: ${((endTime - startTime) / 200).toFixed(2)}ms/行`);

// ============================================
// 测试总结
// ============================================
console.log('\n\n╔═══════════════════════════════════════════════════════════╗');
console.log('║                    测试总结                              ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log();

console.log(`📊 测试统计:`);
console.log(`   总测试数: ${totalTests}`);
console.log(`   ✅ 通过: ${passedTests}`);
console.log(`   ❌ 失败: ${failedTests}`);
console.log(`   成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log();

console.log(`🎯 功能验证:`);
console.log(`   ✓ 词法分析 (Lexer)`);
console.log(`   ✓ 语法分析 (Parser)`);
console.log(`   ✓ 规则引擎 (Rule Engine)`);
console.log(`   ✓ 命令规范查询 (Spec Registry)`);
console.log(`   ✓ 错误恢复`);
console.log(`   ✓ 性能测试`);
console.log();

console.log(`📦 系统信息:`);
console.log(`   支持的命令数: ${specRegistry.getCommandCount()}`);
console.log(`   注册的规则数: ${engine.getRuleCount()}`);
console.log(`   词法 Token 类型: 14 种`);
console.log(`   AST 节点类型: 9 种`);
console.log();

if (failedTests === 0) {
    console.log('🎉 所有测试通过！GeoGebra Lint Engine 运行正常！');
} else {
    console.log(`⚠️  有 ${failedTests} 个测试失败，请检查实现。`);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('测试完成！');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
