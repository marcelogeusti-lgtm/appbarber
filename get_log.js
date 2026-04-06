const { execSync } = require('child_process');
const fs = require('fs');

try {
  const result = execSync('git log -n 10 --oneline -- "client/app/(client)/home/page.js"', { encoding: 'utf8' });
  fs.writeFileSync('home_history.txt', result);
} catch (e) {
  fs.writeFileSync('home_history.txt', e.message);
}
