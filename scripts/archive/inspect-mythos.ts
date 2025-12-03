import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('mythos.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for product cards...');

// Need to identify the container. 
// Common classes: .product-card, .card, .item, .product-item
const productCards = $('.product-card, .card, .product-item, .item, .col-md-4, .col-sm-6');
console.log(`Found ${productCards.length} potential product cards.`);

if (productCards.length > 0) {
    const first = productCards.first();
    console.log('First card classes:', first.attr('class'));
    console.log('First card HTML:', first.html()?.substring(0, 500));

    // Try to find details
    const title = first.find('.product-title, .title, .name, h3, h4, h5').text().trim();
    const price = first.find('.price, .product-price, .amount').text().trim();
    const link = first.find('a').attr('href');
    const img = first.find('img');
    const imgSrc = img.attr('src') || img.attr('data-src');

    console.log('Title:', title);
    console.log('Price:', price);
    console.log('Link:', link);
    console.log('Image:', imgSrc);

    // Check for stock
    const isOutOfStock = first.text().toLowerCase().includes('out of stock') || first.find('.out-of-stock').length > 0;
    console.log('Is Out of Stock:', isOutOfStock);
} else {
    console.log('No product cards found. Dumping body start:');
    console.log($('body').html()?.substring(0, 1000));
}

// Check for pagination
const pagination = $('.pagination, .paging, .pages, .nav-links');
console.log('Pagination found:', pagination.length > 0);
if (pagination.length > 0) {
    console.log('Pagination HTML:', pagination.html()?.substring(0, 500));
}
