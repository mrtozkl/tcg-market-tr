import { LemonCardsScraper } from '../lib/scraper/lemon-cards';
import * as cheerio from 'cheerio';

async function testScraper() {
    console.log('Testing LemonCardsScraper...');
    const scraper = new LemonCardsScraper();
    const cards = await scraper.scrape();

    console.log(`Found ${cards.length} cards.`);

    if (cards.length > 0) {
        console.log('First 5 cards:');
        cards.slice(0, 5).forEach(card => console.log(card));
    } else {
        console.log('No cards found. Check selectors.');
    }

    // Compare Page 1 and Page 2 DOM content
    console.log('--- Comparing Page 1 and Page 2 DOM ---');

    const url1 = 'https://lemoncards.com.tr/tekli-kartlar';
    const url2 = 'https://lemoncards.com.tr/tekli-kartlar?o=8&page=2';

    let html1 = '';

    try {
        const [res1, res2] = await Promise.all([fetch(url1), fetch(url2)]);
        const [h1, h2] = await Promise.all([res1.text(), res2.text()]);
        html1 = h1;

        const $1 = cheerio.load(h1);
        const $2 = cheerio.load(h2);

        // Selector for product name. Based on previous HTML dump: <h2 class="product-name ...">
        const name1 = $1('.product-name').first().text().trim();
        const name2 = $2('.product-name').first().text().trim();

        console.log(`Page 1 First Product: ${name1}`);
        console.log(`Page 2 First Product: ${name2}`);

        if (name1 && name2 && name1 !== name2) {
            console.log('SUCCESS: Page content differs! DOM scraping will work.');
        } else {
            console.log('FAILURE: Page content is identical. Server-side pagination might be failing or requires cookies/headers.');
        }
    } catch (error) {
        console.error('Error comparing pages:', error);
    }
    console.log('---------------------------------------');

    if (!html1) return;

    // Extract buildId and try Next.js data fetch
    console.log('--- Next.js Data Fetch Strategy ---');
    const $ = cheerio.load(html1);
    let buildId = '';

    $('script').each((i, el) => {
        const content = $(el).html();
        if (content && content.includes('"buildId":')) {
            try {
                const data = JSON.parse(content);
                if (data.buildId) {
                    buildId = data.buildId;
                    console.log(`Found buildId: ${buildId}`);
                }
            } catch (e) { }
        }
    });

    if (buildId) {
        // Construct Next.js data URL
        // Format: /_next/data/<buildId>/<page>.json?page=2
        const nextDataUrl = `https://lemoncards.com.tr/_next/data/${buildId}/tekli-kartlar.json?page=2`;
        console.log(`Fetching Next.js data: ${nextDataUrl}`);

        try {
            const res = await fetch(nextDataUrl);
            if (res.ok) {
                const data = await res.json();
                console.log('Next.js data fetched successfully!');

                // Inspect data for products
                if (data.pageProps && data.pageProps.propValues) {
                    console.log('Keys in fetched data pageProps:', Object.keys(data.pageProps));

                    // Try to find products in propValues[2] based on previous inspection
                    if (Array.isArray(data.pageProps.propValues) && data.pageProps.propValues[2]) {
                        const categoryData = data.pageProps.propValues[2].propValues;
                        if (categoryData && categoryData.category) {
                            console.log('Found category data in propValues[2].');
                            // Check inside category
                            if (categoryData.category.products) {
                                console.log(`Found ${categoryData.category.products.length} products in Next.js data!`);
                                console.log('First product from Next.js data:', categoryData.category.products[0].name);
                            } else {
                                console.log('No products found in category object.');
                                console.log('Category keys:', Object.keys(categoryData.category));
                            }
                        }
                    }
                }
            } else {
                console.log(`Failed to fetch Next.js data: ${res.status} ${res.statusText}`);
            }
        } catch (e) {
            console.log('Error fetching Next.js data:', e);
        }
    } else {
        console.log('Could not find buildId.');
    }
    console.log('---------------------------------------');
}

testScraper();
