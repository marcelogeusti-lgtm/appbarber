const fs = require('fs');
let content = fs.readFileSync('deploy_error.txt', 'utf16le');
fs.writeFileSync('deploy_error_utf8.txt', content, 'utf8');
