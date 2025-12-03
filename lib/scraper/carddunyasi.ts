import { Card, Scraper } from './types';
import puppeteer from 'puppeteer';

export class CardDunyasiScraper implements Scraper {
    name = 'Card Dunyasi';

    private categories = [
        { url: 'https://www.carddunyasi.com/kategoriler/tekli-kart/42', game: 'Pokemon' },
        { url: 'https://www.carddunyasi.com/kategoriler/kapali-kutular/3', game: 'Pokemon' }
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
            // Set user agent to avoid detection
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            for (const category of this.categories) {
                console.log(`Processing category: ${category.game} (${category.url})`);
                let pageNum = 1;
                let hasNextPage = true;

                while (hasNextPage) {
                    const url = pageNum === 1 ? category.url : `${category.url}?page=${pageNum}`;
                    console.log(`Fetching ${url}...`);

                    try {
                        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

                        // Wait for products to load
                        try {
                            await page.waitForSelector('div.col-6.col-md-3.col-lg-3.mb-3', { timeout: 10000 });
                        } catch (e) {
                            console.log('No products found or timeout waiting for selector.');
                            hasNextPage = false;
                            break;
                        }

                        // Extract data
                        const pageCards = await page.evaluate((catGame, sellerName) => {
                            const results: any[] = [];
                            const items = document.querySelectorAll('div.col-6.col-md-3.col-lg-3.mb-3');

                            items.forEach(item => {
                                try {
                                    // Title
                                    const titleEl = item.querySelector('a.cd.chp b');
                                    const title = titleEl ? titleEl.textContent?.trim() : '';

                                    // Link
                                    const linkEl = item.querySelector('a.cd.chp');
                                    const link = linkEl ? linkEl.getAttribute('href') : '';

                                    // Image
                                    // div[style*="background-image"] inside a.db.sabityuks
                                    const imgContainer = item.querySelector('a.db.sabityuks div[style*="background-image"]');
                                    let img = '';
                                    if (imgContainer) {
                                        const style = imgContainer.getAttribute('style') || '';
                                        const match = style.match(/url\(['"]?(.*?)['"]?\)/);
                                        if (match && match[1]) {
                                            img = match[1];
                                        }
                                    }

                                    // Price
                                    // Text node immediately following the a.cd.chp element
                                    let priceText = '';
                                    if (linkEl && linkEl.parentElement) {
                                        let nextNode = linkEl.nextSibling;
                                        while (nextNode) {
                                            if (nextNode.nodeType === 3) { // Text node
                                                priceText += nextNode.textContent;
                                            }
                                            nextNode = nextNode.nextSibling;
                                        }
                                    }

                                    if (title && link && priceText) {
                                        // Clean price
                                        // "1.299,00 TL"
                                        const cleanPrice = priceText.replace(/TL/g, '').replace(/KDV/g, '').replace(/Dahil/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
                                        const match = cleanPrice.match(/(\d+(\.\d+)?)/);
                                        const price = match ? parseFloat(match[0]) : 0;

                                        if (price > 0) {
                                            results.push({
                                                name: title,
                                                price: price,
                                                currency: 'TRY',
                                                seller_name: sellerName,
                                                game: catGame,
                                                image_url: img,
                                                product_url: link
                                            });
                                        }
                                    }
                                } catch (err) {
                                    // Ignore error for single item
                                }
                            });
                            return results;
                        }, category.game, this.name);

                        console.log(`Found ${pageCards.length} products on page ${pageNum}`);

                        if (pageCards.length === 0) {
                            hasNextPage = false;
                            break;
                        }

                        // Fix URLs
                        pageCards.forEach(c => {
                            if (c.image_url && !c.image_url.startsWith('http')) {
                                c.image_url = `https://www.carddunyasi.com${c.image_url}`;
                            }
                            if (c.product_url && !c.product_url.startsWith('http')) {
                                c.product_url = `https://www.carddunyasi.com${c.product_url}`;
                            }
                            cards.push(c);
                        });

                        // Check for next page
                        const hasNext = await page.evaluate((currentPage) => {
                            const nextLink = document.querySelector(`.pagination a[href*="page=${currentPage + 1}"]`);
                            return !!nextLink;
                        }, pageNum);

                        if (!hasNext) {
                            hasNextPage = false;
                        } else {
                            pageNum++;
                        }

                        if (pageNum > 50) hasNextPage = false;

                    } catch (error) {
                        console.error(`Error scraping page ${pageNum}:`, error);
                        hasNextPage = false;
                    }
                }
            }
        } finally {
            await browser.close();
        }

        return cards;
    }
}
