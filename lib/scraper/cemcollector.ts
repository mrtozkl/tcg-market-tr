import { Card, Scraper } from './types';
import * as cheerio from 'cheerio';

export class CemcollectorScraper implements Scraper {
    name = 'Cemcollector';

    private categories = [
        {
            // Search for all products in Pokemon category to avoid subcategory traversal
            url: 'https://cemcollector.com/?s=&post_type=product&product_cat=pokemon',
            game: 'Pokemon'
        }
    ];

    async scrape(): Promise<Card[]> {
        const cards: Card[] = [];
        console.log(`\nScraping ${this.name}...`);

        for (const category of this.categories) {
            console.log(`Processing category: ${category.game}`);
            let page = 1;
            let hasNextPage = true;

            while (hasNextPage) {
                // Pagination for search results usually uses &paged=X
                const url = page === 1 ? category.url : `${category.url}&paged=${page}`;
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

                    const products = $('.product, .type-product');
                    console.log(`Found ${products.length} products on page ${page}`);

                    if (products.length === 0) {
                        hasNextPage = false;
                        break;
                    }

                    products.each((_, element) => {
                        const el = $(element);

                        // Skip categories
                        if (el.hasClass('product-category')) {
                            return;
                        }

                        // Stock check
                        // WooCommerce uses 'instock' or 'outofstock' class
                        if (el.hasClass('outofstock')) {
                            return;
                        }

                        const title = el.find('.woocommerce-loop-product__title, h2, h3').text().trim();
                        const link = el.find('a').attr('href');
                        const img = el.find('img').attr('data-src') || el.find('img').attr('src');

                        // Price parsing
                        // Format: "$2,00 KDV Dahil" or "$2.00"
                        // We confirmed store currency is USD
                        let priceText = el.find('.price').text().trim();
                        // Remove "KDV Dahil" and "$"
                        // "2,00" -> 2.00

                        let price = 0;
                        if (priceText) {
                            // Extract numbers
                            // If it has "KDV Dahil", remove it
                            priceText = priceText.replace('KDV Dahil', '').replace('$', '').trim();
                            // If it has comma as decimal separator (Turkish style for USD?)
                            // The dump showed "$2,00". So comma is decimal.
                            priceText = priceText.replace(/\./g, '').replace(',', '.');
                            price = parseFloat(priceText);
                        }

                        if (title && link && price > 0) {
                            cards.push({
                                name: title,
                                price: price,
                                currency: 'USD', // Confirmed via wcAnalytics
                                seller_name: this.name,
                                game: category.game,
                                image_url: img || '',
                                product_url: link || ''
                            });
                        }
                    });

                    // Check if we should continue
                    const nextLink = $('.woocommerce-pagination a.next, .pagination a.next');
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
}
