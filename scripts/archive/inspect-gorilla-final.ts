import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('gorilla.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for products with .electron-loop-product...');

const products = $('.electron-loop-product');
console.log(`Found ${products.length} products.`);

if (products.length > 0) {
    const first = products.first();

    const title = first.find('.product-name a').text().trim();
    const link = first.find('.product-name a').attr('href');
    const price = first.find('.product-price').text().trim();
    const img = first.find('.product-thumb img');
    const imgSrc = img.attr('data-lazy-src') || img.attr('src');

    console.log('Title:', title);
    console.log('Link:', link);
    console.log('Price:', price);
    console.log('Image:', imgSrc);
    console.log('Is out of stock?', first.hasClass('outofstock'));
}

// Check for pagination
const pagination = $('.woocommerce-pagination, .page-numbers');
console.log('Pagination found:', pagination.length > 0);
if (pagination.length > 0) {
    console.log('Pagination HTML:', pagination.html()?.substring(0, 500));

    // Check for next page link
    const next = pagination.find('.next');
    console.log('Next link:', next.attr('href'));
}
