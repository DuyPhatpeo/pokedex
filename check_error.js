const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE ERROR:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('PAGE EXCEPTION:', error.message);
    });

    try {
        await page.goto('http://localhost:8083');
        await page.waitForTimeout(3000); // Wait for load and API

        console.log('Clicking first pokemon...');
        await page.mouse.click(250, 220); // Gần vị trí card Charmander/Bulbasaur

        await page.waitForTimeout(2000); // Wait for transition
        console.log('Done scanning.');
    } catch (e) {
        console.error('Puppeteer Script Error:', e);
    } finally {
        await browser.close();
    }
})();
