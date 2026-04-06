const { execSync } = require('child_process');
const fs = require('fs');
try {
  const content = execSync('git show bf6555b:"client/app/(client)/home/page.js"', { encoding: 'utf8' });
  fs.writeFileSync('old_home.js', content, 'utf8');
} catch (e) {
  fs.writeFileSync('old_home_error.txt', e.message);
}
