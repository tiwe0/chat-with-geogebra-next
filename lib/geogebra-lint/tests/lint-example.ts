import {
    RuleEngine,
    formatLintResults,
    noUnknownCommand,
    correctArgTypes,
    specRegistry
} from '../src/core';

console.log('=== GeoGebra Lint Engine 演示 ===\n');

// 1. 显示命令规范信息
console.log('📚 命令规范统计:');
console.log(`  总命令数: ${specRegistry.getCommandCount()}`);
console.log(`  示例命令: ${specRegistry.getAllCommandNames().slice(0, 5).join(', ')}...\n`);

// 2. 创建 Lint 引擎并注册规则
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

console.log(`✅ 已注册 ${engine.getRuleCount()} 个规则\n`);

// 3. 测试用例
const testCases = [
    {
        name: '✅ 正确的代码',
        code: `
SetValue(a, 1)
Point(P, 0, 0)
SetColor(P, "red")
        `
    },
    {
        name: '❌ 未知命令',
        code: `
UnknownCommand(a, 1)
SetValu(b, 2)
        `
    },
    {
        name: '⚠️ 参数数量错误',
        code: `
SetValue(a)
Point(P, 0, 0, 0, 0)
        `
    },
    {
        name: '⚠️ 参数类型警告',
        code: `
SetValue("string", "string")
SetColor(123, 456)
        `
    },
    {
        name: '✅ 复杂示例',
        code: `
// 创建点
P = Point(0, 0)
Q = Point(3, 4)

// 设置属性
SetColor(P, "red")
SetVisible(Q, true)

// 创建列表
myList = {1, 2, 3}

// 嵌套调用
SetValue(distance, Distance(P, Q))
        `
    }
];

// 4. 运行测试
testCases.forEach((testCase, index) => {
    console.log(`${'='.repeat(60)}`);
    console.log(`测试 ${index + 1}: ${testCase.name}`);
    console.log(`${'='.repeat(60)}`);
    console.log('\n代码:');
    console.log(testCase.code);
    console.log('\n结果:');

    const result = engine.lint(testCase.code);
    console.log(formatLintResults(result));
    
    console.log('\n');
});

// 5. 命令规范查询示例
console.log(`${'='.repeat(60)}`);
console.log('📖 命令规范查询示例');
console.log(`${'='.repeat(60)}\n`);

const commandsToCheck = ['SetValue', 'Point', 'SetColor', 'Distance'];

commandsToCheck.forEach(cmdName => {
    const specs = specRegistry.getCommandSpecs(cmdName);
    if (specs && specs.length > 0) {
        const spec = specs[0];
        console.log(`命令: ${cmdName}`);
        console.log(`  签名: ${spec.signature}`);
        console.log(`  描述: ${spec.description}`);
        console.log(`  参数数量: ${spec.parameters.length}`);
        
        if (spec.parameters.length > 0) {
            console.log('  参数:');
            spec.parameters.forEach((param, idx) => {
                console.log(`    ${idx + 1}. ${param.type}${param.optional ? ' (可选)' : ''}`);
            });
        }
        
        if (spec.examples.length > 0) {
            console.log('  示例:');
            spec.examples.forEach(ex => {
                if (ex.command) {
                    console.log(`    ${ex.command}`);
                }
            });
        }
        
        console.log('');
    }
});

// 6. 统计信息
console.log(`${'='.repeat(60)}`);
console.log('📊 统计信息');
console.log(`${'='.repeat(60)}\n`);

let totalErrors = 0;
let totalWarnings = 0;

testCases.forEach(testCase => {
    const result = engine.lint(testCase.code);
    totalErrors += result.errorCount;
    totalWarnings += result.warningCount;
});

console.log(`总测试用例: ${testCases.length}`);
console.log(`总错误数: ${totalErrors}`);
console.log(`总警告数: ${totalWarnings}`);
console.log(`\n✨ 演示完成！`);
