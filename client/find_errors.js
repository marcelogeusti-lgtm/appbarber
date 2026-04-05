const { ESLint } = require("eslint");
const fs = require("fs");
(async function main() {
  try {
    const eslint = new ESLint();
    const results = await eslint.lintFiles(["app/**/*.js", "app/**/*.jsx", "components/**/*.js", "components/**/*.jsx"]);
    const errors = results.filter(r => r.errorCount > 0 || r.warningCount > 0);
    const simplified = errors.map(e => ({ filePath: e.filePath, messages: e.messages.map(m => m.message) }));
    fs.writeFileSync("errors.json", JSON.stringify(simplified, null, 2), "utf8");
    console.log("Done");
  } catch(e) {
    fs.writeFileSync("errors.json", JSON.stringify({error: e.toString()}), "utf8");
  }
})();
