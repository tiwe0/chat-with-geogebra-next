// 导出 Parser 和 Lexer
export { Parser, parseGeoGebraScript, ParseError } from './parser/parser.js';
export { Lexer, TokenType } from './parser/lexer.js';
export type { Token } from './parser/lexer.js';

// 导出 AST 类型
export type {
    Program,
    CommandStatement,
    Expression,
    Identifier,
    NumberLiteral,
    StringLiteral,
    BooleanLiteral,
    ListLiteral,
    FunctionCall,
    ASTNode,
    BaseNode,
    SourceLocation,
    Position
} from './parser/ast.js';

// 导出 Rule Engine
export { RuleEngine, formatLintResults } from './rules/rule-engine.js';
export type { Rule, RuleContext, RuleVisitor } from './rules/rule.js';

// 导出具体规则
export { noUnknownCommand } from './rules/no-unknown-command.js';
export { correctArgTypes } from './rules/correct-arg-types.js';

// 导出 Spec Registry
export { SpecRegistry, specRegistry } from './specs/spec-registry.js';
export type { CommandSignature, CommandSpec, CommandParameter, ArgumentType } from './specs/spec-registry.js';

// 导出 Linting 类型
export type { LintMessage, LintResult, LintConfig } from '../types/linting.js';
export { LintSeverity } from '../types/linting.js';
