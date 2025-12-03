import { GoblinStoreScraper } from '../lib/scraper/goblin-store';
import { GorillaScraper } from '../lib/scraper/gorilla';
import { MythosCardsScraper } from '../lib/scraper/mythos-cards';
import { OvergameScraper } from '../lib/scraper/overgame';

async function verify() {
    console.log('--- Verifying Fixes ---');

    // 1. Goblin Store
    console.log('\n[Goblin Store] Checking stock logic...');
    // We can't easily verify stock logic without an out-of-stock item, 
    // but we can check if it runs without errors.
    const goblin = new GoblinStoreScraper();
    // Mocking categories to just one for speed
    (goblin as any).categories = [{ url: '/product-category/pkm/', game: 'Pokemon' }];
    const goblinCards = await goblin.scrape();
    console.log(`Goblin Cards Found: ${goblinCards.length}`);

    // 2. Gorilla
    console.log('\n[Gorilla] Checking price parsing...');
    const gorilla = new GorillaScraper();
    (gorilla as any).categories = [{ url: '/urun-kategori/pokemon-kartlari/', game: 'Pokemon' }];
    const gorillaCards = await gorilla.scrape();
    console.log(`Gorilla Cards Found: ${gorillaCards.length}`);
    if (gorillaCards.length > 0) {
        console.log('Sample Gorilla Card:', gorillaCards[0]);
    }

    // 3. Mythos Cards
    console.log('\n[Mythos Cards] Checking image URLs...');
    const mythos = new MythosCardsScraper();
    // Mythos scraper scrapes a specific URL hardcoded, so we just run it.
    // It might take a while due to scrolling.
    // We'll trust the code change for now or run it fully if needed.
    // Let's skip full run to save time and just check code logic if possible, 
    // but running it is safer.
    // To speed up, we can modify the scraper to stop early, but let's just run it.
    const mythosCards = await mythos.scrape();
    console.log(`Mythos Cards Found: ${mythosCards.length}`);
    if (mythosCards.length > 0) {
        console.log('Sample Mythos Card Image:', mythosCards[0].image_url);
    }

    // 4. Overgame
    console.log('\n[Overgame] Checking stock logic...');
    const overgame = new OvergameScraper();
    (overgame as any).categories = [{ url: 'https://www.overgameweb.com/pop-kultur/koleksiyon/pokemon-oyun-kartlari', game: 'Pokemon' }];
    const overgameCards = await overgame.scrape();
    console.log(`Overgame Cards Found: ${overgameCards.length}`);
    if (overgameCards.length > 0) {
        console.log('Sample Overgame Card:', overgameCards[0]);
    }
}

verify().catch(console.error);
