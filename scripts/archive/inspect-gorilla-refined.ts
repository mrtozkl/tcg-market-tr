import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('gorilla.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for products with .product-inner...');

const products = $('.product-inner');
console.log(`Found ${products.length} products.`);

if (products.length > 0) {
    const first = products.first();
    console.log('First product HTML:', first.html()?.substring(0, 1000));

    const thumb = first.find('.product-thumb');
    const title = thumb.attr('title');
    const link = thumb.attr('href');
    const img = thumb.find('img');
    const imgSrc = img.attr('data-lazy-src') || img.attr('src');

    console.log('Title:', title);
    console.log('Link:', link);
    console.log('Image:', imgSrc);

    // Try to find price in siblings or parent
    // The .product-inner might be inside the li.product, and price might be sibling of inner?
    // Or price is inside inner?
    // Let's check the parent of product-inner
    const parent = first.parent();
    console.log('Parent tag:', parent.get(0)?.tagName);
    console.log('Parent class:', parent.attr('class'));

    // Check for price in the whole card (parent)
    const price = parent.find('.price').text();
    console.log('Price (from parent):', price);

    // Check for stock
    console.log('Is out of stock?', parent.hasClass('outofstock'));
}

const pagination = $('.woocommerce-pagination');
console.log('Pagination found:', pagination.length > 0);
if (pagination.length > 0) {
    console.log('Pagination HTML:', pagination.html()?.substring(0, 500));
}
