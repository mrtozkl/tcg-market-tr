import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { LemonCardsScraper } from '../lib/scraper/lemon-cards';

async function seed() {
    // Dynamic import for db
    const { sql } = await import('../lib/db');

    try {
        console.log('Starting seed...');

        const scraper = new LemonCardsScraper();
        const cards = await scraper.scrape();

        console.log(`Scraped ${cards.length} cards.`);

        if (cards.length === 0) {
            console.log('No cards found.');
            return;
        }

        let insertedCount = 0;
        let updatedCount = 0;

        for (const card of cards) {
            // Check if card exists by product_url
            const { rows } = await sql`SELECT id FROM cards WHERE product_url = ${card.product_url}`;

            if (rows.length > 0) {
                // Update
                await sql`
                    UPDATE cards 
                    SET price = ${card.price}, 
                        image_url = ${card.image_url}, 
                        last_updated = NOW()
                    WHERE product_url = ${card.product_url}
                `;
                updatedCount++;
            } else {
                // Insert
                await sql`
                    INSERT INTO cards (seller_name, game, name, price, currency, image_url, product_url)
                    VALUES (${card.seller_name}, ${card.game}, ${card.name}, ${card.price}, ${card.currency}, ${card.image_url}, ${card.product_url})
                `;
                insertedCount++;
            }
        }

        console.log(`Seed completed. Inserted: ${insertedCount}, Updated: ${updatedCount}`);
        process.exit(0);

    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
}

seed();
