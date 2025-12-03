import { Card, Scraper } from './types';
import * as cheerio from 'cheerio';

export class OyunkurucuScraper implements Scraper {
    name = 'Oyun Kurucu';
    private baseUrl = 'https://oyunkurucu.com';
    private collectionUrl = '/collections/tcg';

    async scrape(): Promise<Card[]> {
        const allCards: Card[] = [];
        let page = 1;
        let hasMore = true;

        console.log(`\nScraping ${this.name}...`);

        while (hasMore) {
            try {
                const url = `${this.baseUrl}${this.collectionUrl}?page=${page}`;
                console.log(`Fetching page ${page}...`);

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const html = await response.text();
                const $ = cheerio.load(html);

                const productCards = $('a.ok-collection-slide');

                if (productCards.length === 0) {
                    hasMore = false;
                    console.log('No more products found.');
                    break;
                }

                console.log(`Found ${productCards.length} products on page ${page}`);

                productCards.each((_, elem) => {
                    const $card = $(elem);

                    // Check stock
                    if ($card.hasClass('sold-out')) {
                        return; // Skip sold out
                    }

                    const title = $card.find('.ok-collection-slide-title').text().trim();
                    const priceText = $card.find('.ok-collection-slide-desc').text().trim();
                    const href = $card.attr('href');
                    const vendor = $card.attr('data-filter') || '';

                    // Image
                    let imageUrl = $card.find('img').attr('src') || $card.find('img').attr('data-src');
                    if (imageUrl && imageUrl.startsWith('//')) {
                        imageUrl = 'https:' + imageUrl;
                    }

                    // Parse price: "3.699 TL" -> 3699.00
                    // Remove " TL" and dots (thousand separators), replace comma with dot
                    const cleanPrice = priceText
                        .replace(' TL', '')
                        .replace(/\./g, '') // Remove thousand separators
                        .replace(',', '.'); // Replace decimal separator

                    const price = parseFloat(cleanPrice);

                    if (title && price && href) {
                        const game = this.inferGame(vendor, title);

                        allCards.push({
                            seller_name: this.name,
                            game,
                            name: title,
                            price,
                            currency: 'TRY',
                            image_url: imageUrl || null,
                            product_url: `${this.baseUrl}${href}`
                        });
                    }
                });

                page++;
                // Safety break
                if (page > 50) hasMore = false;

                // Small delay
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                console.error(`Error scraping page ${page}:`, error);
                hasMore = false;
            }
        }

        return allCards;
    }

    private inferGame(vendor: string, name: string): string {
        const lowerVendor = (vendor || '').toLowerCase();
        const lowerName = (name || '').toLowerCase();

        // Check vendor first (most reliable)
        if (lowerVendor.includes('pokémon') || lowerVendor.includes('pokemon')) return 'Pokemon';
        if (lowerVendor.includes('magic') || lowerVendor.includes('mtg')) return 'Magic: The Gathering';
        if (lowerVendor.includes('disney') || lowerVendor.includes('lorcana')) return 'Lorcana';
        if (lowerVendor.includes('one piece')) return 'One Piece';
        if (lowerVendor.includes('yu-gi-oh') || lowerVendor.includes('yugioh')) return 'Yu-Gi-Oh!';
        if (lowerVendor.includes('flesh and blood')) return 'Flesh and Blood';
        if (lowerVendor.includes('star wars')) return 'Star Wars';
        if (lowerVendor.includes('altered')) return 'Altered';

        // Check name
        if (lowerName.includes('pokemon') || lowerName.includes('pokémon')) return 'Pokemon';
        if (lowerName.includes('magic') || lowerName.includes('mtg')) return 'Magic: The Gathering';
        if (lowerName.includes('lorcana')) return 'Lorcana';
        if (lowerName.includes('one piece')) return 'One Piece';
        if (lowerName.includes('yu-gi-oh') || lowerName.includes('yugioh')) return 'Yu-Gi-Oh!';

        return 'Other';
    }
}
