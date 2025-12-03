import { Card, Scraper } from './types';

interface ShopifyProduct {
    id: number;
    title: string;
    handle: string;
    body_html: string;
    published_at: string;
    created_at: string;
    updated_at: string;
    vendor: string;
    product_type: string;
    tags: string[];
    variants: ShopifyVariant[];
    images: ShopifyImage[];
    options: any[];
}

interface ShopifyVariant {
    id: number;
    title: string;
    option1: string;
    option2: string | null;
    option3: string | null;
    sku: string;
    requires_shipping: boolean;
    taxable: boolean;
    featured_image: ShopifyImage | null;
    available: boolean;
    price: string;
    grams: number;
    compare_at_price: string | null;
    position: number;
    product_id: number;
    created_at: string;
    updated_at: string;
}

interface ShopifyImage {
    id: number;
    created_at: string;
    position: number;
    updated_at: string;
    product_id: number;
    variant_ids: number[];
    src: string;
    width: number;
    height: number;
}

export class LenoCardsScraper implements Scraper {
    name = 'Leno Cards';
    private baseUrl = 'https://lenocards.com.tr';

    async scrape(): Promise<Card[]> {
        const cards: Card[] = [];
        console.log(`\nScraping ${this.name} (Shopify JSON)...`);

        let page = 1;
        let hasNextPage = true;

        while (hasNextPage) {
            const url = `${this.baseUrl}/products.json?limit=250&page=${page}`;
            console.log(`Fetching ${url}...`);

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    console.error(`Failed to fetch page ${page}: ${response.status}`);
                    break;
                }

                const data = await response.json() as { products: ShopifyProduct[] };
                const products = data.products;

                if (!products || products.length === 0) {
                    hasNextPage = false;
                    break;
                }

                console.log(`Found ${products.length} products on page ${page}`);

                for (const product of products) {
                    // Filter by product type or tags if needed
                    // But we want all TCG cards.
                    // Let's check if it's a card game product.
                    // Tags often contain "Pokemon", "Magic", etc.
                    // Or check vendor/product_type.

                    const game = this.detectGame(product);
                    if (!game) continue;

                    // Iterate variants (e.g. different conditions or just the main item)
                    // Usually for cards, variants might be "Near Mint", "Played" etc. or just one variant.
                    // We'll take the first available variant or all available variants if they represent different items?
                    // Usually variants are same card different condition.
                    // We can list the cheapest available variant.

                    const availableVariants = product.variants.filter(v => v.available);
                    if (availableVariants.length === 0) continue;

                    // Find cheapest available variant
                    const cheapestVariant = availableVariants.reduce((prev, curr) => {
                        return parseFloat(curr.price) < parseFloat(prev.price) ? curr : prev;
                    });

                    const price = parseFloat(cheapestVariant.price);

                    // Image
                    let image = '';
                    if (product.images.length > 0) {
                        image = product.images[0].src;
                    }

                    if (price > 0) {
                        cards.push({
                            name: product.title,
                            price: price,
                            currency: 'TRY', // Shopify usually returns local currency, assuming TRY for lenocards.com.tr
                            seller_name: this.name,
                            game: game,
                            image_url: image,
                            product_url: `${this.baseUrl}/products/${product.handle}`
                        });
                    }
                }

                page++;
                // Safety break
                if (page > 50) hasNextPage = false;

            } catch (error) {
                console.error(`Error scraping page ${page}:`, error);
                hasNextPage = false;
            }
        }

        return cards;
    }

    private detectGame(product: ShopifyProduct): string {
        const text = (product.title + ' ' + product.product_type + ' ' + product.tags.join(' ')).toLowerCase();

        if (text.includes('pokemon')) return 'Pokemon';
        if (text.includes('magic') || text.includes('mtg')) return 'Magic: The Gathering';
        if (text.includes('yu-gi-oh') || text.includes('yugioh')) return 'Yu-Gi-Oh!';
        if (text.includes('one piece')) return 'One Piece';
        if (text.includes('lorcana')) return 'Lorcana';
        if (text.includes('star wars')) return 'Star Wars';

        // Default to Pokemon if unsure but looks like a card?
        // Or return empty string to skip.
        // Let's be safe and only include known games.
        return '';
    }
}
