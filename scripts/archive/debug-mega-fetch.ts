import * as cheerio from 'cheerio';

async function debugFetch() {
    const url = 'https://www.megacollectable.com/pokemon?list=stoktakiler&sayfa=1';
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

        // Check for the class found by browser
        const links = $('a.c-p-i-link');
        console.log(`Found ${links.length} 'a.c-p-i-link' elements.`);

        if (links.length > 0) {
            const firstLink = links.first();
            console.log('First link href:', firstLink.attr('href'));

            // Get the container (parent of the link)
            // Based on previous run, container is .card-product-inner
            const container = firstLink.closest('.card-product-inner');
            console.log('Container class:', container.attr('class'));
            console.log('Container HTML:', container.html()); // Dump FULL HTML

            // Explicitly search for price-like text in container
            console.log('Container text:', container.text().replace(/\s+/g, ' ').trim());

            // Check if price is in a sibling of card-product-inner?
            // Maybe the card structure is:
            // .product-item
            //   .card-product-inner (image, title?)
            //   .price-container?
            const parent = container.parent();
            console.log('Parent class:', parent.attr('class'));
            console.log('Parent HTML:', parent.html()?.substring(0, 500));

        } else {
            console.log('Body HTML length:', html.length);
            // Dump some body to see what we got
            console.log('Body preview:', $('body').html()?.substring(0, 500));
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

debugFetch();
