import fs from 'fs';
import path from 'path';

/**
 * 递归地拷贝文件夹
 * @param {string} srcDir - 源文件夹路径
 * @param {string} destDir - 目标文件夹路径
 */
function copyFolderSync(srcDir, destDir) {
  // 检查目标文件夹是否存在，不存在则创建
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // 读取源文件夹内容
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      // 递归拷贝子目录
      copyFolderSync(srcPath, destPath);
    } else {
      // 拷贝文件
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const source = path.resolve('frontend/.next/static');
const destination = path.resolve('frontend/.next/standalone/frontend/.next/static');

copyFolderSync(source, destination);

console.log('✅ 文件夹拷贝完成！');

const buildPath = path.resolve('frontend/.next/standalone/frontend/server.js');
const newPath = path.resolve('frontend/.next/standalone/frontend/server.cjs');

if (fs.existsSync(buildPath)) {
  fs.renameSync(buildPath, newPath);
  console.log('✅ Renamed server.js to server.cjs successfully!');
} else {
  console.error('❌ server.js not found. Build process may have failed.');
}
