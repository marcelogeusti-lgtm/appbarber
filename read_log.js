const fs = require('fs');
try {
    let content = fs.readFileSync('deploy_log.txt', 'utf8');
    fs.writeFileSync('deploy_log_clean.txt', content.replace(/[^\x00-\x7F]/g, ""));
} catch(e) {
    fs.writeFileSync('deploy_log_clean.txt', "Error reading: " + e.message);
}
