import { Card, Scraper } from './types';

interface ShopifyProduct {
    id: number;
    title: string;
    handle: string;
    variants: Array<{
        id: number;
        title: string;
        price: string;
        available: boolean;
    }>;
    images: Array<{
        src: string;
    }>;
    product_type: string;
}

interface ShopifyResponse {
    products: ShopifyProduct[];
}

export class SlabAndPackScraper implements Scraper {
    name = 'Slab and Pack';
    private baseUrl = 'https://slabandpack.com';

    private collections = [
        { handle: 'one-piece-tcg', game: 'One Piece' },
        { handle: 'pokemon-tcg-tum-urunler', game: 'Pokemon' }
    ];

    async scrape(): Promise<Card[]> {
        const allCards: Card[] = [];

        console.log(`\nScraping ${this.name}...`);

        for (const collection of this.collections) {
            console.log(`\nProcessing collection: ${collection.handle}`);
            const collectionCards = await this.scrapeCollection(collection.handle, collection.game);
            allCards.push(...collectionCards);
        }

        return allCards;
    }

    private async scrapeCollection(collectionHandle: string, game: string): Promise<Card[]> {
        const cards: Card[] = [];
        let page = 1;
        const limit = 250; // Max limit for Shopify
        let hasMore = true;

        while (hasMore) {
            try {
                console.log(`Fetching page ${page}...`);
                const url = `${this.baseUrl}/collections/${collectionHandle}/products.json?limit=${limit}&page=${page}`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const json = await response.json() as ShopifyResponse;
                const products = json.products || [];

                if (products.length === 0) {
                    hasMore = false;
                    console.log('No more products found.');
                    break;
                }

                console.log(`Found ${products.length} products on page ${page}`);

                for (const product of products) {
                    // Check if any variant is available
                    const availableVariant = product.variants.find(v => v.available);

                    if (!availableVariant) {
                        continue; // Skip if no stock
                    }

                    // Use the first available variant for price, or just the first one if we want to list it (but we filter stock)
                    // Since we filtered for available, use that one.
                    const variant = availableVariant;

                    const price = parseFloat(variant.price);
                    const imageUrl = product.images.length > 0 ? product.images[0].src : null;
                    const productUrl = `${this.baseUrl}/products/${product.handle}`;

                    cards.push({
                        seller_name: this.name,
                        game: game,
                        name: product.title,
                        price: price,
                        currency: 'TRY',
                        image_url: imageUrl,
                        product_url: productUrl
                    });
                }

                if (products.length < limit) {
                    hasMore = false;
                } else {
                    page++;
                    await new Promise(resolve => setTimeout(resolve, 500)); // Politeness delay
                }

            } catch (error) {
                console.error(`Error scraping page ${page}:`, error);
                hasMore = false;
            }
        }

        return cards;
    }
}
