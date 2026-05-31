const fs = require('fs');
let content = fs.readFileSync('client/contexts/LanguageContext.js', 'utf8');

// The literal strings currently in the file are like `,\n    "terms": {`
// Let's just find and replace them directly.
content = content.split(',\\n    "terms": {').join(',\n    "terms": {');
content = content.split('},\\n    "privacy": {').join('},\n    "privacy": {');
content = content.split('},\\n    "about": {').join('},\n    "about": {');
content = content.split('    ,\\n    "terms": {').join('    ,\n    "terms": {');

// Oh, I see there might also be literal \\n in the translated text inside the DPA clause: 
// "In compliance with data protection laws:\\na) The **Establishment**"
// We actually WANT these literal \n in the strings so that they render as newlines when parsed?
// Wait, if we use them in JS objects, it should be literal \n in the JSON string or actual newline in the JS string.
// Let's replace those literal `\n` inside the content strings with actual newlines in the JS source.
content = content.replace(/\\n/g, '\n');

fs.writeFileSync('client/contexts/LanguageContext.js', content, 'utf8');
console.log('Fixed LanguageContext.js');
