import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('overgame.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for categories...');
const links = $('a');
links.each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href && (
        text.toLowerCase().includes('pokemon') ||
        text.toLowerCase().includes('magic') ||
        text.toLowerCase().includes('yu-gi-oh') ||
        text.toLowerCase().includes('kart') ||
        href.toLowerCase().includes('pokemon') ||
        href.toLowerCase().includes('magic')
    )) {
        console.log(`Found category: ${text} -> ${href}`);
    }
});

// Check for product cards on homepage
const productCards = $('.product-item, .product-box, .item, .card');
console.log(`Found ${productCards.length} potential product cards on homepage.`);
if (productCards.length > 0) {
    const first = productCards.first();
    console.log('First card HTML:', first.html()?.substring(0, 200));
}
