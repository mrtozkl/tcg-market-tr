import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('overgame_cat.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Extracting products...');
const products = $('.productItem');
console.log(`Found ${products.length} products.`);

if (products.length > 0) {
    const first = products.first();

    const title = first.find('[itemprop="name"]').attr('content') || first.find('.productTitle').text().trim();
    const img = first.find('[itemprop="image"]').attr('content') || first.find('img').attr('data-src');
    const link = first.find('a.detailLink').attr('href') || first.find('a').attr('href');

    // Price might be in a specific container
    const priceNew = first.find('.productPrice .discountPrice').text().trim();
    const priceOld = first.find('.productPrice .regularPrice').text().trim();
    const price = priceNew || first.find('.currentPrice').text().trim() || first.text().match(/\d{1,3}(\.\d{3})*,\d{2}\s*TL/)?.[0];

    console.log('Title:', title);
    console.log('Image:', img);
    console.log('Link:', link);
    console.log('Price:', price);
}

// Pagination
const pagination = $('.pagination');
console.log('Pagination found:', pagination.length > 0);
if (pagination.length > 0) {
    const next = pagination.find('a.next');
    console.log('Next link:', next.attr('href'));
}
