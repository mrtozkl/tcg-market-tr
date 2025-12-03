import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('goblin.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for product cards...');

// WooCommerce usually uses li.product
// Exclude product-category
const productCards = $('li.product.type-product');
console.log(`Found ${productCards.length} actual product cards.`);

if (productCards.length > 0) {
    const first = productCards.first();
    console.log('First card classes:', first.attr('class'));
    console.log('First card HTML:', first.html()?.substring(0, 500));

    // Try to find details
    const title = first.find('.woocommerce-loop-product__title, .product-title, h2, h3').text().trim();
    // Price often has nested spans, we want the text
    const price = first.find('.price').text().trim();
    const link = first.find('a.woocommerce-LoopProduct-link').attr('href');
    const img = first.find('img');
    const imgSrc = img.attr('data-src') || img.attr('src') || img.attr('data-lazy-src');

    console.log('Title:', title);
    console.log('Price:', price);
    console.log('Link:', link);
    console.log('Image:', imgSrc);

    // Check for stock
    // WooCommerce usually adds 'outofstock' class to the li.product
    const isOutOfStock = first.hasClass('outofstock');
    console.log('Is Out of Stock:', isOutOfStock);
} else {
    console.log('No actual products found. Dumping first li.product to see classes:');
    const firstLi = $('li.product').first();
    console.log('First li classes:', firstLi.attr('class'));
}

// Check for pagination
const pagination = $('.woocommerce-pagination');
console.log('Pagination found:', pagination.length > 0);
if (pagination.length > 0) {
    console.log('Pagination HTML:', pagination.html()?.substring(0, 500));
    // Check for next page link
    const nextLink = pagination.find('.next').attr('href');
    console.log('Next Link:', nextLink);
}
