import * as cheerio from 'cheerio';

async function debugFetch() {
    const url = 'https://www.gorillacustomcards.com/urun-kategori/pokemon-kartlari/';
    console.log(`Fetching ${url}...`);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const products = $('li.product');
        console.log(`Found ${products.length} products.`);

        if (products.length > 0) {
            const first = products.first();
            console.log('First product title:', first.find('.woocommerce-loop-product__title').text());
            console.log('First product price:', first.find('.price').text());
        } else {
            console.log('Body HTML length:', html.length);
            console.log('Body preview:', html.substring(0, 500));
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

debugFetch();
