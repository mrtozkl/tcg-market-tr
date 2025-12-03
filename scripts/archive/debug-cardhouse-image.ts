import { CardHouseScraper } from '../lib/scraper/card-house';
import * as fs from 'fs';

// Mock the scraper to just fetch one page of "Other" category where Lorcana might be
class DebugScraper extends CardHouseScraper {
    async debug(slug: string) {
        console.log('Debugging product:', slug);

        // We can't easily filter by slug in the API, so we have to fetch and find.
        // Lorcana is likely in "Other" category: e1e50e0d-226e-44bc-941e-4f9af939d8cb

        const categoryId = 'e1e50e0d-226e-44bc-941e-4f9af939d8cb';
        const query = `
            query searchProducts ($input: SearchInput!) {
                searchProducts (input: $input) {
                    results {
                        name
                        metaData { slug }
                        variants {
                            id
                            attributes { imageIds }
                            images {
                                id
                                fileName
                                isMain
                            }
                        }
                    }
                }
            }
        `;

        const variables = {
            input: {
                locale: "tr",
                page: 1,
                perPage: 100,
                categoryIdList: [categoryId],
                salesChannelId: "e3776285-f7fe-4d0a-92ce-610069ed571e",
                // Try to find it
                query: "Lorcana"
            }
        };

        const response = await fetch('https://api.myikas.com/api/sf/graphql?op=searchProducts', {
            method: 'POST',
            headers: (this as any).headers,
            body: JSON.stringify({ query, variables })
        });

        const json = await response.json();
        fs.writeFileSync('cardhouse_debug.json', JSON.stringify(json, null, 2));
        console.log('Dumped response to cardhouse_debug.json');

        const products = json.data?.searchProducts?.results || [];
        const target = products.find((p: any) => p.metaData.slug === slug);

        if (target) {
            console.log('Found target product:', JSON.stringify(target, null, 2));
        } else {
            console.log('Target product not found in search results.');
        }
    }
}

new DebugScraper().debug('lorcana-archazias-booster-pack');
