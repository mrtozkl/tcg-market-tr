import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('gizala_cat.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for product containers...');

// ShopPHP specific
const candidates = $('.urunkarti, .product-item, .item, .productItem');
console.log(`Found ${candidates.length} candidate elements.`);

if (candidates.length > 0) {
    const first = candidates.first();
    console.log('First candidate classes:', first.attr('class'));
    console.log('First candidate HTML:', first.html()?.substring(0, 500));
}

// Search for price text
const priceElements = $('*:contains("TL")').filter((i, el) => $(el).children().length === 0 && $(el).text().trim().length < 20);
console.log(`Found ${priceElements.length} price elements.`);

if (priceElements.length > 0) {
    const parent = priceElements.first().closest('div[class*="col"], div[class*="product"], div[class*="item"]');
    console.log('Parent of price element:', parent.attr('class'));
    console.log('Parent HTML:', parent.html()?.substring(0, 500));
}
