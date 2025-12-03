import { Card, Scraper } from './types';
import * as cheerio from 'cheerio';

export class MegaCollectableScraper implements Scraper {
    name = 'Mega Collectable';
    private baseUrl = 'https://www.megacollectable.com';

    private categories = [
        { url: '/pokemon?list=stoktakiler', game: 'Pokemon' },
        { url: '/riftbound?siralama=en-yeniler&list=stoktakiler', game: 'Riftbound' }, // Mapping Riftbound to Other or specific if needed. Let's use 'Other' or keep as is if DB supports it. DB game column is text, so 'Riftbound' is fine.
        { url: '/star-wars-unlimited?siralama=en-yeniler&list=stoktakiler', game: 'Star Wars' },
        { url: '/naruto?siralama=en-yeniler&list=stoktakiler', game: 'Naruto' }
    ];

    async scrape(): Promise<Card[]> {
        const allCards: Card[] = [];

        console.log(`\nScraping ${this.name}...`);

        for (const category of this.categories) {
            console.log(`\nProcessing category: ${category.game} (${category.url})`);
            const categoryCards = await this.scrapeCategory(category.url, category.game);
            allCards.push(...categoryCards);
        }

        return allCards;
    }

    private async scrapeCategory(categoryUrl: string, game: string): Promise<Card[]> {
        const cards: Card[] = [];
        let currentUrl = `${this.baseUrl}${categoryUrl}`;
        // Ensure page parameter exists if not present, though the loop handles next links
        if (!currentUrl.includes('sayfa=')) {
            currentUrl += '&sayfa=1';
        }

        let hasMore = true;
        let page = 1;

        while (hasMore) {
            try {
                console.log(`Fetching page ${page}: ${currentUrl}`);

                const response = await fetch(currentUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const html = await response.text();
                const $ = cheerio.load(html);

                const productCards = $('.card-product-inner');
                console.log(`Found ${productCards.length} products on page ${page}`);

                if (productCards.length === 0) {
                    hasMore = false;
                    break;
                }

                productCards.each((_, elem) => {
                    const $card = $(elem);

                    // Title and Link
                    const linkElem = $card.find('a.c-p-i-link');
                    const title = linkElem.attr('title') || $card.find('.title').text().trim();
                    const href = linkElem.attr('href');

                    // Image
                    const imgElem = $card.find('.image-wrapper img');
                    const imageUrl = imgElem.attr('data-src') || imgElem.attr('src');

                    // Price
                    const priceElem = $card.find('.sale-price');
                    const priceText = priceElem.text().trim();

                    // Parse price: "7.999,00 TL" -> 7999.00
                    const rawPrice = priceText.replace('TL', '').trim();

                    let price = 0;
                    if (rawPrice) {
                        // Assume TR format: dot thousands, comma decimal
                        price = parseFloat(rawPrice.replace(/\./g, '').replace(',', '.'));
                    }

                    if (title && price && href) {
                        cards.push({
                            seller_name: this.name,
                            game: game,
                            name: title,
                            price,
                            currency: 'TRY',
                            image_url: imageUrl || null,
                            product_url: href.startsWith('http') ? href : `${this.baseUrl}${href}`
                        });
                    }
                });

                // Pagination
                // Look for the active page item and see if there's a next one
                const activePage = $('.pagination .page-item.active');
                const nextItem = activePage.next('.page-item');
                const nextLink = nextItem.find('a.page-link').attr('href');

                if (nextLink && nextLink !== 'javascript:;') {
                    console.log(`Found next page: ${nextLink}`);
                    currentUrl = nextLink;
                    page++;
                    // Add a small delay to be polite
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    console.log('No next page link found.');
                    hasMore = false;
                }

            } catch (error) {
                console.error(`Error scraping page ${page}:`, error);
                hasMore = false;
            }
        }

        return cards;
    }
}
