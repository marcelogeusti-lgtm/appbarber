const fs = require('fs');
const path = require('path');

const svgPath = 'c:/Users/wanie/Downloads/MARCELO/EU/App Barbeiro/client/public/logos/logo_icon.svg';
const outputPath = 'c:/Users/wanie/Downloads/MARCELO/EU/App Barbeiro/client/public/icons/logo_official.png';

try {
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const base64Match = svgContent.match(/base64,([^"]+)"/);

    if (base64Match && base64Match[1]) {
        const buffer = Buffer.from(base64Match[1], 'base64');
        if (!fs.existsSync(path.dirname(outputPath))) {
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        }
        fs.writeFileSync(outputPath, buffer);
        console.log('Successfully extracted logo to:', outputPath);
    } else {
        console.error('Could not find base64 image in SVG');
    }
} catch (error) {
    console.error('Error:', error.message);
}
