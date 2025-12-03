import { Card, Scraper } from './types';
import puppeteer from 'puppeteer';

export class CardHouseScraper implements Scraper {
    name = 'Card House';

    // Using specific subcategories to ensure we get products
    private categories = [
        { url: 'https://cardhouse.com.tr/pokemon', game: 'Pokemon' },
        { url: 'https://cardhouse.com.tr/magic', game: 'Magic: The Gathering' },
        { url: 'https://cardhouse.com.tr/yu-gi-oh-', game: 'Yu-Gi-Oh!' },
        { url: 'https://cardhouse.com.tr/one-piece', game: 'One Piece' }
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

            for (const category of this.categories) {
                console.log(`Processing category: ${category.game} (${category.url})`);
                let pageNum = 1;
                let hasNextPage = true;

                while (hasNextPage) {
                    const url = pageNum === 1 ? category.url : `${category.url}?page=${pageNum}`;
                    console.log(`Fetching ${url}...`);

                    try {
                        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

                        // Wait for products
                        try {
                            await page.waitForSelector('div.product-item', { timeout: 10000 });
                        } catch (e) {
                            console.log('No products found or timeout waiting for selector.');
                            hasNextPage = false;
                            break;
                        }

                        // Extract data
                        const pageCards = await page.evaluate((catGame, sellerName) => {
                            const results: any[] = [];
                            // Try specific class first, then generic
                            let items = Array.from(document.querySelectorAll('div.product-item'));
                            if (items.length === 0) {
                                // Fallback: look for generic product containers
                                // Ikas uses specific structure but classes might vary
                                // Look for links that contain images and are followed by price
                                const allLinks = Array.from(document.querySelectorAll('a'));
                                items = allLinks.filter(a => {
                                    const img = a.querySelector('img');
                                    const parent = a.parentElement;
                                    const text = parent?.innerText || '';
                                    return img && (text.includes('TL') || text.includes('₺'));
                                }).map(a => a.parentElement as Element);
                            }

                            items.forEach(item => {
                                try {
                                    // Title
                                    let title = '';
                                    const titleEl = item.querySelector('h3, h4, .product-title, .product-item__title');
                                    if (titleEl) title = titleEl.textContent?.trim() || '';

                                    // Link
                                    let link = '';
                                    const linkEl = item.querySelector('a');
                                    if (linkEl) link = linkEl.getAttribute('href') || '';

                                    // Image
                                    let img = '';
                                    const imgEl = item.querySelector('img');
                                    if (imgEl) {
                                        img = imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || imgEl.getAttribute('srcset') || '';
                                        if (img.includes(' ')) img = img.split(' ')[0]; // take first of srcset
                                    }

                                    // Price
                                    let priceText = '';
                                    const priceEl = item.querySelector('.price, .product-price, .product-item__price');
                                    if (priceEl) priceText = priceEl.textContent?.trim() || '';
                                    else {
                                        // Search text for price pattern
                                        const text = item.textContent || '';
                                        const match = text.match(/[\d\.,]+\s*(TL|₺)/);
                                        if (match) priceText = match[0];
                                    }

                                    // Stock check
                                    const soldOut = item.querySelector('.sold-out, .out-of-stock, .product-item__badge--sold-out');
                                    if (soldOut) return;

                                    if (title && link && priceText) {
                                        const cleanPrice = priceText.replace(/TL/g, '').replace(/₺/g, '').replace(/KDV/g, '').replace(/Dahil/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
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
                                    // Ignore
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
                                c.image_url = `https://cardhouse.com.tr${c.image_url}`;
                            }
                            if (c.product_url && !c.product_url.startsWith('http')) {
                                c.product_url = `https://cardhouse.com.tr${c.product_url}`;
                            }
                            cards.push(c);
                        });

                        // Check for next page
                        // Look for pagination link for next page
                        const hasNext = await page.evaluate((currentPage) => {
                            // Look for a link to page+1
                            // or "Next" button
                            // Ikas pagination usually has numbers and arrows
                            // Check for a link with ?page=X+1
                            const nextLink = document.querySelector(`a[href*="page=${currentPage + 1}"]`);
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
