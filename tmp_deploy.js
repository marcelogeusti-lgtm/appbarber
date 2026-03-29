const { execSync } = require('child_process');
const path = require('path');

try {
    const clientPath = path.join(__dirname, 'client');
    console.log(`Deploying from: ${clientPath}`);
    execSync('npx vercel --prod --yes', { 
        cwd: clientPath,
        stdio: 'inherit' 
    });
} catch (err) {
    console.error('Deploy failed:', err.message);
}
