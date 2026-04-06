const { exec } = require('child_process');
const fs = require('fs');
exec('npm run build', { shell: 'powershell.exe' }, (error, stdout, stderr) => {
  fs.writeFileSync('build_out.json', JSON.stringify({ error: error ? error.message : null, stdout, stderr }));
});
