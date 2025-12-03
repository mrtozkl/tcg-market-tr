import * as cheerio from 'cheerio';

async function debugGoblin() {
    console.log('\n--- Debugging Goblin Store ---');
    const url = 'https://www.goblin-store.com/product-category/pkm/';
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const html = await res.text();
        const $ = cheerio.load(html);

        const products = $('li.product.type-product');
        console.log(`Found ${products.length} products.`);

        products.slice(0, 5).each((i, el) => {
            const $el = $(el);
            const title = $el.find('.woocommerce-loop-product__title').text().trim();
            const isOutOfStock = $el.hasClass('outofstock');
            const hasBackorder = $el.hasClass('backorder'); // Check for backorder class
            const classes = $el.attr('class');
            console.log(`[${i}] ${title} | Classes: ${classes} | OutOfStock: ${isOutOfStock}`);
        });
    } catch (e) {
        console.error('Goblin error:', e);
    }
}

async function debugGorilla() {
    console.log('\n--- Debugging Gorilla ---');
    const url = 'https://www.gorillacustomcards.com/urun-kategori/pokemon-kartlari/';
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const html = await res.text();
        const $ = cheerio.load(html);

        const products = $('.electron-loop-product');
        console.log(`Found ${products.length} products.`);

        products.slice(0, 5).each((i, el) => {
            const $el = $(el);
            const title = $el.find('.product-name a').text().trim();

            // Log all price related elements
            const priceHtml = $el.find('.product-price').html();
            const priceText = $el.find('.product-price').text().trim();
            console.log(`[${i}] ${title} | Price Text: ${priceText} | Price HTML: ${priceHtml?.substring(0, 100)}...`);
        });
    } catch (e) {
        console.error('Gorilla error:', e);
    }
}

async function debugOvergame() {
    console.log('\n--- Debugging Overgame ---');
    const url = 'https://www.overgameweb.com/pop-kultur/koleksiyon/pokemon-oyun-kartlari';
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const html = await res.text();
        const $ = cheerio.load(html);

        const products = $('.productItem');
        console.log(`Found ${products.length} products.`);

        products.slice(0, 5).each((i, el) => {
            const $el = $(el);
            const title = $el.find('.productTitle').text().trim();
            const soldOutClass = $el.find('.soldOut').length > 0;
            const text = $el.text();
            const hasTukendi = text.toLowerCase().includes('tükendi');
            const stockBadge = $el.find('.stock-badge, .badge').text().trim(); // Guessing selectors

            console.log(`[${i}] ${title} | SoldOutClass: ${soldOutClass} | HasTukendi: ${hasTukendi} | Badge: ${stockBadge}`);
        });
    } catch (e) {
        console.error('Overgame error:', e);
    }
}

async function main() {
    await debugGoblin();
    await debugGorilla();
    await debugOvergame();
}

main();
