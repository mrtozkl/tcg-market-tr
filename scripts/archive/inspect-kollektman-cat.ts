import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('kollektman_cat.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for product cards...');
// IdeaSoft common selectors
const products = $('.showcase, .product-item, .productItem');
console.log(`Found ${products.length} products.`);

if (products.length > 0) {
    const first = products.first();
    console.log('First card classes:', first.attr('class'));

    const title = first.find('.showcase-title, .product-title, .title').text().trim();
    const price = first.find('.showcase-price-new, .price, .product-price').text().trim();
    const link = first.find('a').attr('href');
    const img = first.find('img').attr('data-src') || first.find('img').attr('src');

    console.log('Title:', title);
    console.log('Price:', price);
    console.log('Link:', link);
    console.log('Image:', img);
}

// Pagination
const pagination = $('.pagination, .paginate-content');
console.log('Pagination found:', pagination.length > 0);
if (pagination.length > 0) {
    console.log('Pagination HTML:', pagination.html()?.substring(0, 500));
}
