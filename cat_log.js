const fs = require('fs');
try {
    const data = fs.readFileSync('client/lint_output.txt', 'utf8');
    // also try utf16le just in case
    const data16 = fs.readFileSync('client/lint_output.txt', 'utf16le');
    if (data.includes('eslint') || data.includes('Error')) {
        console.log("UTF8:", data.substring(0, 1000));
    } else {
        console.log("UTF16:", data16.substring(0, 1000));
    }
} catch(e) {
    console.error(e.message);
}
