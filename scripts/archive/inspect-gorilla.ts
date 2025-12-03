import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('gorilla.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Is WooCommerce?', $('body').hasClass('woocommerce'));

const products = $('li.product');
console.log(`Found ${products.length} products.`);

if (products.length > 0) {
    const first = products.first();
    console.log('First product classes:', first.attr('class'));
    console.log('First product HTML:', first.html()?.substring(0, 500));

    const title = first.find('.woocommerce-loop-product__title').text();
    const price = first.find('.price').text();
    const link = first.find('a.woocommerce-LoopProduct-link').attr('href');
    const image = first.find('img').attr('src');

    console.log('Title:', title);
    console.log('Price:', price);
    console.log('Link:', link);
    console.log('Image:', image);

    // Check for stock status
    // WooCommerce usually adds 'outofstock' class to the li.product
    console.log('Is out of stock?', first.hasClass('outofstock'));

    // Check for "Add to cart" button text/class
    const button = first.find('.button');
    console.log('Button text:', button.text());
    console.log('Button href:', button.attr('href'));
}

const pagination = $('.woocommerce-pagination');
console.log('Pagination found:', pagination.length > 0);
if (pagination.length > 0) {
    console.log('Pagination HTML:', pagination.html()?.substring(0, 500));
}
