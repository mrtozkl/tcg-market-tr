import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { LemonCardsScraper } from '../lib/scraper/lemon-cards';

// Load env
const envPath = path.join(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

console.log('Loaded .env.local');

async function loadLemonCards() {
    const { db } = await import('../lib/db');

    console.log('Starting Lemon Cards load process...\n');

    // Fetch all cards
    console.log('Fetching cards via GraphQL API...');
    const scraper = new LemonCardsScraper();
    const cards = await scraper.scrape();
    console.log(`Fetched ${cards.length} total cards.\n`);

    // Deduplicate
    const cardMap = new Map();
    cards.forEach(card => {
        const key = card.product_url || card.name;
        if (!cardMap.has(key)) {
            cardMap.set(key, card);
        }
    });

    const uniqueCards = Array.from(cardMap.values());
    console.log(`Unique cards: ${uniqueCards.length}\n`);

    // Delete all existing Lemon Cards (to remove out-of-stock items)
    console.log('Removing old Lemon Cards from database...');
    const deleteResult = await db.query('DELETE FROM cards WHERE seller_name = $1', ['Lemon Cards']);
    console.log(`Deleted ${deleteResult.rowCount} old cards\n`);

    // Load into database
    console.log('Loading into database...');
    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const card of uniqueCards) {
        if (!card.price || card.price <= 0) {
            skippedCount++;
            continue;
        }

        try {
            const existing = await db.query(
                'SELECT id FROM cards WHERE product_url = $1',
                [card.product_url]
            );

            if (existing.rows.length > 0) {
                await db.query(
                    `UPDATE cards SET 
                        name = $1, game = $2, price = $3, currency = $4, 
                        seller_name = $5, image_url = COALESCE($6, image_url), 
                        last_updated = NOW()
                    WHERE product_url = $7`,
                    [card.name, card.game || 'Other', card.price, card.currency || 'TRY',
                    card.seller_name, card.image_url, card.product_url]
                );
                updatedCount++;
            } else {
                await db.query(
                    `INSERT INTO cards (name, game, price, currency, seller_name, image_url, product_url, last_updated)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
                    [card.name, card.game || 'Other', card.price, card.currency || 'TRY',
                    card.seller_name, card.image_url, card.product_url]
                );
                insertedCount++;
            }

            if ((insertedCount + updatedCount) % 100 === 0) {
                console.log(`  Processed: ${insertedCount + updatedCount} cards...`);
            }
        } catch (error) {
            console.error(`Error with card ${card.name}:`, error.message);
        }
    }

    console.log('\nLoad complete!');
    console.log(`  Inserted: ${insertedCount}`);
    console.log(`  Updated: ${updatedCount}`);
    console.log(`  Skipped: ${skippedCount}`);

    const countResult = await db.query('SELECT COUNT(*) FROM cards WHERE seller_name = $1', ['Lemon Cards']);
    console.log(`\nTotal Lemon Cards in database: ${countResult.rows[0].count}`);
}

loadLemonCards().catch(console.error);
