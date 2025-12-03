import { Card, Scraper } from './types';
import puppeteer from 'puppeteer';

export class TizyCardsScraper implements Scraper {
    name = 'Tizy Cards';

    private categories = [
        { url: 'https://www.tizycards.com/all-products?category=pokemon', game: 'Pokemon' },
        { url: 'https://www.tizycards.com/all-products?category=magic-the-gathering', game: 'Magic: The Gathering' }
    ];

    async scrape(): Promise<Card[]> {
        const cards: Card[] = [];
        console.log(`\nScraping ${this.name} (Puppeteer)...`);

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // Set viewport to ensure elements are visible
            await page.setViewport({ width: 1280, height: 800 });

            for (const category of this.categories) {
                console.log(`Processing category: ${category.game} (${category.url})`);

                try {
                    await page.goto(category.url, { waitUntil: 'networkidle2', timeout: 60000 });

                    // Wait for products to load
                    // Subagent saw "51 ürün bulundu" text, maybe wait for that or product grid
                    try {
                        await page.waitForSelector('img[src*="firebasestorage"], img[src*="googleusercontent"]', { timeout: 15000 });
                        // Scroll to bottom to ensure all images load (lazy loading)
                        await this.autoScroll(page);
                    } catch (e) {
                        console.log('Timeout waiting for products or images.');
                    }

                    // Extract data
                    // Return raw data to avoid transpilation issues with __name or other variables
                    const rawProducts = await page.evaluate(() => {
                        const results: any[] = [];

                        function isVisible(elem: Element) {
                            if (!(elem instanceof HTMLElement)) return false;
                            return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
                        }

                        const allDivs = Array.from(document.querySelectorAll('div'));
                        const potentialCards = allDivs.filter(div => {
                            if (!isVisible(div)) return false;
                            const text = div.innerText || '';
                            return text.includes('TL') && !!div.querySelector('img') && text.length < 500;
                        });

                        // Sort by text length to get inner cards
                        potentialCards.sort((a, b) => (a.innerText?.length || 0) - (b.innerText?.length || 0));

                        const seenImages = new Set();

                        for (const div of potentialCards) {
                            const img = div.querySelector('img');
                            if (!img || seenImages.has(img.src)) continue;
                            seenImages.add(img.src);

                            const text = div.innerText || '';
                            let link = '';
                            const aTag = div.querySelector('a') || div.closest('a');
                            if (aTag) link = aTag.href;

                            results.push({
                                text: text,
                                imgSrc: img.src,
                                link: link
                            });
                        }
                        return results;
                    });

                    // Process raw data in Node.js context
                    const pageCards = rawProducts.map(raw => {
                        const lines = raw.text.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
                        let title = '';
                        let price = 0;

                        for (const line of lines) {
                            if (line.includes('TL')) {
                                const clean = line.replace('TL', '').replace(/\./g, '').replace(',', '.').trim();
                                const match = clean.match(/(\d+(\.\d+)?)/);
                                if (match) price = parseFloat(match[0]);
                            } else if (!title && line.length > 2) {
                                title = line;
                            }
                        }

                        if (title && price > 0) {
                            return {
                                name: title,
                                price: price,
                                currency: 'TRY',
                                seller_name: this.name,
                                game: category.game,
                                image_url: raw.imgSrc,
                                product_url: raw.link || window.location.href // fallback, though window.location is not available here, use category.url
                            };
                        }
                        return null;
                    }).filter(c => c !== null) as Card[];

                    // Fix product_url fallback
                    pageCards.forEach(c => {
                        if (!c.product_url || c.product_url === 'undefined') {
                            c.product_url = category.url;
                        }
                    });

                    console.log(`Found ${pageCards.length} products in ${category.game}`);
                    cards.push(...pageCards);

                } catch (error) {
                    console.error(`Error scraping category ${category.game}:`, error);
                }
            }
        } finally {
            await browser.close();
        }

        return cards;
    }

    private async autoScroll(page: any) {
        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }
}
