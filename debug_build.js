const { execSync } = require('child_process');
try {
  const out = execSync('npm run build', { cwd: 'client', encoding: 'utf8' });
  console.log('SUCCESS:', out);
} catch (e) {
  console.log('STDOUT:', e.stdout);
  console.log('STDERR:', e.stderr);
}
