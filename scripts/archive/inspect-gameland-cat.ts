import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('gameland_cat.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for product cards...');
// OpenCart common selectors
const products = $('.product-thumb, .product-layout');
console.log(`Found ${products.length} products.`);

if (products.length > 0) {
    const first = products.first();
    console.log('First card classes:', first.attr('class'));

    const title = first.find('.name a, h4 a, .caption h4 a').text().trim();
    const price = first.find('.price, .price-new').text().trim();
    const link = first.find('.name a, h4 a, .caption h4 a').attr('href');
    const img = first.find('img').attr('src');

    console.log('Title:', title);
    console.log('Price:', price);
    console.log('Link:', link);
    console.log('Image:', img);
}

// Pagination
const pagination = $('.pagination');
console.log('Pagination found:', pagination.length > 0);
if (pagination.length > 0) {
    console.log('Pagination HTML:', pagination.html()?.substring(0, 500));
}
