import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('tcgsepeti_cat.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for product cards...');
// WooCommerce Blocks selectors
const products = $('.wc-block-grid__product, .product, .type-product');
console.log(`Found ${products.length} products.`);

if (products.length > 0) {
    const first = products.first();
    console.log('First card classes:', first.attr('class'));

    const title = first.find('.wc-block-grid__product-title, .woocommerce-loop-product__title, h2, h3').text().trim();
    const price = first.find('.wc-block-grid__product-price, .price').text().trim();
    const link = first.find('a').attr('href');
    const img = first.find('img').attr('src') || first.find('img').attr('data-src');

    console.log('Title:', title);
    console.log('Price:', price);
    console.log('Link:', link);
    console.log('Image:', img);
}

// Pagination
const pagination = $('.wc-block-pagination, .woocommerce-pagination, .pagination');
console.log('Pagination found:', pagination.length > 0);
if (pagination.length > 0) {
    console.log('Pagination HTML:', pagination.html()?.substring(0, 500));
}
