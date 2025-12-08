// 导出 Parser 和 Lexer
export { Parser, parseGeoGebraScript, ParseError } from './parser/parser';
export { Lexer, TokenType } from './parser/lexer';
export type { Token } from './parser/lexer';

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
    TupleLiteral,
    FunctionCall,
    ASTNode,
    BaseNode,
    SourceLocation,
    Position
} from './parser/ast';

// 导出 Rule Engine
export { RuleEngine, formatLintResults } from './rules/rule-engine';
export type { Rule, RuleContext, RuleVisitor } from './rules/rule';

// 导出具体规则
export { noUnknownCommand } from './rules/no-unknown-command';
export { correctArgTypes } from './rules/correct-arg-types';

// 导出 Spec Registry
export { SpecRegistry, specRegistry } from './specs/spec-registry';
export type { CommandSignature, CommandSpec, CommandParameter, ArgumentType } from './specs/spec-registry';

// 导出 Linting 类型
export type { LintMessage, LintResult, LintConfig } from '../types/linting';
export { LintSeverity } from '../types/linting';
