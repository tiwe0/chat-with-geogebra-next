import { parseGeoGebraScript } from '../src/core/parser/parser';
import { Lexer } from '../src/core/parser/lexer';

// 测试 Lexer
console.log('=== Testing Lexer ===\n');

const testCode = `
// 这是注释
SetValue(a, 1)
Point(A, 1, 2)
P = Point(3, 4)
SetColor(P, "red")
list = {1, 2, 3}
SetVisible(obj, true)
`;

const lexer = new Lexer(testCode);
const tokens = lexer.tokenize();

console.log('Tokens:');
tokens.forEach((token, index) => {
    if (token.type !== 'NEWLINE') {
        console.log(`${index}: ${String(token.type).padEnd(15)} "${token.value}" at line ${token.position.line}, col ${token.position.column}`);
    }
});

// 测试 Parser
console.log('\n=== Testing Parser ===\n');

const ast = parseGeoGebraScript(testCode);

console.log('AST:');
console.log(JSON.stringify(ast, null, 2));

console.log('\n=== Commands Found ===\n');
ast.body.forEach((command, index) => {
    console.log(`${index + 1}. ${command.commandName.name}()`);
    console.log(`   Arguments: ${command.arguments.length}`);
    command.arguments.forEach((arg, argIndex) => {
        console.log(`   - arg${argIndex}: ${arg.type} = ${JSON.stringify(arg).slice(0, 50)}...`);
    });
});

// 测试复杂表达式
console.log('\n=== Testing Complex Expression ===\n');

const complexCode = `SetValue(A, x(B))`;
const complexAst = parseGeoGebraScript(complexCode);

console.log('Complex AST:');
console.log(JSON.stringify(complexAst, null, 2));
