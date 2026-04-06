const { execSync } = require('child_process');
const fs = require('fs');

function run(cmd, tag) {
    console.log(`Running: ${cmd}`);
    try {
        const stdout = execSync(cmd, { encoding: 'utf8' });
        fs.appendFileSync('debug_deploy.log', `--- ${tag} ---\nExit Code: 0\nStdout:\n${stdout}\n\n`);
    } catch (err) {
        fs.appendFileSync('debug_deploy.log', `--- ${tag} ---\nExit Code: ${err.status}\nStdout:\n${err.stdout}\nStderr:\n${err.stderr}\n\n`);
    }
}

fs.writeFileSync('debug_deploy.log', 'Start Debug Log\n\n');
run('git branch', 'GIT BRANCH');
run('git remote -v', 'GIT REMOTE');
run('npx vercel --version', 'VERCEL VERSION');
run('npx vercel deploy --prod --yes --cwd client', 'VERCEL DEPLOY');
