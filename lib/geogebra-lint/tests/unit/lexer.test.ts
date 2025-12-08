import { Lexer, TokenType } from '../../src/core/parser/lexer';

describe('Lexer', () => {
    describe('基本 Token 识别', () => {
        it('应该正确识别标识符', () => {
            const lexer = new Lexer('myVariable');
            const tokens = lexer.tokenize();
            
            expect(tokens).toHaveLength(2); // IDENTIFIER + EOF
            expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[0].value).toBe('myVariable');
        });

        it('应该正确识别数字', () => {
            const lexer = new Lexer('123 3.14 -5 2.5e10');
            const tokens = lexer.tokenize();
            
            const numbers = tokens.filter(t => t.type === TokenType.NUMBER);
            expect(numbers).toHaveLength(4);
            expect(numbers[0].value).toBe('123');
            expect(numbers[1].value).toBe('3.14');
            expect(numbers[2].value).toBe('-5');
            expect(numbers[3].value).toBe('2.5e10');
        });

        it('应该正确识别字符串', () => {
            const lexer = new Lexer('"hello" \'world\'');
            const tokens = lexer.tokenize();
            
            const strings = tokens.filter(t => t.type === TokenType.STRING);
            expect(strings).toHaveLength(2);
            expect(strings[0].value).toBe('hello');
            expect(strings[1].value).toBe('world');
        });

        it('应该正确识别布尔值', () => {
            const lexer = new Lexer('true false');
            const tokens = lexer.tokenize();
            
            const booleans = tokens.filter(t => t.type === TokenType.BOOLEAN);
            expect(booleans).toHaveLength(2);
            expect(booleans[0].value).toBe('true');
            expect(booleans[1].value).toBe('false');
        });
    });

    describe('符号识别', () => {
        it('应该正确识别括号', () => {
            const lexer = new Lexer('(){}');
            const tokens = lexer.tokenize();
            
            expect(tokens[0].type).toBe(TokenType.LPAREN);
            expect(tokens[1].type).toBe(TokenType.RPAREN);
            expect(tokens[2].type).toBe(TokenType.LBRACE);
            expect(tokens[3].type).toBe(TokenType.RBRACE);
        });

        it('应该正确识别逗号和等号', () => {
            const lexer = new Lexer(',=');
            const tokens = lexer.tokenize();
            
            expect(tokens[0].type).toBe(TokenType.COMMA);
            expect(tokens[1].type).toBe(TokenType.EQUALS);
        });
    });

    describe('字符串转义', () => {
        it('应该正确处理转义字符', () => {
            const lexer = new Lexer('"hello\\nworld"');
            const tokens = lexer.tokenize();
            
            const stringToken = tokens.find(t => t.type === TokenType.STRING);
            expect(stringToken?.value).toBe('hello\nworld');
        });
    });

    describe('注释处理', () => {
        it('应该跳过单行注释', () => {
            const lexer = new Lexer('a // this is comment\nb');
            const tokens = lexer.tokenize();
            
            const identifiers = tokens.filter(t => t.type === TokenType.IDENTIFIER);
            expect(identifiers).toHaveLength(2);
            expect(identifiers[0].value).toBe('a');
            expect(identifiers[1].value).toBe('b');
        });
    });

    describe('位置信息', () => {
        it('应该正确记录 token 位置', () => {
            const lexer = new Lexer('abc\ndef');
            const tokens = lexer.tokenize();
            
            const firstId = tokens[0];
            expect(firstId.position.line).toBe(1);
            expect(firstId.position.column).toBe(1);
            
            const secondId = tokens.find(t => t.value === 'def');
            expect(secondId?.position.line).toBe(2);
        });
    });

    describe('复杂表达式', () => {
        it('应该正确解析命令调用', () => {
            const lexer = new Lexer('SetValue(a, 1)');
            const tokens = lexer.tokenize();
            
            expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[0].value).toBe('SetValue');
            expect(tokens[1].type).toBe(TokenType.LPAREN);
            expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
            expect(tokens[2].value).toBe('a');
            expect(tokens[3].type).toBe(TokenType.COMMA);
            expect(tokens[4].type).toBe(TokenType.NUMBER);
            expect(tokens[4].value).toBe('1');
            expect(tokens[5].type).toBe(TokenType.RPAREN);
        });
    });
});
