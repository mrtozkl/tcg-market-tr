import { Card, Scraper } from '../types';
import * as cheerio from 'cheerio';

export class KollektmanScraper implements Scraper {
    name = 'Kollektman';

    private categories = [
        { url: 'https://www.kollektman.com/kategori/pokemon-tcg', game: 'Pokemon' },
        { url: 'https://www.kollektman.com/kategori/magic-the-gathering', game: 'Magic: The Gathering' }
    ];

    async scrape(): Promise<Card[]> {
        const cards: Card[] = [];
        console.log(`\nScraping ${this.name}...`);

        for (const category of this.categories) {
            console.log(`Processing category: ${category.game}`);
            let page = 1;
            let hasNextPage = true;

            while (hasNextPage) {
                const url = page === 1 ? category.url : `${category.url}?tp=${page}`;
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

                    const products = $('.showcase, .productItem');
                    console.log(`Found ${products.length} products on page ${page}`);

                    if (products.length === 0) {
                        hasNextPage = false;
                        break;
                    }

                    products.each((_, element) => {
                        const el = $(element);

                        // Stock check
                        // IdeaSoft usually has 'sold-out' class or similar
                        // Or check if "Sepete Ekle" is present?
                        // Let's check for "Tükendi" text
                        if (el.text().toLowerCase().includes('tükendi')) {
                            return;
                        }

                        const title = el.find('.showcase-title, .product-title, .title').text().trim();
                        const link = el.find('a').attr('href');
                        const img = el.find('img').attr('data-src') || el.find('img').attr('src');

                        // Price parsing
                        // Format: "2.295,00 TL"
                        let priceText = el.find('.showcase-price-new, .price, .product-price').text().trim();
                        // Sometimes price is in .showcase-price-old if discounted? No, new is correct.

                        if (priceText) {
                            const price = this.parsePrice(priceText);
                            if (price > 0 && title && link) {
                                cards.push({
                                    name: title,
                                    price: price,
                                    currency: 'TRY',
                                    seller_name: this.name,
                                    game: category.game,
                                    image_url: img ? (img.startsWith('//') ? `https:${img}` : (img.startsWith('http') ? img : `https://www.kollektman.com${img}`)) : '',
                                    product_url: link.startsWith('http') ? link : `https://www.kollektman.com${link}`
                                });
                            }
                        }
                    });

                    // Check if we should continue
                    // IdeaSoft pagination usually has 'next' link or we can check if we found products
                    // If products < 12 (or whatever page size), stop
                    // But let's check pagination links
                    const nextLink = $('.pagination a:contains("Sonraki"), .paginate-content a:contains("Sonraki")');
                    // Or check if current page number < total pages (hard to parse)
                    // Or just rely on product count. IdeaSoft usually returns empty list or redirects if out of range?
                    // We verified ?tp=2 works.
                    // Let's assume if we found products, we try next page.
                    // But we need a stop condition.
                    // If products.length < 12, likely last page.
                    if (products.length < 12) {
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
