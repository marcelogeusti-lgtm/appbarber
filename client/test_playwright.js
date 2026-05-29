const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    page.on('console', msg => console.log('[CONSOLE]', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('[ERROR]', err.message));
    console.log('Navigating...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('Done!');
    await browser.close();
  } catch (e) {
    console.error('Failed to run Playwright:', e.message);
  }
})();
