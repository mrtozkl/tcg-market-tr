import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('cuttlefish.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Searching for product cards...');

// Ticimax usually uses .product-item, .showcase, .product-box
const productCards = $('.product-item, .showcase, .product-box, .item, .productItem');
console.log(`Found ${productCards.length} potential product cards.`);

if (productCards.length > 0) {
    const first = productCards.first();
    console.log('First card classes:', first.attr('class'));
    console.log('First card HTML:', first.html()?.substring(0, 500));

    // Try to find details
    // Title might be in the 'title' attribute of the link
    const linkElem = first.find('a.detailLink');
    const title = linkElem.attr('title') || first.find('.productDetail .productTitle').text().trim();

    // Link is usually the 'a.detailLink'
    const link = linkElem.attr('href');

    // Image
    // Ticimax uses data-original for lazy loading
    const img = first.find('img');
    const imgSrc = img.attr('data-original') || img.attr('src');

    // Price
    // Price structure: 
    // <div class="productPrice">
    //    <div class="discountPrice">
    //       <span>₺300,00</span>
    //    </div>
    // </div>
    const price = first.find('.discountPrice span, .currentPrice, .product-price').first().text().trim();

    console.log('Title:', title);
    console.log('Price:', price);
    console.log('Link:', link);
    console.log('Image:', imgSrc);

    // Check for stock
    // Look for "Tükendi" or "Stokta Yok" text or specific class
    const isOutOfStock = first.find('.soldOut, .outOfStock').length > 0 || first.text().includes('Tükendi');
    console.log('Is Out of Stock:', isOutOfStock);
}

// Check for pagination
// Ticimax pagination usually in .productPager
const pagination = $('.productPager, .pagination, .paging');
console.log('Pagination found:', pagination.length > 0);
if (pagination.length > 0) {
    console.log('Pagination HTML:', pagination.html()?.substring(0, 500));
    // Check for next page link
    const nextLink = pagination.find('a.next').attr('href');
    console.log('Next Link:', nextLink);
}
