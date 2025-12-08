#!/usr/bin/env node

/**
 * GeoGebra Lint CLI
 * 用于测试 parser 和 lexer 的命令行工具
 */

const fs = require('fs');
const path = require('path');

// 注意：这个脚本需要在编译后使用
// 运行: npm run build && node scripts/cli.js <file.ggb>

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('用法: node scripts/cli.js <文件路径>');
    console.log('');
    console.log('或者直接解析代码:');
    console.log('  node scripts/cli.js -c "SetValue(a, 1)"');
    process.exit(1);
}

try {
    let code;
    
    if (args[0] === '-c') {
        // 直接解析命令行参数中的代码
        code = args[1];
    } else {
        // 从文件读取
        const filePath = path.resolve(args[0]);
        code = fs.readFileSync(filePath, 'utf-8');
    }
    
    // 导入编译后的模块
    const { parseGeoGebraScript } = require('../dist/core/parser/parser');
    const { Lexer } = require('../dist/core/parser/lexer');
    
    console.log('=== GeoGebra 脚本分析 ===\n');
    console.log('代码:');
    console.log(code);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 词法分析
    console.log('📝 词法分析 (Tokens):');
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    tokens.forEach((token, index) => {
        if (token.type !== 'NEWLINE' && token.type !== 'EOF') {
            console.log(`  [${index}] ${token.type.padEnd(15)} "${token.value}"`);
        }
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 语法分析
    console.log('🌲 语法分析 (AST):');
    const ast = parseGeoGebraScript(code);
    
    console.log(`\n找到 ${ast.body.length} 个命令:\n`);
    
    ast.body.forEach((command, index) => {
        console.log(`${index + 1}. ${command.commandName.name}()`);
        console.log(`   位置: 行 ${command.loc.start.line}, 列 ${command.loc.start.column}`);
        console.log(`   参数: ${command.arguments.length} 个`);
        
        command.arguments.forEach((arg, argIndex) => {
            let argInfo = `   - 参数 ${argIndex + 1}: ${arg.type}`;
            
            if (arg.type === 'NumberLiteral') {
                argInfo += ` = ${arg.value}`;
            } else if (arg.type === 'StringLiteral') {
                argInfo += ` = "${arg.value}"`;
            } else if (arg.type === 'BooleanLiteral') {
                argInfo += ` = ${arg.value}`;
            } else if (arg.type === 'Identifier') {
                argInfo += ` (${arg.name})`;
            } else if (arg.type === 'ListLiteral') {
                argInfo += ` [${arg.elements.length} 个元素]`;
            } else if (arg.type === 'FunctionCall') {
                argInfo += ` (${arg.callee.name}(...))`;
            }
            
            console.log(argInfo);
        });
        console.log();
    });
    
    console.log('='.repeat(50));
    console.log('✅ 解析成功!');
    
} catch (error) {
    console.error('❌ 错误:', error.message);
    if (error.position) {
        console.error(`   位置: 行 ${error.position.line}, 列 ${error.position.column}`);
    }
    process.exit(1);
}
