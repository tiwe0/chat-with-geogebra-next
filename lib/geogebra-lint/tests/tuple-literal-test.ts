/**
 * 测试 Point 字面量解析
 * 验证 A = (0, 0, 3) 这样的语法是否能正确解析
 */

import { parseGeoGebraScript, RuleEngine, noUnknownCommand, correctArgTypes, formatLintResults } from '../src/core';

console.log('🧪 测试 Point 字面量解析\n');

// 测试用例
const testCases = [
    {
        name: '2D 点字面量',
        code: 'A = (0, 0)',
        expected: 'TupleLiteral with 2 elements'
    },
    {
        name: '3D 点字面量',
        code: 'A = (0, 0, 3)',
        expected: 'TupleLiteral with 3 elements'
    },
    {
        name: '带小数的点字面量',
        code: 'B = (1.5, 2.7, -3.2)',
        expected: 'TupleLiteral with 3 elements'
    },
    {
        name: '分组表达式（单个元素）',
        code: 'x = (5)',
        expected: 'NumberLiteral (not TupleLiteral)'
    },
    {
        name: '混合使用变量和字面量',
        code: 'C = (a, 1, 2)',
        expected: 'TupleLiteral with identifier and numbers'
    },
    {
        name: '空元组',
        code: 'D = ()',
        expected: 'Empty TupleLiteral'
    },
    {
        name: '嵌套元组',
        code: 'E = ((1, 2), (3, 4))',
        expected: 'TupleLiteral with nested TupleLiterals'
    }
];

// 运行测试
testCases.forEach((testCase, index) => {
    console.log(`\n测试 ${index + 1}: ${testCase.name}`);
    console.log('=' .repeat(60));
    console.log(`代码: ${testCase.code}`);
    console.log(`预期: ${testCase.expected}`);
    console.log('-'.repeat(60));
    
    try {
        const ast = parseGeoGebraScript(testCase.code);
        console.log('✅ 解析成功!');
        console.log('\nAST 结构:');
        console.log(JSON.stringify(ast, null, 2));
        
        // 检查是否正确识别为 TupleLiteral
        if (ast.body.length > 0) {
            const statement = ast.body[0];
            if (statement.type === 'CommandStatement' && statement.arguments.length > 0) {
                const arg = statement.arguments[0];
                console.log(`\n✓ 参数类型: ${arg.type}`);
                
                if (arg.type === 'TupleLiteral') {
                    console.log(`✓ 元组元素数量: ${arg.elements.length}`);
                    console.log(`✓ 元素类型: ${arg.elements.map((e: any) => e.type).join(', ')}`);
                }
            }
        }
        
    } catch (error) {
        console.log('❌ 解析失败:');
        console.log(error);
    }
});

console.log('\n\n' + '='.repeat(60));
console.log('🔍 测试 Lint 检查');
console.log('='.repeat(60));

// 创建 lint 引擎
const engine = new RuleEngine({
    rules: {
        'no-unknown-command': 'error',
        'correct-arg-types': 'error'
    }
});

engine.registerRules([noUnknownCommand, correctArgTypes]);

// 测试 lint 是否正常工作
const lintTestCases = [
    'A = (0, 0, 3)',
    'B = Point(1, 2)',
    'C = (x, y, z)'
];

lintTestCases.forEach((code, index) => {
    console.log(`\nLint 测试 ${index + 1}: ${code}`);
    console.log('-'.repeat(60));
    
    const result = engine.lint(code);
    
    if (result.errorCount === 0 && result.warningCount === 0) {
        console.log('✅ 没有发现问题');
    } else {
        console.log(formatLintResults(result));
    }
});

console.log('\n\n🎉 所有测试完成!');
