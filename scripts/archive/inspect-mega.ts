import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('mega.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for product cards...');

// Common selectors for TR e-commerce sites
// Try to be more specific for product cards
const productCards = $('.showcase, .product-item, .product-box').filter((i, el) => {
    // Filter to ensure it has a price or title
    return $(el).find('.price, .product-price, .current-price, .money').length > 0;
});
console.log(`Found ${productCards.length} product cards with price.`);

if (productCards.length > 0) {
    const first = productCards.first();
    console.log('First card classes:', first.attr('class'));
    console.log('First card HTML:', first.html()?.substring(0, 1000));

    // Try to find details
    const title = first.find('.product-title, .title, .name, h3, h4, .showcase-title').text().trim();
    const price = first.find('.product-price, .price, .current-price, .money, .showcase-price-new').text().trim();
    const link = first.find('a').attr('href');
    const img = first.find('img');
    const imgSrc = img.attr('data-src') || img.attr('src');

    console.log('Title:', title);
    console.log('Price:', price);
    console.log('Link:', link);
    console.log('Image:', imgSrc);

    // Check for stock
    // Sometimes stock is indicated by a "Sold Out" badge or button
    console.log('Stock indicator:', first.find('.stock-status, .out-of-stock, .sold-out').text().trim());
} else {
    // Fallback: dump the first few .item elements to see what they are
    console.log('No products found with price filter. Dumping first 3 .item elements:');
    $('.item').slice(0, 3).each((i, el) => {
        console.log(`Item ${i}:`, $(el).html()?.substring(0, 300));
    });

    // Also check for .showcase (common in IdeaSoft/Ticimax)
    const showcases = $('.showcase');
    console.log(`Found ${showcases.length} .showcase elements.`);
    if (showcases.length > 0) {
        console.log('First showcase:', showcases.first().html()?.substring(0, 500));
    }
}

// Check for pagination
const pagination = $('.pagination, .paging, .pages');
console.log('Pagination found:', pagination.length > 0);
if (pagination.length > 0) {
    console.log('Pagination HTML:', pagination.html()?.substring(0, 500));
}
