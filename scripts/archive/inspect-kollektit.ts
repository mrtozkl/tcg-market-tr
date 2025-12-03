import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('kollektit.html', 'utf-8');
const $ = cheerio.load(html);

// Try to find product cards
// Common selectors: .product-item, .product-card, .showcase
const selectors = ['.product-item', '.product-card', '.showcase', '.col-3', '.col-4', '.col-md-3', '.col-md-4', '.product-box'];
let productCards;

for (const selector of selectors) {
    const found = $(selector);
    if (found.length > 0) {
        console.log(`Found ${found.length} elements with selector: ${selector}`);
        productCards = found;
        break;
    }
}

if (productCards) {
    productCards.slice(0, 3).each((i, elem) => {
        console.log(`\n--- Card ${i} ---`);
        const $card = $(elem);

        // Title
        const title = $card.find('.product-title, .title, h3, h4, .name').text().trim();
        console.log('Title:', title);

        // Price
        const price = $card.find('.product-price, .price, .current-price, .money').text().trim();
        console.log('Price:', price);

        // Image
        const img = $card.find('img').attr('data-src') || $card.find('img').attr('src');
        console.log('Image:', img);

        // Link
        const href = $card.find('a').attr('href');
        console.log('Href:', href);

        // Stock
        const text = $card.text().replace(/\s+/g, ' ').trim();
        const isSoldOut = text.toLowerCase().includes('tükendi') || text.toLowerCase().includes('stokta yok');
        console.log('Is Sold Out (text):', isSoldOut);

        // Classes
        console.log('Classes:', $card.attr('class'));
    });
} else {
    console.log('No product cards found with common selectors.');
    // Dump some structure to help identify
    console.log($('body').html()?.substring(0, 1000));
}

// Check pagination
const pagination = $('.pagination, .page-list, .paging');
console.log(`\nPagination found: ${pagination.length}`);
if (pagination.length > 0) {
    console.log(pagination.html()?.substring(0, 500));
}
