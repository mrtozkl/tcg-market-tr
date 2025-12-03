import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('gizala.html', 'utf-8');
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
        href.toLowerCase().includes('pokemon') ||
        href.toLowerCase().includes('magic')
    )) {
        console.log(`Found category: ${text} -> ${href}`);
    }
});

console.log('Searching for product cards...');
// ShopPHP common selectors?
const productCards = $('.product-item, .productItem, .showcase, .urunkarti, .product-box, .item');
console.log(`Found ${productCards.length} potential product cards.`);

if (productCards.length > 0) {
    const first = productCards.first();
    console.log('First card HTML:', first.html()?.substring(0, 500));
    console.log('Classes:', first.attr('class'));
} else {
    console.log('Body HTML start:', $('body').html()?.substring(0, 1000));
}
