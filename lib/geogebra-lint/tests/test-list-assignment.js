/**
 * 测试列表字面量赋值
 */

const { parseGeoGebraScript } = require('../dist/core');

console.log('测试列表字面量赋值语句...\n');

const testCases = [
    {
        name: '简单列表赋值',
        code: 'A = {1, 2, 3, 4}'
    },
    {
        name: '嵌套列表',
        code: 'B = {{1, 2}, {3, 4}}'
    },
    {
        name: '混合类型列表',
        code: 'C = {1, "hello", true, {2, 3}}'
    },
    {
        name: '多个赋值语句',
        code: `
A = {1, 2, 3}
B = {4, 5, 6}
C = {7, 8, 9}
        `
    },
    {
        name: '列表与命令混合',
        code: `
list = {1, 2, 3, 4, 5}
P = Point({0, 0})
SetColor(P, "red")
        `
    },
    {
        name: '空列表',
        code: 'empty = {}'
    }
];

let passed = 0;
let failed = 0;

testCases.forEach(testCase => {
    try {
        console.log(`✓ ${testCase.name}`);
        console.log(`  代码: ${testCase.code.trim()}`);
        
        const ast = parseGeoGebraScript(testCase.code);
        
        console.log(`  解析成功！`);
        console.log(`  命令数: ${ast.body.length}`);
        
        // 显示解析结果
        ast.body.forEach((cmd, idx) => {
            const cmdName = cmd.commandName.name;
            const argCount = cmd.arguments.length;
            const firstArg = cmd.arguments[0];
            
            if (firstArg && firstArg.type === 'ListLiteral') {
                console.log(`    [${idx}] ${cmdName} = ListLiteral (${firstArg.elements.length} 个元素)`);
            } else {
                console.log(`    [${idx}] ${cmdName}(...${argCount} args)`);
            }
        });
        
        console.log();
        passed++;
    } catch (error) {
        console.log(`✗ ${testCase.name}`);
        console.log(`  代码: ${testCase.code.trim()}`);
        console.log(`  错误: ${error.message}`);
        console.log();
        failed++;
    }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('测试结果汇总');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`总计: ${passed + failed} 个测试`);
console.log(`✓ 通过: ${passed}`);
console.log(`✗ 失败: ${failed}`);
console.log(`成功率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
    console.log('\n🎉 所有测试通过！列表字面量赋值已修复！');
} else {
    console.log('\n⚠️ 仍有测试失败');
    process.exit(1);
}
