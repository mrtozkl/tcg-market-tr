import * as fs from 'fs';
import * as cheerio from 'cheerio';

const goblinHtml = fs.readFileSync('goblin_debug.html', 'utf-8');
const $g = cheerio.load(goblinHtml);
console.log('--- Goblin Analysis ---');
// Try finding any list item or div that looks like a product
const gProducts = $g('.product-type-simple, .product-type-variable, .type-product');
console.log(`Goblin products found: ${gProducts.length}`);
if (gProducts.length > 0) {
    const first = gProducts.first();
    console.log('First Goblin product classes:', first.attr('class'));
    console.log('Is OutOfStock:', first.hasClass('outofstock') || first.find('.outofstock').length > 0);
}

const overgameHtml = fs.readFileSync('overgame_debug.html', 'utf-8');
const $o = cheerio.load(overgameHtml);
console.log('\n--- Overgame Analysis ---');
const oProducts = $o('.productItem');
console.log(`Overgame products found: ${oProducts.length}`);
if (oProducts.length > 0) {
    const first = oProducts.first();
    console.log('First Overgame product HTML:', first.html()?.substring(0, 2000));
    console.log('Title (itemprop):', first.find('[itemprop="name"]').attr('content'));
    // Check for sold out in text or class
    console.log('Text content snippet:', first.text().substring(0, 200).replace(/\s+/g, ' '));
}
