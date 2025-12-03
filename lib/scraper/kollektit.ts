import { Card, Scraper } from './types';
import * as cheerio from 'cheerio';

export class KollektitScraper implements Scraper {
    name = 'Kollektit';
    private baseUrl = 'https://www.kollektit.co';

    // Categories provided by user
    private categories = [
        '/kategori/pokemon-tcg',
        '/kategori/one-piece-tcg',
        '/kategori/magic-the-gathering-tcg',
        '/kategori/yu-gi-oh-1'
    ];

    async scrape(): Promise<Card[]> {
        const allCards: Card[] = [];

        console.log(`\nScraping ${this.name}...`);

        for (const categoryUrl of this.categories) {
            console.log(`\nProcessing category: ${categoryUrl}`);
            const categoryCards = await this.scrapeCategory(categoryUrl);
            allCards.push(...categoryCards);
        }

        return allCards;
    }

    private async scrapeCategory(categoryUrl: string): Promise<Card[]> {
        const cards: Card[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            try {
                // Pagination format: ?tp=1, ?tp=2
                const url = `${this.baseUrl}${categoryUrl}?tp=${page}`;
                console.log(`Fetching page ${page}...`);

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const html = await response.text();
                const $ = cheerio.load(html);

                const productCards = $('.showcase');

                if (productCards.length === 0) {
                    hasMore = false;
                    console.log('No more products found.');
                    break;
                }

                console.log(`Found ${productCards.length} products on page ${page}`);

                let newProductsOnPage = 0;

                productCards.each((_, elem) => {
                    const $card = $(elem);

                    // Stock check
                    const addToCartBtn = $card.find('.add-to-cart-button');
                    if (addToCartBtn.length === 0) {
                        const text = $card.text().toLowerCase();
                        if (text.includes('tükendi') || text.includes('stokta yok')) {
                            return;
                        }
                        return;
                    }

                    const title = $card.find('.showcase-title a').attr('title') || $card.find('.showcase-title').text().trim();
                    const priceText = $card.find('.showcase-price-new').text().trim();
                    const href = $card.find('.showcase-image a').attr('href');

                    // Duplicate check using URL
                    const fullProductUrl = `${this.baseUrl}${href}`;
                    // We need a way to check global duplicates across pages for this category run
                    // But for breaking the loop, checking if we've seen this URL in the current run is enough
                    // We'll check against 'cards' array which holds all cards for this category so far
                    const isDuplicate = cards.some(c => c.product_url === fullProductUrl);

                    if (isDuplicate) {
                        return;
                    }

                    // Image
                    let imageUrl = $card.find('.showcase-image img').attr('src') || $card.find('.showcase-image img').attr('data-src');
                    if (imageUrl && imageUrl.startsWith('//')) {
                        imageUrl = 'https:' + imageUrl;
                    }

                    // Parse price
                    const cleanPrice = priceText
                        .replace(' ₺', '')
                        .replace(/\./g, '')
                        .replace(',', '.');

                    const price = parseFloat(cleanPrice);

                    if (title && price && href) {
                        const game = this.inferGame(categoryUrl, title);

                        cards.push({
                            seller_name: this.name,
                            game,
                            name: title,
                            price,
                            currency: 'TRY',
                            image_url: imageUrl || null,
                            product_url: fullProductUrl
                        });
                        newProductsOnPage++;
                    }
                });

                // If no new products were found on this page (and we found some cards), 
                // it means we are looping or seeing duplicates.
                if (newProductsOnPage === 0 && productCards.length > 0) {
                    console.log('No new products found on this page. Stopping pagination.');
                    hasMore = false;
                    break;
                }

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

        return cards;
    }

    private inferGame(categoryUrl: string, name: string): string {
        if (categoryUrl.includes('pokemon')) return 'Pokemon';
        if (categoryUrl.includes('magic')) return 'Magic: The Gathering';
        if (categoryUrl.includes('one-piece')) return 'One Piece';
        if (categoryUrl.includes('yu-gi-oh')) return 'Yu-Gi-Oh!';

        // Fallback to name check
        const lowerName = name.toLowerCase();
        if (lowerName.includes('pokemon')) return 'Pokemon';
        if (lowerName.includes('magic') || lowerName.includes('mtg')) return 'Magic: The Gathering';
        if (lowerName.includes('lorcana')) return 'Lorcana';
        if (lowerName.includes('one piece')) return 'One Piece';
        if (lowerName.includes('yu-gi-oh')) return 'Yu-Gi-Oh!';

        return 'Other';
    }
}
