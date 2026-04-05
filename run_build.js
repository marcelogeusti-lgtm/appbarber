const { execSync } = require('child_process');
const fs = require('fs');

try {
    const out = execSync('npm run build', { cwd: './client', encoding: 'utf8' });
    fs.writeFileSync('build_result.txt', 'SUCCESS:\n' + out, 'utf8');
} catch (e) {
    fs.writeFileSync('build_result.txt', 'ERROR:\n' + e.stdout + '\nSTDERR:\n' + e.stderr, 'utf8');
}
