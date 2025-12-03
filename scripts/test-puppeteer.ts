import puppeteer from 'puppeteer';

async function testPuppeteer() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    console.log('Navigating to Mythos Cards...');
    await page.goto('https://mythos.cards/product/hobbybox');

    console.log('Waiting for title...');
    await page.waitForSelector('title');
    const title = await page.title();
    console.log('Page Title:', title);

    console.log('Waiting for product cards...');
    try {
        await page.waitForSelector('.wrapper', { timeout: 10000 });
        console.log('Product cards found!');
    } catch (e) {
        console.log('Product cards NOT found within timeout.');
    }

    await browser.close();
}

testPuppeteer().catch(console.error);
