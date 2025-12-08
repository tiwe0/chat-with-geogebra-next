import { specRegistry } from '../../src/core/specs/spec-registry';

describe('SpecRegistry', () => {
    describe('命令查询', () => {
        it('应该加载命令规范', () => {
            expect(specRegistry.getCommandCount()).toBeGreaterThan(0);
        });

        it('应该查找已知命令', () => {
            expect(specRegistry.hasCommand('SetValue')).toBe(true);
            expect(specRegistry.hasCommand('Point')).toBe(true);
        });

        it('应该拒绝未知命令', () => {
            expect(specRegistry.hasCommand('UnknownCommand')).toBe(false);
        });

        it('应该获取命令规范', () => {
            const specs = specRegistry.getCommandSpecs('SetValue');
            expect(specs).toBeDefined();
            expect(specs!.length).toBeGreaterThan(0);
        });

        it('应该返回命令描述', () => {
            const desc = specRegistry.getCommandDescription('SetValue');
            expect(desc).toBeDefined();
            expect(typeof desc).toBe('string');
        });
    });

    describe('命令匹配', () => {
        it('应该找到最佳匹配', () => {
            const spec = specRegistry.findBestMatch('SetValue', 2);
            expect(spec).toBeDefined();
            expect(spec!.name).toBe('SetValue');
        });

        it('应该处理参数数量不匹配', () => {
            const spec = specRegistry.findBestMatch('SetValue', 10);
            expect(spec).toBeDefined(); // 返回第一个重载
        });
    });

    describe('命令列表', () => {
        it('应该返回所有命令名', () => {
            const commands = specRegistry.getAllCommandNames();
            expect(commands.length).toBeGreaterThan(0);
            expect(commands).toContain('SetValue');
        });
    });

    describe('参数解析', () => {
        it('应该解析命令参数', () => {
            const specs = specRegistry.getCommandSpecs('SetValue');
            expect(specs).toBeDefined();
            
            const spec = specs![0];
            expect(spec.parameters).toBeDefined();
            expect(spec.parameters.length).toBeGreaterThan(0);
        });

        it('应该包含参数类型信息', () => {
            const specs = specRegistry.getCommandSpecs('Point');
            expect(specs).toBeDefined();
            
            const spec = specs![0];
            spec.parameters.forEach(param => {
                expect(param.type).toBeDefined();
                expect(typeof param.type).toBe('string');
            });
        });
    });

    describe('命令示例', () => {
        it('应该包含命令示例', () => {
            const specs = specRegistry.getCommandSpecs('SetValue');
            expect(specs).toBeDefined();
            
            const spec = specs![0];
            expect(spec.examples).toBeDefined();
            expect(Array.isArray(spec.examples)).toBe(true);
        });
    });
});
