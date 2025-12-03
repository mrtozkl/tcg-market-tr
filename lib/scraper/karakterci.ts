import { Card, Scraper } from './types';
import * as cheerio from 'cheerio';

export class KarakterciScraper implements Scraper {
    name = 'Karakterci';
    private baseUrl = 'https://www.karakterci.com';

    private categoryUrl = '/pokemon-kart?flt=Stok%20Durumu_Stokta%20var';

    async scrape(): Promise<Card[]> {
        const cards: Card[] = [];

        console.log(`\nScraping ${this.name}...`);
        console.log(`Fetching URL: ${this.baseUrl}${this.categoryUrl}`);

        try {
            const response = await fetch(`${this.baseUrl}${this.categoryUrl}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            const productContainers = $('.product-container');
            console.log(`Found ${productContainers.length} products.`);

            productContainers.each((_, elem) => {
                const $container = $(elem);

                const titleElem = $container.find('.product-name a');
                const title = titleElem.attr('title') || titleElem.text().trim();
                const href = titleElem.attr('href');

                const priceElem = $container.find('.current-price, .price, .product-price');
                const priceText = priceElem.text().trim();

                const imgElem = $container.find('.imgLink img');
                let imageUrl = imgElem.attr('data-src') || imgElem.attr('src');

                // Fix relative image URLs
                if (imageUrl && !imageUrl.startsWith('http')) {
                    if (imageUrl.startsWith('//')) {
                        imageUrl = 'https:' + imageUrl;
                    } else {
                        // Sometimes it might be relative to root
                        imageUrl = `${this.baseUrl}/${imageUrl.replace(/^\//, '')}`;
                    }
                }

                // Parse price
                // Remove currency symbol and whitespace
                const rawPrice = priceText.replace(' TL', '').replace('TL', '').trim();

                let price = 0;

                // Check for US format: 1,999.00 (comma thousands, dot decimal)
                // Regex: Ends with dot and 2 digits, and has commas before that
                if (rawPrice.match(/^[0-9,]+\.[0-9]{2}$/)) {
                    price = parseFloat(rawPrice.replace(/,/g, ''));
                }
                // Check for TR format: 1.999,00 (dot thousands, comma decimal)
                // Regex: Ends with comma and 2 digits
                else if (rawPrice.match(/^[0-9.]+,[0-9]{2}$/)) {
                    price = parseFloat(rawPrice.replace(/\./g, '').replace(',', '.'));
                }
                // Fallback: try to just keep numbers and the last separator as dot
                else {
                    // If it has both dot and comma
                    if (rawPrice.includes('.') && rawPrice.includes(',')) {
                        const lastDot = rawPrice.lastIndexOf('.');
                        const lastComma = rawPrice.lastIndexOf(',');

                        if (lastDot > lastComma) {
                            // Assumed US: 1,999.00
                            price = parseFloat(rawPrice.replace(/,/g, ''));
                        } else {
                            // Assumed TR: 1.999,00
                            price = parseFloat(rawPrice.replace(/\./g, '').replace(',', '.'));
                        }
                    } else {
                        // Only one separator or none
                        // If it has a comma, assume it's decimal (TR style or just decimal)
                        // If it has a dot, assume it's decimal (US style)
                        // This is ambiguous for "1.999" (could be nearly 2 or nearly 2000)
                        // But usually prices have decimals.

                        const clean = rawPrice.replace(',', '.');
                        price = parseFloat(clean);
                    }
                }

                if (title && price && href) {
                    cards.push({
                        seller_name: this.name,
                        game: 'Pokemon', // URL is specific to Pokemon
                        name: title,
                        price,
                        currency: 'TRY',
                        image_url: imageUrl || null,
                        product_url: `${this.baseUrl}${href}`
                    });
                }
            });

        } catch (error) {
            console.error('Error scraping Karakterci:', error);
        }

        return cards;
    }
}
