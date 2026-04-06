const { execSync } = require('child_process');
const fs = require('fs');

try {
  const env = Object.assign({}, process.env);
  env.PATH = env.PATH + ';C:\\Program Files\\nodejs;C:\\Users\\wanie\\AppData\\Roaming\\npm';
  const out = execSync('npm.cmd run build', { env, encoding: 'utf8' });
  fs.writeFileSync('build_check.txt', out);
} catch (e) {
  fs.writeFileSync('build_check.txt', e.message + '\n' + (e.stdout || '') + '\n' + (e.stderr || ''));
}
