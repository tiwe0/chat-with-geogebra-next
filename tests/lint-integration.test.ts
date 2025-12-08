/**
 * GeoGebra Lint 集成测试
 * 
 * 这个文件演示了如何在应用中使用 GeoGebra Lint 功能
 */

import {
  parseGeoGebraScript,
  RuleEngine,
  noUnknownCommand,
  correctArgTypes,
  formatLintResults,
  type LintResult,
} from '../lib/geogebra-lint-core'

// 测试示例命令
const testCases = [
  {
    name: '正确的命令',
    code: 'Point(A, 1, 2)',
    shouldPass: true,
  },
  {
    name: '未知的命令',
    code: 'Pointt(A, 1, 2)',
    shouldPass: false,
  },
  {
    name: '参数类型错误',
    code: 'SetColor(A, 123)',
    shouldPass: false,
  },
  {
    name: '多个命令',
    code: `
SetValue(a, 1)
Point(A, 1, 2)
SetColor(A, "red")
`,
    shouldPass: true,
  },
  {
    name: '混合正确和错误的命令',
    code: `
Point(A, 1, 2)
UnknownCommand(b, 2)
SetColor(A, "blue")
`,
    shouldPass: false,
  },
]

// 创建 lint 引擎
function createEngine() {
  const engine = new RuleEngine({
    rules: {
      'no-unknown-command': 'error',
      'correct-arg-types': 'error',
    },
  })

  engine.registerRules([noUnknownCommand, correctArgTypes])

  return engine
}

// 运行测试
function runTests() {
  console.log('🧪 开始 GeoGebra Lint 集成测试\n')

  const engine = createEngine()

  testCases.forEach((testCase, index) => {
    console.log(`\n测试 ${index + 1}: ${testCase.name}`)
    console.log('=' .repeat(50))
    console.log('代码:')
    console.log(testCase.code)
    console.log('-'.repeat(50))

    const result: LintResult = engine.lint(testCase.code)
    const hasErrors = result.errorCount > 0

    console.log(`\n结果: ${hasErrors ? '❌ 失败' : '✅ 通过'}`)
    console.log(`错误数: ${result.errorCount}`)
    console.log(`警告数: ${result.warningCount}`)

    if (result.messages.length > 0) {
      console.log('\n详细信息:')
      console.log(formatLintResults(result))
    }

    // 验证预期结果
    const actualPass = !hasErrors
    if (actualPass === testCase.shouldPass) {
      console.log(`\n✅ 测试通过: 结果符合预期 (${testCase.shouldPass ? '应该通过' : '应该失败'})`)
    } else {
      console.log(
        `\n❌ 测试失败: 结果不符合预期 (${testCase.shouldPass ? '应该通过但失败了' : '应该失败但通过了'})`,
      )
    }
  })

  console.log('\n\n' + '='.repeat(50))
  console.log('🎉 所有测试完成!')
}

// 导出功能供其他模块使用
export { createEngine, runTests, testCases }

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
  runTests()
}
