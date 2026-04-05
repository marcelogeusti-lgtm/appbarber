const child_process = require('child_process');
const fs = require('fs');

try {
    const status = child_process.execSync('git status', { encoding: 'utf8' });
    const log = child_process.execSync('git log -n 3 --oneline', { encoding: 'utf8' });
    const branch = child_process.execSync('git branch --show-current', { encoding: 'utf8' });
    const remote = child_process.execSync('git remote -v', { encoding: 'utf8' });
    fs.writeFileSync('git_info.json', JSON.stringify({ status, log, branch, remote }, null, 2), 'utf8');
} catch (e) {
    fs.writeFileSync('git_info.json', JSON.stringify({ error: e.message, stdout: e.stdout ? e.stdout.toString() : '', stderr: e.stderr ? e.stderr.toString() : '' }, null, 2), 'utf8');
}
