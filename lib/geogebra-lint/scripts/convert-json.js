// 将 commandSignatures.json 转换为 TypeScript 文件
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/core/specs/commandSignatures.json');
const tsPath = path.join(__dirname, '../src/core/specs/commandSignatures.ts');

const data = fs.readFileSync(jsonPath, 'utf8');

const tsContent = `// 自动生成的文件 - 不要手动编辑
// 从 commandSignatures.json 生成

const commandSignatures = ${data};

export default commandSignatures;
`;

fs.writeFileSync(tsPath, tsContent);
console.log('✅ commandSignatures.ts 生成成功');
