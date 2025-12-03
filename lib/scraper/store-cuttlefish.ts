import { Card, Scraper } from './types';
import * as cheerio from 'cheerio';

export class StoreCuttlefishScraper implements Scraper {
    name = 'Store Cuttlefish';
    private baseUrl = 'https://www.storecuttlefish.com';

    private categories = [
        { url: '/one-piece-tcg', game: 'One Piece' },
        { url: '/gundam-tcg', game: 'Gundam' },
        { url: '/magic-the-gathering', game: 'Magic: The Gathering' },
        { url: '/pokemon-tcg', game: 'Pokemon' },
        { url: '/yu-gi-oh-tcg', game: 'Yu-Gi-Oh!' }
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
        // Ticimax usually uses ?pg=1 for pagination
        if (!currentUrl.includes('?')) {
            currentUrl += '?pg=1';
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

                const productCards = $('.productItem');
                console.log(`Found ${productCards.length} products on page ${page}`);

                if (productCards.length === 0) {
                    hasMore = false;
                    break;
                }

                productCards.each((_, elem) => {
                    const $card = $(elem);

                    // Check stock
                    // Ticimax often has a specific class or text for out of stock
                    // Based on inspection, we check for "Tükendi" text or specific classes
                    const isOutOfStock = $card.find('.soldOut, .outOfStock').length > 0 || $card.text().includes('Tükendi');
                    if (isOutOfStock) {
                        return;
                    }

                    // Title and Link
                    const linkElem = $card.find('a.detailLink');
                    const title = linkElem.attr('title') || $card.find('.productDetail .productTitle').text().trim();
                    const href = linkElem.attr('href');

                    // Image
                    const imgElem = $card.find('img');
                    const imageUrl = imgElem.attr('data-original') || imgElem.attr('src');

                    // Price
                    // <div class="productPrice">
                    //    <div class="discountPrice">
                    //       <span>₺300,00</span>
                    //    </div>
                    // </div>
                    // Fallback to .currentPrice or .product-price
                    let priceElem = $card.find('.discountPrice span');
                    if (priceElem.length === 0) {
                        priceElem = $card.find('.currentPrice, .product-price').first();
                    }

                    const priceText = priceElem.text().trim();

                    // Parse price: "₺300,00" -> 300.00
                    const rawPrice = priceText.replace('₺', '').replace('TL', '').trim();

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
                // Ticimax usually has .productPager .next
                const nextLink = $('.productPager a.next, .pagination a.next').attr('href');

                if (nextLink && nextLink !== 'javascript:;') {
                    console.log(`Found next page: ${nextLink}`);
                    currentUrl = nextLink.startsWith('http') ? nextLink : `${this.baseUrl}${nextLink}`;
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
