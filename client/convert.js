const fs = require('fs');
try {
  let content = fs.readFileSync('deploy_error.txt');
  // Attempt to detect if it's utf16le simply by converting it and comparing.
  // Actually let's just make it utf8 by assuming utf16le for the input buffer.
  let text = content.toString('utf16le');
  fs.writeFileSync('deploy_error_utf8.txt', text, 'utf8');
} catch (e) {
  console.error(e);
}
