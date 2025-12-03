// Load environment variables
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
    console.log('✅ Loaded .env.local');
}

import { GizalaScraper } from '../lib/scraper/gizala';

async function loadGizala() {
    // Dynamic import to ensure env vars are loaded first
    const { db } = await import('../lib/db');

    console.log('\n🚀 Starting Gizala load process...\n');

    // 1. Scrape
    const scraper = new GizalaScraper();
    const cards = await scraper.scrape();
    console.log(`\n✅ Fetched ${cards.length} in-stock cards.`);

    // 2. Deduplicate
    const cardMap = new Map();
    cards.forEach(card => {
        const key = card.product_url || card.name;
        if (!cardMap.has(key)) {
            cardMap.set(key, card);
        }
    });

    const uniqueCards = Array.from(cardMap.values());
    console.log(`🔍 Unique cards: ${uniqueCards.length}\n`);

    // 3. Database Update
    console.log('💾 Updating database...');

    // Delete old Gizala cards
    const deleteResult = await db.query('DELETE FROM cards WHERE seller_name = $1', ['Gizala']);
    console.log(`Deleted ${deleteResult.rowCount} old cards`);

    let insertedCount = 0;
    for (const card of uniqueCards) {
        try {
            await db.query(
                `INSERT INTO cards (name, game, price, currency, seller_name, image_url, product_url, last_updated)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
                [
                    card.name,
                    card.game,
                    card.price,
                    card.currency,
                    card.seller_name,
                    card.image_url,
                    card.product_url
                ]
            );
            insertedCount++;

            if (insertedCount % 50 === 0) process.stdout.write('.');
        } catch (error: any) {
            console.error(`Error inserting ${card.name}:`, error.message);
        }
    }

    console.log(`\n\n✅ Load complete! Inserted: ${insertedCount}`);

    const countResult = await db.query('SELECT COUNT(*) FROM cards WHERE seller_name = $1', ['Gizala']);
    console.log(`Total Gizala cards in DB: ${countResult.rows[0].count}`);
}

loadGizala().catch(console.error);
