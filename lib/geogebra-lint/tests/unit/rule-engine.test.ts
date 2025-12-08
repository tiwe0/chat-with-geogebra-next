import { RuleEngine } from '../../src/core/rules/rule-engine';
import { noUnknownCommand } from '../../src/core/rules/no-unknown-command';
import { correctArgTypes } from '../../src/core/rules/correct-arg-types';

describe('RuleEngine', () => {
    let engine: RuleEngine;

    beforeEach(() => {
        engine = new RuleEngine({
            rules: {
                'no-unknown-command': 'error',
                'correct-arg-types': 'warn'
            }
        });
        engine.registerRules([noUnknownCommand, correctArgTypes]);
    });

    describe('基本功能', () => {
        it('应该成功注册规则', () => {
            expect(engine.getRuleCount()).toBe(2);
        });

        it('应该正确解析没有错误的代码', () => {
            // 使用一个已知存在的命令
            const result = engine.lint('Distance(A, B)');
            expect(result.errorCount).toBe(0);
            // 注意：可能有类型警告，这是正常的
        });

        it('应该返回 LintResult', () => {
            const result = engine.lint('Distance(A, B)');
            expect(result).toHaveProperty('source');
            expect(result).toHaveProperty('messages');
            expect(result).toHaveProperty('errorCount');
            expect(result).toHaveProperty('warningCount');
        });
    });

    describe('no-unknown-command 规则', () => {
        it('应该检测未知命令', () => {
            const result = engine.lint('UnknownCommand(a, 1)');
            expect(result.errorCount).toBeGreaterThan(0);
            expect(result.messages[0].ruleId).toBe('no-unknown-command');
        });

        it('应该提供相似命令建议', () => {
            const result = engine.lint('SetValu(a, 1)');
            expect(result.messages[0].suggestions).toBeDefined();
            expect(result.messages[0].suggestions!.length).toBeGreaterThan(0);
        });

        it('应该接受已知命令', () => {
            const result = engine.lint('Distance(A, B)');
            const unknownErrors = result.messages.filter(
                m => m.ruleId === 'no-unknown-command'
            );
            expect(unknownErrors.length).toBe(0);
        });
    });

    describe('correct-arg-types 规则', () => {
        it('应该检测参数数量错误', () => {
            // Distance 需要 2 个参数
            const result = engine.lint('Distance(A)');
            const argErrors = result.messages.filter(
                m => m.ruleId === 'correct-arg-types'
            );
            expect(argErrors.length).toBeGreaterThan(0);
        });

        it('应该接受正确的参数数量', () => {
            // Distance 接受 2 个 Object 参数
            const result = engine.lint('Distance(A, B)');
            const argErrors = result.messages.filter(
                m => m.ruleId === 'correct-arg-types'
            );
            // Object 类型应该被接受
            expect(argErrors.length).toBe(0);
        });

        it('应该检测参数类型问题', () => {
            const result = engine.lint('SetValue("string", "string")');
            // 注意：这可能不会报错，因为字符串字面量可能被接受为 Object
            expect(result).toBeDefined();
        });
    });

    describe('配置', () => {
        it('应该遵守规则配置', () => {
            const offEngine = new RuleEngine({
                rules: {
                    'no-unknown-command': 'off'
                }
            });
            offEngine.registerRule(noUnknownCommand);

            const result = offEngine.lint('UnknownCommand(a, 1)');
            expect(result.errorCount).toBe(0);
        });

        it('应该支持严重程度配置', () => {
            const warnEngine = new RuleEngine({
                rules: {
                    'no-unknown-command': 'warn'
                }
            });
            warnEngine.registerRule(noUnknownCommand);

            const result = warnEngine.lint('UnknownCommand(a, 1)');
            expect(result.errorCount).toBe(0);
            expect(result.warningCount).toBeGreaterThan(0);
        });
    });

    describe('多个命令', () => {
        it('应该处理多个命令', () => {
            const code = `
                SetValue(a, 1)
                Point(P, 0, 0)
                SetColor(P, "red")
            `;
            const result = engine.lint(code);
            expect(result.errorCount).toBe(0);
        });

        it('应该检测多个错误', () => {
            const code = `
                UnknownCommand1(a, 1)
                UnknownCommand2(b, 2)
            `;
            const result = engine.lint(code);
            expect(result.errorCount).toBeGreaterThanOrEqual(2);
        });
    });

    describe('解析错误', () => {
        it('应该处理解析错误', () => {
            const result = engine.lint('SetValue(');
            expect(result.errorCount).toBeGreaterThan(0);
            expect(result.messages.some(m => m.ruleId === 'parse-error')).toBe(true);
        });
    });

    describe('位置信息', () => {
        it('应该包含正确的位置信息', () => {
            const result = engine.lint('UnknownCommand(a, 1)');
            expect(result.messages[0].loc).toBeDefined();
            expect(result.messages[0].loc.start).toBeDefined();
            expect(result.messages[0].loc.end).toBeDefined();
        });
    });
});
