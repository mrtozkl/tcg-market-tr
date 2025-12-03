import { Card, Scraper } from './types';
import * as cheerio from 'cheerio';

export class ParalelEvrenScraper implements Scraper {
    name = 'Paralel Evren';

    private categories = [
        { url: 'https://paralelevren.istanbul/trading-card-games/pokemon', game: 'Pokemon' },
        { url: 'https://paralelevren.istanbul/trading-card-games/magic-the-gathering', game: 'Magic: The Gathering' }
    ];

    async scrape(): Promise<Card[]> {
        const cards: Card[] = [];
        console.log(`\nScraping ${this.name}...`);

        for (const category of this.categories) {
            console.log(`Processing category: ${category.game}`);
            let page = 1;
            let hasNextPage = true;

            while (hasNextPage) {
                // Try ?pg=X or ?page=X. Based on inspection, pagination might not be needed if only 1 page.
                // But let's assume ?pg=X is standard for .NET/Ticimax
                const url = page === 1 ? category.url : `${category.url}?pg=${page}`;
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

                    const products = $('.productItem, .productItem1, .productItemBlock');
                    console.log(`Found ${products.length} products on page ${page}`);

                    if (products.length === 0) {
                        hasNextPage = false;
                        break;
                    }

                    products.each((_, element) => {
                        const el = $(element);

                        // Stock check
                        // Check for "Sepete Ekle" button
                        const addToCart = el.find('button.basket-add');
                        if (addToCart.length === 0) {
                            return;
                        }

                        const title = el.find('.productItemTitle strong').text().trim() || el.find('[itemprop="name"]').text().trim();
                        const link = el.find('.productItemTitle a').attr('href') || el.find('a[itemprop="url"]').attr('href');
                        const img = el.find('.productItemImage img').attr('src') || el.find('[itemprop="image"]').attr('src');

                        // Price parsing
                        // Meta tag is reliable: <meta itemprop="price" content="2000.00">
                        let price = 0;
                        const metaPrice = el.find('meta[itemprop="price"]').attr('content');
                        if (metaPrice) {
                            price = parseFloat(metaPrice);
                        } else {
                            // Fallback to text
                            const priceText = el.find('.productPrice').text().trim();
                            price = this.parsePrice(priceText);
                        }

                        if (title && link && price > 0) {
                            cards.push({
                                name: title,
                                price: price,
                                currency: 'TRY',
                                seller_name: this.name,
                                game: category.game,
                                image_url: img ? (img.startsWith('http') ? img : `https://paralelevren.istanbul${img}`) : '',
                                product_url: link.startsWith('http') ? link : `https://paralelevren.istanbul${link}`
                            });
                        }
                    });

                    // Check if we should continue
                    // Look for pagination next button
                    const nextLink = $('.pagination a:contains("Sonraki"), .pagination a:contains("Next"), .pagination a[aria-label="Next"]');
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
