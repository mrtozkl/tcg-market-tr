import { Card, Scraper } from './types';

interface GraphQLProduct {
    name: string;
    id: string;
    metaData?: {
        slug?: string;
    };
    variants: Array<{
        prices: Array<{
            sellPrice: number;
            currencyCode?: string;
        }>;
        images?: Array<{
            id: string;
            fileName: string;
            isMain: boolean;
        }>;
    }>;
    categories?: Array<{
        name: string;
    }>;
}

export class LemonCardsScraper implements Scraper {
    name = 'Lemon Cards';
    private apiUrl = 'https://api.myikas.com/api/sf/graphql?op=searchProducts';
    private apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtIjoiODVmYTJjYmUtZWVjZC00Y2YzLWEwM2QtNTZkYWIxMTZmNjBmIiwic2YiOiIyNGFmZTU3My00MTFiLTQ1N2EtYmE2OS0wMzA0YjM4ODkyMmQiLCJzZnQiOjEsInNsIjoiZWMzYzhjODEtNGE4Yi00NzE5LTg0YmQtMzdjYjA0ZjE2Y2E3In0.okz4ETGSWNrnkvWMyP37OHDwc1tsTrIBi8C8jhDQ9bA';
    private salesChannelId = 'ec3c8c81-4a8b-4719-84bd-37cb04f16ca7';

    // All 7 category IDs
    private categories = [
        { id: '636a8643-7749-43c5-9f68-9c577519ca37', name: 'Tekli Kartlar', game: 'Other' },
        { id: 'b6454789-cf44-4036-b089-8be8610610e8', name: 'Pokemon TCG', game: 'Pokemon' },
        { id: 'b82bd086-bbf9-4123-a26e-4fdd80481a42', name: 'One Piece TCG', game: 'One Piece' },
        { id: '876ab14e-cee3-4637-bb8d-8e71f96ecbfc', name: 'Disney Lorcana', game: 'Lorcana' },
        { id: '346f3feb-18a7-4219-9c28-7fb5d8097193', name: 'YuGiOh TCG', game: 'Yu-Gi-Oh!' },
        { id: '7597fea8-237b-48c2-a7f9-8c6864d79726', name: 'Magic: The Gathering', game: 'Magic: The Gathering' },
        { id: 'c5b6c86f-aa8a-4e90-831a-f22520634841', name: 'WIXOSS', game: 'WIXOSS' }
    ];

    async scrape(): Promise<Card[]> {
        const allCards: Card[] = [];

        for (const category of this.categories) {
            console.log(`\nScraping category: ${category.name}`);
            const categoryCards = await this.scrapeCategory(category.id, category.game);
            allCards.push(...categoryCards);
            console.log(`  Total: ${categoryCards.length} cards from ${category.name}`);
        }

        console.log(`\nGrand total: ${allCards.length} cards`);
        return allCards;
    }

    private async scrapeCategory(categoryId: string, defaultGame: string): Promise<Card[]> {
        const allCards: Card[] = [];
        let page = 1;
        const perPage = 100; // Fetch 100 per page for efficiency
        let hasMore = true;

        while (hasMore) {
            try {
                const result = await this.fetchPage(categoryId, page, perPage);

                if (!result || !result.results || result.results.length === 0) {
                    hasMore = false;
                    break;
                }

                // Convert GraphQL products to Card format
                const pageCards = result.results.map((product: GraphQLProduct) => this.productToCard(product, defaultGame));
                allCards.push(...pageCards);

                console.log(`   Page ${page}: ${pageCards.length} cards (total so far: ${allCards.length}/${result.count})`);

                // Check if we've fetched all cards
                if (allCards.length >= result.count || result.results.length < perPage) {
                    hasMore = false;
                } else {
                    page++;
                    // Small delay to be respectful
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } catch (error) {
                console.error(`Error fetching page ${page}:`, error);
                hasMore = false;
            }
        }

        return allCards;
    }

    private async fetchPage(categoryId: string, page: number, perPage: number): Promise<any> {
        const query = `
            query searchProducts($input: SearchInput!) {
                searchProducts(input: $input) {
                    count
                    results {
                        name
                        id
                        metaData {
                            slug
                        }
                        variants {
                            prices {
                                sellPrice
                                currencyCode
                            }
                            images {
                                id
                                fileName
                                isMain
                            }
                        }
                        categories {
                            name
                        }
                    }
                }
            }
        `;

        const variables = {
            input: {
                locale: 'tr',
                page,
                perPage,
                categoryIdList: [categoryId],
                salesChannelId: this.salesChannelId,
                query: '',
                filterList: [],
                facetList: [],
                order: [],
                showStockOption: 'HIDE_OUT_OF_STOCK'  // Only get in-stock products
            }
        };

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey
            },
            body: JSON.stringify({ query, variables })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data?.searchProducts;
    }

