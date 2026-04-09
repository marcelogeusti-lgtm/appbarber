const { execSync } = require('child_process');
const fs = require('fs');

function run(cmd, cwd = '.') {
    console.log(`Running: ${cmd} in ${cwd}`);
    try {
        const out = execSync(cmd, { cwd, stdio: 'pipe' }).toString();
        console.log(out);
        return out;
    } catch (e) {
        console.error(`Error: ${e.message}`);
        if (e.stdout) console.log(`Stdout: ${e.stdout.toString()}`);
        if (e.stderr) console.error(`Stderr: ${e.stderr.toString()}`);
        return null;
    }
}

console.log('--- START DEPLOY ---');
const branch = run('git rev-parse --abbrev-ref HEAD');
const status = run('git status');

console.log('--- PUSHING ---');
run('git push origin main');

console.log('--- VERCEL SERVER ---');
run('npx vercel deploy --prod --yes', 'server');

console.log('--- VERCEL CLIENT ---');
run('npx vercel deploy --prod --yes', 'client');
console.log('--- END DEPLOY ---');
