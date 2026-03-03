// 检查环境变量
console.log('检查环境变量:');

// 方法1: 通过process.env
console.log('GITHUB_TOKEN via process.env:', process.env.GITHUB_TOKEN ? '已设置（已隐藏）' : '未设置');

// 方法2: 通过cmd
const { execSync } = require('child_process');
try {
    const output = execSync('echo %GITHUB_TOKEN%', { encoding: 'utf8' });
    console.log('通过cmd echo:', output.trim() === '%GITHUB_TOKEN%' ? '未设置' : '已设置');
} catch (e) {
    console.log('cmd执行失败:', e.message);
}

// 列出所有可能包含GITHUB的环境变量
console.log('\n所有包含GITHUB的环境变量:');
for (const key in process.env) {
    if (key.toUpperCase().includes('GITHUB')) {
        const value = process.env[key];
        console.log(`${key}: ${value ? '已设置' : '空值'}`);
    }
}

// 检查OpenClaw配置中的可能设置
console.log('\n检查OpenClaw配置中的GitHub设置...');