    private productToCard(product: GraphQLProduct, defaultGame: string): Card {
        // Get first variant's price (products usually have 1 variant)
        const firstVariant = product.variants?.[0];
        const price = firstVariant?.prices?.[0]?.sellPrice || null;
        const currency = firstVariant?.prices?.[0]?.currencyCode || 'TRY';

        // Get main image with proper CDN URL construction
        const mainImage = firstVariant?.images?.find(img => img.isMain);
        let imageUrl: string | null = null;
        if (mainImage?.id && mainImage?.fileName) {
            // myikas CDN format: https://cdn.myikas.com/images/{merchantId}/{imageId}/{size}/{fileName}.{ext}
            const merchantId = '85fa2cbe-eecd-4cf3-a03d-56dab116f60f'; // Lemon Cards merchant ID
            const imageId = mainImage.id;
            const size = '1080'; // Default size
            // Determine file extension
            const ext = mainImage.fileName.includes('.') ? '' : '.webp'; // Default to webp if no extension
            imageUrl = `https://cdn.myikas.com/images/${merchantId}/${imageId}/${size}/${mainImage.fileName}${ext}`;
        }

        // Get product URL
        const slug = product.metaData?.slug || product.id;
        const productUrl = `https://lemoncards.com.tr/${slug}`;

        // Infer game from category or product name
        const game = this.inferGame(product.name, product.categories);

        return {
            seller_name: this.name,
            game: game || defaultGame,
            name: product.name,
            price,
            currency,
            image_url: imageUrl,
            product_url: productUrl
        };
    }

    private inferGame(name: string, categories?: Array<{ name: string }>): string {
        // First try from categories
        if (categories) {
            for (const cat of categories) {
                const catName = cat.name.toLowerCase();
                if (catName.includes('pokemon') || catName.includes('pokémon')) return 'Pokemon';
                if (catName.includes('magic') || catName.includes('mtg')) return 'Magic: The Gathering';
                if (catName.includes('one piece')) return 'One Piece';
                if (catName.includes('lorcana')) return 'Lorcana';
                if (catName.includes('yugioh') || catName.includes('yu-gi-oh')) return 'Yu-Gi-Oh!';
                if (catName.includes('wixoss')) return 'WIXOSS';
            }
        }

        // Fallback to name-based inference
        const lowerName = name.toLowerCase();
        if (lowerName.includes('pokemon') || lowerName.includes('pokémon')) return 'Pokemon';
        if (lowerName.includes('magic') || lowerName.includes('mtg')) return 'Magic: The Gathering';
        if (lowerName.includes('one piece')) return 'One Piece';
        if (lowerName.includes('lorcana')) return 'Lorcana';
        if (lowerName.includes('star wars')) return 'Star Wars';
        if (lowerName.includes('yugioh') || lowerName.includes('yu-gi-oh')) return 'Yu-Gi-Oh!';
        if (lowerName.includes('wixoss')) return 'WIXOSS';
        return 'Other';
    }
}
