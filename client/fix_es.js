const fs = require('fs');

let content = fs.readFileSync('client/contexts/LanguageContext.js', 'utf8');

// Find the misplaced Spanish translation block
const startMisplaced = content.indexOf('    ,\n    "terms": {\n    "title": "Términos de Servicio",');
if (startMisplaced === -1) {
    console.error("Could not find the misplaced Spanish block.");
} else {
    // Extract the block that was misplaced
    const endMisplaced = content.indexOf('  };\n\n    return (\n        <LanguageContext.Provider', startMisplaced);
    if (endMisplaced === -1) {
        console.error("Could not find the end of the misplaced block.");
    } else {
        const misplacedBlock = content.substring(startMisplaced, endMisplaced);
        
        // Remove the misplaced block from its incorrect location and restore the closing bracket for t()
        content = content.substring(0, startMisplaced) + '    }' + content.substring(endMisplaced + 4);
        
        // Find the correct place to insert it. The correct place is at the end of the `es: { ... }` block.
        // Let's look for `  es: {\n  "navbar": {` or similar.
        // Wait, the end of the translations object is `\n  },\n  es: { ... }\n};\n\nconst LanguageContext`
        // We can find `\n};\n\nconst LanguageContext = createContext();`
        const endOfTranslations = content.indexOf('\n};\n\nconst LanguageContext');
        if (endOfTranslations !== -1) {
            // We want to insert the block right before `\n};\n\nconst LanguageContext`
            // But without the trailing `};` that we might have grabbed. Wait, our `misplacedBlock` ends with `}`.
            // Let's just insert it!
            
            // Actually, let's clean it up:
            const cleanBlock = misplacedBlock.replace('    ,\n    "terms": {', ',\n    "terms": {');
            
            content = content.substring(0, endOfTranslations) + cleanBlock + content.substring(endOfTranslations);
            
            fs.writeFileSync('client/contexts/LanguageContext.js', content, 'utf8');
            console.log("Successfully fixed the Spanish block position.");
        } else {
            console.error("Could not find end of translations.");
        }
    }
}
