import { Card, Scraper } from './types';
import * as cheerio from 'cheerio';

export class GamelandScraper implements Scraper {
    name = 'Gameland';

    private categories = [
        { url: 'https://www.gameland.com.tr/pokemon-kart', game: 'Pokemon' }
    ];

    async scrape(): Promise<Card[]> {
        const cards: Card[] = [];
        console.log(`\nScraping ${this.name}...`);

        for (const category of this.categories) {
            console.log(`Processing category: ${category.game}`);
            let page = 1;
            let hasNextPage = true;

            while (hasNextPage) {
                const url = page === 1 ? category.url : `${category.url}?page=${page}`;
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

                    const products = $('.product-layout, .product-thumb');
                    console.log(`Found ${products.length} products on page ${page}`);

                    if (products.length === 0) {
                        hasNextPage = false;
                        break;
                    }

                    products.each((_, element) => {
                        const el = $(element);

                        // Stock check
                        // OpenCart usually doesn't show out of stock items or has a label
                        // Let's check for "Tükendi" or "Out of Stock"
                        if (el.text().toLowerCase().includes('tükendi') || el.text().toLowerCase().includes('out of stock')) {
                            return;
                        }

                        const title = el.find('.name a, h4 a, .caption h4 a').text().trim();
                        const link = el.find('.name a, h4 a, .caption h4 a').attr('href');
                        const img = el.find('img').attr('src');

                        // Price parsing
                        // Format: "9.062,50TL"
                        let priceText = el.find('.price-new').text().trim();
                        if (!priceText) priceText = el.find('.price').text().trim();

                        // Clean price text (remove tax info if present)
                        // "100 TL Ex Tax: 80 TL"
                        if (priceText.includes('Ex Tax')) {
                            priceText = priceText.split('Ex Tax')[0].trim();
                        }

                        if (priceText) {
                            const price = this.parsePrice(priceText);
                            if (price > 0 && title && link) {
                                cards.push({
                                    name: title,
                                    price: price,
                                    currency: 'TRY',
                                    seller_name: this.name,
                                    game: category.game,
                                    image_url: img ? (img.startsWith('http') ? img : `https://www.gameland.com.tr${img}`) : '',
                                    product_url: link.startsWith('http') ? link : `https://www.gameland.com.tr${link}`
                                });
                            }
                        }
                    });

                    // Check if we should continue
                    const nextLink = $('.pagination a.next, .pagination a:contains(">")');
                    if (nextLink.length === 0) {
                        hasNextPage = false;
                    } else {
                        page++;
                    }

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
