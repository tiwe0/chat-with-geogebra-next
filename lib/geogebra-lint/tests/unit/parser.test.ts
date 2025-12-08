import { parseGeoGebraScript, ParseError } from '../../src/core/parser/parser';

describe('Parser', () => {
    describe('基本命令解析', () => {
        it('应该解析简单的命令', () => {
            const ast = parseGeoGebraScript('SetValue(a, 1)');
            
            expect(ast.type).toBe('Program');
            expect(ast.body).toHaveLength(1);
            expect(ast.body[0].type).toBe('CommandStatement');
            expect(ast.body[0].commandName.name).toBe('SetValue');
            expect(ast.body[0].arguments).toHaveLength(2);
        });

        it('应该解析多个命令', () => {
            const code = `
                SetValue(a, 1)
                Point(A, 1, 2)
            `;
            const ast = parseGeoGebraScript(code);
            
            expect(ast.body).toHaveLength(2);
            expect(ast.body[0].commandName.name).toBe('SetValue');
            expect(ast.body[1].commandName.name).toBe('Point');
        });
    });

    describe('参数类型', () => {
        it('应该解析数字参数', () => {
            const ast = parseGeoGebraScript('SetValue(a, 123)');
            const arg = ast.body[0].arguments[1];
            
            expect(arg.type).toBe('NumberLiteral');
            expect((arg as any).value).toBe(123);
        });

        it('应该解析字符串参数', () => {
            const ast = parseGeoGebraScript('SetColor(a, "red")');
            const arg = ast.body[0].arguments[1];
            
            expect(arg.type).toBe('StringLiteral');
            expect((arg as any).value).toBe('red');
        });

        it('应该解析布尔参数', () => {
            const ast = parseGeoGebraScript('SetVisible(a, true)');
            const arg = ast.body[0].arguments[1];
            
            expect(arg.type).toBe('BooleanLiteral');
            expect((arg as any).value).toBe(true);
        });

        it('应该解析标识符参数', () => {
            const ast = parseGeoGebraScript('SetValue(a, b)');
            const arg = ast.body[0].arguments[1];
            
            expect(arg.type).toBe('Identifier');
            expect((arg as any).name).toBe('b');
        });

        it('应该解析列表参数', () => {
            const ast = parseGeoGebraScript('SetValue(a, {1, 2, 3})');
            const arg = ast.body[0].arguments[1];
            
            expect(arg.type).toBe('ListLiteral');
            expect((arg as any).elements).toHaveLength(3);
        });
    });

    describe('嵌套函数调用', () => {
        it('应该解析嵌套的函数调用', () => {
            const ast = parseGeoGebraScript('SetValue(a, x(b))');
            const arg = ast.body[0].arguments[1];
            
            expect(arg.type).toBe('FunctionCall');
            expect((arg as any).callee.name).toBe('x');
            expect((arg as any).arguments).toHaveLength(1);
        });

        it('应该解析多层嵌套', () => {
            const ast = parseGeoGebraScript('A(B(C(1)))');
            const firstArg = ast.body[0].arguments[0];
            
            expect(firstArg.type).toBe('FunctionCall');
            expect((firstArg as any).callee.name).toBe('B');
        });
    });

    describe('赋值语句', () => {
        it('应该解析赋值语句', () => {
            const ast = parseGeoGebraScript('P = Point(1, 2)');
            
            expect(ast.body).toHaveLength(1);
            expect(ast.body[0].commandName.name).toBe('Point');
        });
    });

    describe('注释和空白', () => {
        it('应该忽略注释', () => {
            const code = `
                // 这是注释
                SetValue(a, 1)
                // 另一个注释
            `;
            const ast = parseGeoGebraScript(code);
            
            expect(ast.body).toHaveLength(1);
        });

        it('应该处理空行', () => {
            const code = `
                SetValue(a, 1)
                
                
                Point(A, 1, 2)
            `;
            const ast = parseGeoGebraScript(code);
            
            expect(ast.body).toHaveLength(2);
        });
    });

    describe('错误处理', () => {
        it('应该在缺少括号时抛出错误', () => {
            expect(() => {
                parseGeoGebraScript('SetValue(a, 1');
            }).toThrow(ParseError);
        });

        it('应该在非法 token 时抛出错误', () => {
            expect(() => {
                parseGeoGebraScript('SetValue(@, 1)');
            }).toThrow();
        });
    });

    describe('位置信息', () => {
        it('应该包含正确的位置信息', () => {
            const ast = parseGeoGebraScript('SetValue(a, 1)');
            
            expect(ast.loc).toBeDefined();
            expect(ast.loc.start).toBeDefined();
            expect(ast.loc.end).toBeDefined();
            expect(ast.body[0].loc).toBeDefined();
        });
    });
});
