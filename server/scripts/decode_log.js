const fs = require('fs');
try {
    const content = fs.readFileSync('full_log.txt', 'utf16le');
    fs.writeFileSync('decoded_log.txt', content, 'utf8');
    console.log('Decoded successfully to decoded_log.txt');
} catch (e) {
    console.error(e);
}
