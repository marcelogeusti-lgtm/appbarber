const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');

async function check() {
  try {
    await exec('npx next build');
    fs.writeFileSync('build_err_real.txt', 'SUCCESS', 'utf8');
  } catch (err) {
    fs.writeFileSync('build_err_real.txt', 'STDOUT:\n' + err.stdout + '\n\nSTDERR:\n' + err.stderr, 'utf8');
  }
}
check();
