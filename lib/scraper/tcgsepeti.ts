import { Card, Scraper } from './types';
import * as cheerio from 'cheerio';

export class TcgSepetiScraper implements Scraper {
    name = 'TcgSepeti';

    private categories = [
        { url: 'https://tcgsepeti.com/marka/pokemon/?orderby=price-desc&filter_stock_status=instock', game: 'Pokemon' },
        { url: 'https://tcgsepeti.com/marka/magic-the-gathering/?orderby=price-desc&filter_stock_status=instock', game: 'Magic: The Gathering' }
    ];

    async scrape(): Promise<Card[]> {
        const cards: Card[] = [];
        console.log(`\nScraping ${this.name}...`);

        for (const category of this.categories) {
            console.log(`Processing category: ${category.game}`);
            let page = 1;
            let hasNextPage = true;

            while (hasNextPage) {
                // Pagination: /page/X/?...
                // Need to insert /page/X/ before query params
                let url = category.url;
                if (page > 1) {
                    const parts = category.url.split('?');
                    // https://tcgsepeti.com/marka/pokemon/page/2/?...
                    url = `${parts[0]}page/${page}/?${parts[1]}`;
                }

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

                    // WooCommerce Blocks selectors
                    // Try multiple selectors
                    let products = $('.wc-block-grid__product, li.product, .type-product');
                    console.log(`Found ${products.length} products on page ${page}`);

                    if (products.length === 0) {
                        hasNextPage = false;
                        break;
                    }

                    products.each((_, element) => {
                        const el = $(element);

                        // Skip if it's the main container (sometimes .product is on body)
                        if (el.is('body') || el.hasClass('woocommerce-page')) {
                            return;
                        }

                        // Stock check
                        // WooCommerce uses 'instock' or 'outofstock' class
                        if (el.hasClass('outofstock')) {
                            return;
                        }

                        const title = el.find('.wc-block-grid__product-title, .woocommerce-loop-product__title, h2, h3').text().trim();
                        const link = el.find('a').attr('href');
                        const img = el.find('img').attr('src') || el.find('img').attr('data-src');

                        // Price parsing
                        // Format: "1.299,00 TL" or "1.299,00 ₺"
                        let priceText = el.find('.wc-block-grid__product-price, .price').text().trim();

                        // Handle price range or sale price
                        // Usually "Original price: ... Current price: ..."
                        // Or "<del>...</del> <ins>...</ins>"
                        const insPrice = el.find('ins .woocommerce-Price-amount').text().trim();
                        if (insPrice) {
                            priceText = insPrice;
                        }

                        let price = 0;
                        if (priceText) {
                            // Remove currency symbol and whitespace
                            const clean = priceText.replace(/[^\d,.]/g, '').replace(/\./g, '').replace(',', '.');
                            // If multiple prices (range), take the first one or handle it
                            // clean might be "1299.001000.00" if concatenated
                            // Let's use regex to find the last number (current price)
                            const matches = clean.match(/(\d+(\.\d+)?)/g);
                            if (matches && matches.length > 0) {
                                price = parseFloat(matches[matches.length - 1]);
                            }
                        }

                        if (title && link && price > 0) {
                            cards.push({
                                name: title,
                                price: price,
                                currency: 'TRY',
                                seller_name: this.name,
                                game: category.game,
                                image_url: img || '',
                                product_url: link || ''
                            });
                        }
                    });

                    // Check if we should continue
                    const nextLink = $('.wc-block-pagination-page--next, .woocommerce-pagination a.next, .pagination a.next');
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
