import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('oyunkurucu.html', 'utf-8');
const $ = cheerio.load(html);

const productCards = $('a.ok-collection-slide');
console.log(`Found ${productCards.length} product cards`);

productCards.slice(0, 3).each((i, elem) => {
    console.log(`\n--- Card ${i} ---`);
    const $card = $(elem);

    console.log('Href:', $card.attr('href'));
    console.log('Data Filter:', $card.attr('data-filter'));

    // Title
    const title = $card.find('.ok-collection-slide-title').text().trim();
    console.log('Title:', title);

    // Price
    const price = $card.find('.ok-collection-slide-desc').text().trim();
    console.log('Price:', price);

    // Image
    const img = $card.find('img').attr('src') || $card.find('img').attr('data-src');
    console.log('Image:', img);

    // Stock - Check for "Tükendi" or badges
    const badge = $card.find('.badge, .card__badge').text().trim();
    console.log('Badge:', badge);

    const text = $card.text().replace(/\s+/g, ' ').trim();
    const isSoldOut = text.toLowerCase().includes('tükendi') || text.toLowerCase().includes('sold out') || $card.hasClass('sold-out');
    console.log('Is Sold Out (text/class):', isSoldOut);
});

// Check for pagination
const pagination = $('.pagination, .pages, .page-numbers, nav[role="navigation"]');
console.log(`\nPagination elements found: ${pagination.length}`);
if (pagination.length > 0) {
    console.log(pagination.html()?.substring(0, 200));
}

// Check for "Next" link
const nextLink = $('a:contains("Next"), a:contains("Sonraki"), a[rel="next"]');
console.log(`Next link found: ${nextLink.length}`);
if (nextLink.length > 0) {
    console.log('Next href:', nextLink.attr('href'));
}
