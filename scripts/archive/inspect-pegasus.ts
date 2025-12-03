import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('pegasus.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for product cards...');

// WooCommerce usually uses li.product
// Exclude product-category
const productCards = $('li.product.type-product');
console.log(`Found ${productCards.length} potential product cards.`);

if (productCards.length > 0) {
    const first = productCards.first();
    console.log('First card classes:', first.attr('class'));
    console.log('First card HTML:', first.html()?.substring(0, 500));

    // Try to find details
    const title = first.find('.woocommerce-loop-product__title, .product-title, h2, h3').text().trim();
    const price = first.find('.price').text().trim();

    // The first link was add-to-cart. We need the product detail link.
    // Usually wrapping the title or image.
    // Let's check the link wrapping the title
    let link = first.find('.woocommerce-loop-product__title a, .product-title a, h2 a, h3 a').attr('href');

    // If not found, check link wrapping image
    if (!link) {
        link = first.find('.product-image a, .product-img-wrap a').attr('href');
    }

    // If still not found, check any link that is NOT add-to-cart
    if (!link) {
        first.find('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && !href.includes('add-to-cart')) {
                link = href;
                return false; // break
            }
        });
    }

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
