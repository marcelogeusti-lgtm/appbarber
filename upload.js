const { exec } = require('child_process');
const fs = require('fs');

function run(cmd, cwd) {
    return new Promise(resolve => {
        exec(cmd, { cwd }, (err, stdout, stderr) => {
            const out = `[${cmd}] err: ${err ? err.message : 'null'}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}\n\n`;
            fs.appendFileSync('upload_log.txt', out);
            resolve();
        });
    });
}

(async () => {
    fs.writeFileSync('upload_log.txt', 'Starting log...\n\n');
    await run('git status', __dirname);
    await run('git add .', __dirname);
    await run('git commit -m "Updates"', __dirname);
    await run('git push', __dirname);
})();
