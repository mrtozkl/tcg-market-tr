import { Card, Scraper } from './types';
import * as cheerio from 'cheerio';

export class PegasusOyuncakScraper implements Scraper {
    name = 'Pegasus Oyuncak';
    private baseUrl = 'https://www.pegasusoyuncak.com';

    private categories = [
        { url: '/urun-kategori/mtg/', game: 'Magic: The Gathering' },
        { url: '/urun-kategori/ygo/', game: 'Yu-Gi-Oh!' },
        { url: '/urun-kategori/pokemon/', game: 'Pokemon' },
        { url: '/urun-kategori/one-piece-tcg/', game: 'One Piece' },
        { url: '/urun-kategori/lorcana/', game: 'Lorcana' }
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

                // Exclude product-category (subcategories)
                const productCards = $('li.product.type-product');
                console.log(`Found ${productCards.length} products on page ${page}`);

                if (productCards.length === 0) {
                    hasMore = false;
                    break;
                }

                productCards.each((_, elem) => {
                    const $card = $(elem);

                    // Check stock
                    if ($card.hasClass('outofstock')) {
                        return;
                    }

                    const title = $card.find('.woocommerce-loop-product__title, .product-title, h2, h3').text().trim();

                    // Link: find first link that is NOT add-to-cart
                    let link = '';
                    $card.find('a').each((i, el) => {
                        const href = $(el).attr('href');
                        if (href && !href.includes('add-to-cart')) {
                            link = href;
                            return false; // break
                        }
                    });

                    // Image
                    const imgElem = $card.find('img');
                    const imageUrl = imgElem.attr('data-src') || imgElem.attr('src') || imgElem.attr('data-lazy-src');

                    // Price
                    // Handle range prices or sale prices
                    // Usually .price contains <ins>...</ins> for sale or just text
                    // We want the final price
                    let priceElem = $card.find('.price ins .amount');
                    if (priceElem.length === 0) {
                        priceElem = $card.find('.price .amount').last();
                    }

                    const priceText = priceElem.text().trim();

                    // Parse price: "₺ 892,50" -> 892.50
                    const rawPrice = priceText.replace('₺', '').replace('TL', '').trim();

                    let price = 0;
                    if (rawPrice) {
                        // Assume TR format: dot thousands, comma decimal
                        price = parseFloat(rawPrice.replace(/\./g, '').replace(',', '.'));
                    }

                    if (title && price && link) {
                        cards.push({
                            seller_name: this.name,
                            game: game,
                            name: title,
                            price,
                            currency: 'TRY',
                            image_url: imageUrl || null,
                            product_url: link
                        });
                    }
                });

                // Pagination
                const nextLink = $('.woocommerce-pagination .next').attr('href');
                if (nextLink) {
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
