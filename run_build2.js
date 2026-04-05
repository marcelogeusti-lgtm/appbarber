const { spawnSync } = require('child_process');
const fs = require('fs');

const result = spawnSync('npm.cmd', ['run', 'build'], { cwd: './client', encoding: 'utf8' });
const out = (result.stdout || '') + '\nSTDERR:\n' + (result.stderr || '') + '\nERROR:\n' + (result.error ? result.error.message : '');

fs.writeFileSync('build_result2.txt', out, 'utf8');
