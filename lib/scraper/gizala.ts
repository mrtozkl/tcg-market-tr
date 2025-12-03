import { Card, Scraper } from './types';
import * as cheerio from 'cheerio';

export class GizalaScraper implements Scraper {
    name = 'Gizala';

    private categories = [
        { url: 'https://gizala.com.tr/pokemon-kartlar-kat181.html', game: 'Pokemon' }
    ];

    async scrape(): Promise<Card[]> {
        const cards: Card[] = [];
        console.log(`\nScraping ${this.name}...`);

        for (const category of this.categories) {
            console.log(`Processing category: ${category.game}`);
            let page = 1;
            let hasNextPage = true;

            while (hasNextPage) {
                const url = `${category.url}?sayfa=${page}`;
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

                    const products = $('.homeproduct, .product-item');
                    console.log(`Found ${products.length} products on page ${page}`);

                    if (products.length === 0) {
                        hasNextPage = false;
                        break;
                    }

                    products.each((_, element) => {
                        const el = $(element);

                        // Stock check
                        // Check if "Sepete Ekle" exists
                        const addToCart = el.find('a:contains("Sepete Ekle")');
                        if (addToCart.length === 0) {
                            return;
                        }

                        const linkElem = el.find('h4 a');
                        const link = linkElem.attr('href');
                        const title = linkElem.text().trim() || el.find('.urunbaslik').text().trim();

                        // Image
                        const imgElem = el.find('img');
                        let img = imgElem.attr('src');
                        if (img && img.includes('phpThumb.php')) {
                            const match = img.match(/src=(.*?)&/);
                            if (match) {
                                img = decodeURIComponent(match[1]).replace('../../../', '/');
                            }
                        }

                        // Price parsing
                        // Format: "32,999 TL"
                        let priceText = el.find('.urunlistfiyat').text().trim();
                        if (!priceText) priceText = el.find('.fiyat').text().trim();
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
                                    image_url: img ? (img.startsWith('http') ? img : `https://gizala.com.tr${img}`) : '',
                                    product_url: link.startsWith('http') ? link : `https://gizala.com.tr${link}`
                                });
                            }
                        }
                    });

                    // Check if we should continue
                    // ShopPHP usually has a 'next' link or just stops showing products
                    const nextLink = $('.pagination a:contains("Sonraki"), .pagination a:contains("Next"), .pagination a[aria-label="Next"]');
                    if (nextLink.length === 0 && products.length < 12) {
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
