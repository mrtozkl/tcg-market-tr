import { Card, Scraper } from './types';
import * as cheerio from 'cheerio';

export class OvergameScraper implements Scraper {
    name = 'Overgame';

    private categories = [
        { url: 'https://www.overgameweb.com/pop-kultur/koleksiyon/pokemon-oyun-kartlari', game: 'Pokemon' },
        { url: 'https://www.overgameweb.com/magic-the-gathering', game: 'Magic: The Gathering' },
        { url: 'https://www.overgameweb.com/yu-gi-oh-oyun-kartlari', game: 'Yu-Gi-Oh!' }
    ];

    async scrape(): Promise<Card[]> {
        const cards: Card[] = [];
        console.log(`\nScraping ${this.name}...`);

        for (const category of this.categories) {
            console.log(`Processing category: ${category.game}`);
            let page = 1;
            let hasNextPage = true;

            while (hasNextPage) {
                const url = `${category.url}?pg=${page}`;
                console.log(`Fetching ${url}...`);

                try {
                    const response = await fetch(url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                        }
                    });

                    if (!response.ok) {
                        console.error(`Failed to fetch page ${page}: ${response.status}`);
                        break;
                    }

                    const html = await response.text();
                    const $ = cheerio.load(html);

                    const products = $('.productItem');
                    console.log(`Found ${products.length} products on page ${page}`);

                    if (products.length === 0) {
                        hasNextPage = false;
                        break;
                    }

                    products.each((_, element) => {
                        const el = $(element);

                        // Stock check
                        // Check schema.org availability
                        const availability = el.find('[itemprop="availability"]').attr('content');
                        if (availability && !availability.includes('InStock')) {
                            return;
                        }

                        // Fallback: Check for "Tükendi" text or .soldOut class
                        if (el.text().toLowerCase().includes('tükendi') || el.find('.soldOut').length > 0) {
                            return;
                        }

                        const title = el.find('[itemprop="name"]').attr('content') || el.find('.productTitle').text().trim();
                        const link = el.find('a.detailLink').attr('href') || el.find('a').attr('href');
                        const img = el.find('[itemprop="image"]').attr('content') || el.find('img').attr('data-src') || el.find('img').attr('src');

                        // Price parsing
                        // Format: "499\nTL" or "499,00 TL"
                        let priceText = el.find('.productPrice .discountPrice').text().trim();
                        if (!priceText) priceText = el.find('.currentPrice').text().trim();
                        if (!priceText) priceText = el.text().match(/\d{1,3}(\.\d{3})*,\d{2}\s*TL/)?.[0] || '';

                        if (title && link && priceText) {
                            const price = this.parsePrice(priceText);
                            if (price > 0) {
                                cards.push({
                                    name: title,
                                    price: price,
                                    currency: 'TRY',
                                    seller_name: this.name,
                                    game: category.game,
                                    image_url: img || '',
                                    product_url: link.startsWith('http') ? link : `https://www.overgameweb.com${link}`
                                });
                            }
                        }
                    });

                    // Check if we should continue
                    // If we found products, assume there might be a next page unless we know otherwise
                    // T-Soft usually returns empty product list if page is out of range
                    // But let's check if there is a 'next' button to be sure, or just rely on product count
                    const nextLink = $('.pagination a.next');
                    if (nextLink.length === 0 && products.length < 12) { // Assuming page size is at least 12
                        hasNextPage = false;
                    }

                    page++;
                    // Safety break
                    if (page > 50) hasNextPage = false;

                } catch (error) {
                    console.error(`Error scraping page ${page}:`, error);
                    hasNextPage = false;
                }
            }
        }

        return cards;
    }

    private parsePrice(priceText: string): number {
        try {
            // Remove TL, whitespace, dots (thousand separator)
            // "1.299,00 TL" -> "1299,00" -> "1299.00"
            const clean = priceText.replace('TL', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
            return parseFloat(clean);
        } catch (e) {
            return 0;
        }
    }
}
