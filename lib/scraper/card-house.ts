import * as fs from 'fs';
import { Card, Scraper } from './types';



interface GraphQLResponse {
    data: {
        searchProducts: {
            count: number;
            results: Array<{
                name: string;
                variants: Array<{
                    prices: Array<{
                        sellPrice: number;
                        currencyCode: string;
                    }>;
                    images: Array<{
                        id: string;
                        fileName: string;
                        isMain: boolean;
                    }>;
                }>;
                categories: Array<{
                    name: string;
                }>;
                metaData: {
                    slug: string;
                };
            }>;
        };
    };
}

export class CardHouseScraper implements Scraper {
    name = 'Card House';
    private apiUrl = 'https://api.myikas.com/api/sf/graphql?op=searchProducts';

    // Correct Merchant ID provided by user/JWT
    private merchantId = 'a768c6e9-b09d-4142-ba0e-9bad446bcc11';

    private categories = [
        { id: 'b6f81182-73ee-4418-bedd-963b0000f439', name: 'Pokemon' },
        { id: '87de62df-c4ff-4eff-ad47-4a0061443487', name: 'One Piece' },
        { id: '8143ab0c-1ef1-4cd0-9003-e3ea3dff517e', name: 'Yu-Gi-Oh!' },
        { id: 'd5ee17d0-44c9-4de8-a6b7-6a0f262f3c6c', name: 'Magic: The Gathering' },
        { id: '6f929434-a159-47f9-99a7-dd39a6581141', name: 'Sports Cards' },
        { id: 'e1e50e0d-226e-44bc-941e-4f9af939d8cb', name: 'Other' }
    ];

    private headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,tr;q=0.7",
        "content-type": "application/json",
        "x-api-key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtIjoiYTc2OGM2ZTktYjA5ZC00MTQyLWJhMGUtOWJhZDQ0NmJjYzExIiwic2YiOiJjMjZlY2Q0Ni01NGFmLTQ5NGMtOTIyYi0wZTVjYTUxNjg4OTYiLCJzZnQiOjEsInNsIjoiZTM3NzYyODUtZjdmZS00ZDBhLTkyY2UtNjEwMDY5ZWQ1NzFlIn0.83mZo1Tuy5V6Vex890f2pFwT7CQ98hR88DKUz6b2bSg",
        "x-jid": "474092f3-827f-41c7-950a-327d5ba35bb2",
        "x-sfid": "c26ecd46-54af-494c-922b-0e5ca5168896",
        "x-sfrid": "940f2616-383f-4381-8e53-3f9f72a092fa",
        "x-sid": "08b9f91b-f015-4720-b08c-5b528530e757",
        "x-timezone": "Europe/Istanbul",
        "x-vid": "03df617a-89be-4502-a662-e367f609e81d",
        "Referer": "https://cardhouse.com.tr/"
    };

    async scrape(): Promise<Card[]> {
        const allCards: Card[] = [];

        console.log(`\nScraping ${this.name}...`);

        for (const category of this.categories) {
            console.log(`\nProcessing category: ${category.name} (${category.id})`);
            const categoryCards = await this.scrapeCategory(category.id, category.name);
            allCards.push(...categoryCards);
        }

        return allCards;
    }

    private async scrapeCategory(categoryId: string, categoryName: string): Promise<Card[]> {
        const cards: Card[] = [];
        let page = 1;
        const perPage = 100; // Increased from 20 for efficiency
        let hasMore = true;

        while (hasMore) {
            try {
                console.log(`Fetching page ${page}...`);

                const query = `
                    query searchProducts ($input: SearchInput!) {
                        searchProducts (input: $input) {
                            count
                            results {
                                name
                                metaData { slug }
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
                                categories { name }
                            }
                        }
                    }
                `;

                const variables = {
                    input: {
                        locale: "tr",
                        page: page,
                        perPage: perPage,
                        filterList: [
                            {
                                id: "stock_status",
                                type: "STOCK_STATUS",
                                displayType: "BOX",
                                valueList: ["in-stock"]
                            }
                        ],
                        categoryIdList: [categoryId],
                        salesChannelId: "e3776285-f7fe-4d0a-92ce-610069ed571e",
                        order: [{ direction: "DESC", type: "CREATED_AT" }],
                        showStockOption: "SHOW_OUT_OF_STOCK_AT_END"
                    }
                };

                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify({ query, variables })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const json = await response.json() as GraphQLResponse;
                const results = json.data?.searchProducts?.results || [];

                if (results.length === 0) {
                    hasMore = false;
                    console.log('No more products found.');
                    break;
                }

                console.log(`Found ${results.length} products on page ${page}`);

                for (const product of results) {
                    const variant = product.variants[0];
                    if (!variant) continue;

                    const priceInfo = variant.prices[0];
                    if (!priceInfo) continue;

                    // Construct image URL
                    let imageUrl = null;
                    const mainImage = variant.images.find(img => img.isMain) || variant.images[0];

                    if (mainImage?.id) {
                        const imageId = mainImage.id;
                        // If fileName is present, use standard format
                        if (mainImage.fileName) {
                            const size = '1080';
                            const ext = mainImage.fileName.includes('.') ? '' : '.webp';
                            imageUrl = `https://cdn.myikas.com/images/${this.merchantId}/${imageId}/${size}/${mainImage.fileName}${ext}`;
                        } else {
                            // Fallback for null fileName (e.g. Lorcana cards)
                            // User provided example: .../image_3840.webp
                            imageUrl = `https://cdn.myikas.com/images/${this.merchantId}/${imageId}/image_3840.webp`;
                        }
                    }

                    // Product URL: https://cardhouse.com.tr/slug (no /urun/)
                    const productUrl = `https://cardhouse.com.tr/${product.metaData.slug}`;

                    cards.push({
                        seller_name: this.name,
                        game: categoryName === 'Other'
                            ? this.inferGame(product.name)
                            : categoryName,
                        name: product.name,
                        price: priceInfo.sellPrice,
                        currency: priceInfo.currencyCode || 'TRY',
                        image_url: imageUrl,
                        product_url: productUrl
                    });
                }

                if (results.length < perPage) {
                    hasMore = false;
                } else {
                    page++;
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

            } catch (error) {
                console.error(`Error scraping page ${page}:`, error);
                hasMore = false;
            }
        }

        return cards;
    }

    private inferGame(name: string): string {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('pokemon')) return 'Pokemon';
        if (lowerName.includes('magic') || lowerName.includes('mtg')) return 'Magic: The Gathering';
        if (lowerName.includes('lorcana')) return 'Lorcana';
        if (lowerName.includes('one piece')) return 'One Piece';
        if (lowerName.includes('yu-gi-oh')) return 'Yu-Gi-Oh!';
        if (lowerName.includes('nba') || lowerName.includes('topps') || lowerName.includes('panini')) return 'Sports Cards';
        return 'Other';
    }
}
