import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { Scraper } from '@/lib/scraper/types';
import { LemonCardsScraper } from '@/lib/scraper/lemon-cards';
import { GamelandScraper } from '@/lib/scraper/gameland';
import { CardHouseScraper } from '@/lib/scraper/card-house';
import { CemcollectorScraper } from '@/lib/scraper/cemcollector';
import { GizalaScraper } from '@/lib/scraper/gizala';
import { GoblinStoreScraper } from '@/lib/scraper/goblin-store';
import { GorillaScraper } from '@/lib/scraper/gorilla';
import { KarakterciScraper } from '@/lib/scraper/karakterci';
import { KollektitScraper } from '@/lib/scraper/kollektit';
import { KollektmanScraper } from '@/lib/scraper/kollektman';
import { LenoCardsScraper } from '@/lib/scraper/lenocards';
import { MegaCollectableScraper } from '@/lib/scraper/mega-collectable';
import { OvergameScraper } from '@/lib/scraper/overgame';
import { OyunkurucuScraper } from '@/lib/scraper/oyunkurucu';
import { ParalelEvrenScraper } from '@/lib/scraper/paralel-evren';
import { PegasusOyuncakScraper } from '@/lib/scraper/pegasus-oyuncak';
import { SlabAndPackScraper } from '@/lib/scraper/slab-and-pack';
import { StoreCuttlefishScraper } from '@/lib/scraper/store-cuttlefish';
import { TcgSepetiScraper } from '@/lib/scraper/tcgsepeti';

export const dynamic = 'force-dynamic'; // Prevent caching
export const maxDuration = 300; // 5 minutes timeout

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const specificScraper = searchParams.get('scraper');

        console.log('Starting card update...');

        // Map of slug -> Scraper class
        const scraperMap: Record<string, Scraper> = {
            'lemon': new LemonCardsScraper(),
            'gameland': new GamelandScraper(),
            'cardhouse': new CardHouseScraper(),
            'cemcollector': new CemcollectorScraper(),
            'gizala': new GizalaScraper(),
            'goblin': new GoblinStoreScraper(),
            'gorilla': new GorillaScraper(),
            'karakterci': new KarakterciScraper(),
            'kollektit': new KollektitScraper(),
            'kollektman': new KollektmanScraper(),
            'leno': new LenoCardsScraper(),
            'mega': new MegaCollectableScraper(),
            'overgame': new OvergameScraper(),
            'oyunkurucu': new OyunkurucuScraper(),
            'paralel': new ParalelEvrenScraper(),
            'pegasus': new PegasusOyuncakScraper(),
            'slab': new SlabAndPackScraper(),
            'cuttlefish': new StoreCuttlefishScraper(),
            'tcgsepeti': new TcgSepetiScraper(),
        };

        let scrapersToRun: Scraper[] = [];

        if (specificScraper) {
            const scraper = scraperMap[specificScraper.toLowerCase()];
            if (scraper) {
                scrapersToRun.push(scraper);
            } else {
                return NextResponse.json({
                    error: `Scraper '${specificScraper}' not found. Available: ${Object.keys(scraperMap).join(', ')}`
                }, { status: 400 });
            }
        } else {
            // If no specific scraper, run ALL (might timeout on Vercel free tier if too many)
            // Ideally, we should use a cron job for each or a queue.
            // For now, we'll add all of them.
            scrapersToRun = Object.values(scraperMap);
        }

        const stats: Record<string, any> = {};

        for (const scraper of scrapersToRun) {
            console.log(`Running scraper: ${scraper.name}`);
            try {
                const cards = await scraper.scrape();
                console.log(`Scraped ${cards.length} cards from ${scraper.name}`);

                if (cards.length > 0) {
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
                    stats[scraper.name] = { scraped: cards.length, inserted: insertedCount, updated: updatedCount };
                } else {
                    stats[scraper.name] = { scraped: 0, message: 'No cards found' };
                }
            } catch (err) {
                console.error(`Error running scraper ${scraper.name}:`, err);
                stats[scraper.name] = { error: 'Failed to scrape', details: String(err) };
            }
        }

        return NextResponse.json({
            message: 'Cards update completed',
            stats
        });

    } catch (error) {
        console.error('Error updating cards:', error);
        return NextResponse.json({ error: 'Failed to update cards' }, { status: 500 });
    }
}
