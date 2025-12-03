import { Card, Scraper } from './types';
import * as cheerio from 'cheerio';

export class GorillaScraper implements Scraper {
    name = 'Gorilla Custom Cards';
    private baseUrl = 'https://www.gorillacustomcards.com';

    private categories = [
        { url: '/urun-kategori/pokemon-kartlari/', game: 'Pokemon' },
        { url: '/urun-kategori/wizards-magic-the-gathering-mtg-kartlari-ve-urunleri/', game: 'Magic: The Gathering' },
        { url: '/urun-kategori/one-piece-kartlari/', game: 'One Piece' },
        { url: '/urun-kategori/disney-lorcana-kartlari-ve-urunleri/', game: 'Lorcana' },
        { url: '/urun-kategori/topps-koleksiyon-kartlari/', game: 'Sports Cards' }, // Assuming Topps is mostly sports
        { url: '/urun-kategori/panini-kartlari-ve-urunleri/', game: 'Sports Cards' } // Assuming Panini is mostly sports
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

                const productCards = $('.electron-loop-product');
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

                    const titleElem = $card.find('.product-name a');
                    const title = titleElem.text().trim();
                    const productUrl = titleElem.attr('href');

                    // Image
                    const imgElem = $card.find('.product-thumb img');
                    const imageUrl = imgElem.attr('data-lazy-src') || imgElem.attr('src');

                    // Price
                    // Try to find sale price first (ins .amount), then regular price (.amount)
                    let priceElem = $card.find('.product-price ins .amount');
                    if (priceElem.length === 0) {
                        priceElem = $card.find('.product-price .amount').last(); // Use last one if multiple (e.g. range)
                    }

                    const priceText = priceElem.text().trim();

                    // Parse price: "1.785,77 ₺" or "2.100,90₺ KDV Dahil"
                    // Remove currency symbol, "KDV Dahil", "TL", and whitespace
                    const rawPrice = priceText
                        .replace('₺', '')
                        .replace('TL', '')
                        .replace(/KDV\s*Dahil/i, '') // Case insensitive remove
                        .trim();

                    let price = 0;
                    if (rawPrice) {
                        // Assume TR format: dot thousands, comma decimal
                        // "2.100,90" -> "2100.90"
                        price = parseFloat(rawPrice.replace(/\./g, '').replace(',', '.'));
                    }

                    if (title && price && productUrl) {
                        cards.push({
                            seller_name: this.name,
                            game: game,
                            name: title,
                            price,
                            currency: 'TRY',
                            image_url: imageUrl || null,
                            product_url: productUrl
                        });
                    }
                });

                // Pagination
                const pagination = $('.woocommerce-pagination, .page-numbers');
                const nextLink = pagination.find('.next').attr('href');

                if (nextLink) {
                    console.log(`Found next page: ${nextLink}`);
                    currentUrl = nextLink;
                    page++;
                    // Add a small delay to be polite
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    console.log('No next page link found.');
                    console.log('Pagination HTML:', pagination.html()?.substring(0, 200));
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
